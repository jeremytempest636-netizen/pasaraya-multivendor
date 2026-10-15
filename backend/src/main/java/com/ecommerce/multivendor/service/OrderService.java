package com.ecommerce.multivendor.service;

import com.ecommerce.multivendor.config.UserPrincipal;
import com.ecommerce.multivendor.dto.request.OrderItemRequest;
import com.ecommerce.multivendor.dto.request.OrderRequest;
import com.ecommerce.multivendor.dto.response.OrderItemResponse;
import com.ecommerce.multivendor.dto.response.OrderResponse;
import com.ecommerce.multivendor.dto.response.PaymentResponse;
import com.ecommerce.multivendor.exception.BadRequestException;
import com.ecommerce.multivendor.exception.ForbiddenException;
import com.ecommerce.multivendor.exception.ResourceNotFoundException;
import com.ecommerce.multivendor.model.*;
import com.ecommerce.multivendor.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final PaymentRepository paymentRepository;

    /**
     * Membuat pesanan: validasi stok, hitung total dari harga di database
     * (bukan dari klien), kurangi stok, status awal PENDING.
     * Seluruh proses satu transaksi, sehingga stok kembali bila ada item yang gagal.
     */
    @Transactional
    public OrderResponse create(Long customerId, OrderRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Pengguna tidak ditemukan"));

        // Gabungkan item duplikat; TreeMap mengurutkan id produk agar urutan penguncian konsisten (hindari deadlock).
        Map<Long, Integer> quantities = new TreeMap<>();
        for (OrderItemRequest item : request.items()) {
            quantities.merge(item.productId(), item.quantity(), Integer::sum);
        }

        Order order = Order.builder()
                .customer(customer)
                .status(OrderStatus.PENDING)
                .shippingAddress(request.shippingAddress().trim())
                .totalPrice(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (Map.Entry<Long, Integer> entry : quantities.entrySet()) {
            Product product = productRepository.findByIdForUpdate(entry.getKey())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Produk dengan ID " + entry.getKey() + " tidak ditemukan"));

            int qty = entry.getValue();
            if (product.getStock() < qty) {
                throw new BadRequestException("Stok tidak mencukupi untuk \"" + product.getName()
                        + "\" (tersisa " + product.getStock() + ")");
            }

            product.setStock(product.getStock() - qty);
            order.getItems().add(OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(qty)
                    .price(product.getPrice())
                    .build());
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(qty)));
        }

        order.setTotalPrice(total);
        return toResponse(orderRepository.save(order), null);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> list(UserPrincipal principal) {
        if (principal.getRole() == Role.ROLE_SELLER) {
            return storeRepository.findByUserId(principal.getId())
                    .map(store -> orderRepository.findBySellerStore(store.getId()).stream()
                            .map(o -> toResponse(o, store.getId()))
                            .toList())
                    .orElse(List.of());
        }
        return orderRepository.findByCustomer(principal.getId()).stream()
                .map(o -> toResponse(o, null))
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse get(UserPrincipal principal, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pesanan tidak ditemukan"));

        if (principal.getRole() == Role.ROLE_SELLER) {
            Long storeId = requireSellerStoreId(principal);
            if (!containsStore(order, storeId)) {
                throw new ForbiddenException("Pesanan ini tidak berisi produk toko Anda");
            }
            return toResponse(order, storeId);
        }

        requireOwner(order, principal);
        return toResponse(order, null);
    }

    /**
     * Transisi yang diizinkan:
     * customer : PENDING -> CANCELLED (stok dikembalikan), SHIPPED -> COMPLETED
     * seller   : PAID -> SHIPPED
     */
    @Transactional
    public OrderResponse updateStatus(UserPrincipal principal, Long orderId, OrderStatus target) {
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pesanan tidak ditemukan"));

        Long sellerStoreId = null;

        if (principal.getRole() == Role.ROLE_CUSTOMER) {
            requireOwner(order, principal);
            boolean cancel = order.getStatus() == OrderStatus.PENDING && target == OrderStatus.CANCELLED;
            boolean complete = order.getStatus() == OrderStatus.SHIPPED && target == OrderStatus.COMPLETED;
            if (!cancel && !complete) {
                throw new BadRequestException("Perubahan status dari " + order.getStatus() + " ke " + target + " tidak diperbolehkan");
            }
            if (cancel) {
                restock(order);
            }
        } else if (principal.getRole() == Role.ROLE_SELLER) {
            sellerStoreId = requireSellerStoreId(principal);
            if (!containsStore(order, sellerStoreId)) {
                throw new ForbiddenException("Pesanan ini tidak berisi produk toko Anda");
            }
            if (order.getStatus() != OrderStatus.PAID || target != OrderStatus.SHIPPED) {
                throw new BadRequestException("Seller hanya dapat mengirim pesanan yang sudah dibayar");
            }
        } else {
            throw new ForbiddenException("Anda tidak memiliki akses ke pesanan ini");
        }

        order.setStatus(target);
        return toResponse(order, sellerStoreId);
    }

    // ---- helpers ----

    private void restock(Order order) {
        order.getItems().stream()
                .sorted(Comparator.comparing(i -> i.getProduct().getId()))
                .forEach(item -> {
                    Product product = productRepository.findByIdForUpdate(item.getProduct().getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Produk tidak ditemukan"));
                    product.setStock(product.getStock() + item.getQuantity());
                });
    }

    private void requireOwner(Order order, UserPrincipal principal) {
        if (!order.getCustomer().getId().equals(principal.getId())) {
            throw new ForbiddenException("Pesanan ini bukan milik Anda");
        }
    }

    private Long requireSellerStoreId(UserPrincipal principal) {
        return storeRepository.findByUserId(principal.getId())
                .map(Store::getId)
                .orElseThrow(() -> new ForbiddenException("Anda belum memiliki toko"));
    }

    private boolean containsStore(Order order, Long storeId) {
        return order.getItems().stream().anyMatch(i -> i.getProduct().getStore().getId().equals(storeId));
    }

    /** @param sellerStoreId bila diisi, hanya item milik toko tersebut yang disertakan. */
    private OrderResponse toResponse(Order order, Long sellerStoreId) {
        List<OrderItem> items = order.getItems().stream()
                .filter(i -> sellerStoreId == null || i.getProduct().getStore().getId().equals(sellerStoreId))
                .toList();

        BigDecimal total = sellerStoreId == null
                ? order.getTotalPrice()
                : items.stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        PaymentResponse payment = paymentRepository.findByOrderIdLatestFirst(order.getId()).stream()
                .findFirst()
                .map(PaymentResponse::from)
                .orElse(null);

        return new OrderResponse(
                order.getId(),
                order.getCustomer().getName(),
                total,
                order.getStatus(),
                order.getShippingAddress(),
                order.getCreatedAt(),
                items.stream().map(OrderItemResponse::from).toList(),
                payment
        );
    }
}
