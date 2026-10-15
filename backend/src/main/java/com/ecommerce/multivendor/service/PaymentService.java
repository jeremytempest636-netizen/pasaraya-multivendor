package com.ecommerce.multivendor.service;

import com.ecommerce.multivendor.dto.request.PaymentRequest;
import com.ecommerce.multivendor.dto.response.PaymentResponse;
import com.ecommerce.multivendor.exception.BadRequestException;
import com.ecommerce.multivendor.exception.ForbiddenException;
import com.ecommerce.multivendor.exception.ResourceNotFoundException;
import com.ecommerce.multivendor.model.Order;
import com.ecommerce.multivendor.model.OrderStatus;
import com.ecommerce.multivendor.model.Payment;
import com.ecommerce.multivendor.model.PaymentStatus;
import com.ecommerce.multivendor.repository.OrderRepository;
import com.ecommerce.multivendor.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    /** Prefix nomor pembayaran simulasi per metode. Harus sama dengan frontend (lib/payment.ts). */
    private static final Map<String, String> PREFIXES = Map.of(
            "BCA_VA", "88801",
            "MANDIRI_VA", "88908",
            "BNI_VA", "8810",
            "GOPAY", "39358",
            "CREDIT_CARD", "40001"
    );

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    /**
     * Simulasi pembayaran: PENDING -> PAID, catat payment SUCCESS, hasilkan nomor VA simulasi.
     * Order dikunci agar pembayaran ganda dari klik/permintaan bersamaan tidak lolos.
     */
    @Transactional
    public PaymentResponse simulate(Long customerId, PaymentRequest request) {
        Order order = orderRepository.findByIdForUpdate(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Pesanan tidak ditemukan"));

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new ForbiddenException("Pesanan ini bukan milik Anda");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Pesanan tidak dalam status menunggu pembayaran");
        }

        String method = request.paymentMethod().trim().toUpperCase(Locale.ROOT);
        if (!PREFIXES.containsKey(method)) {
            throw new BadRequestException("Metode pembayaran tidak didukung. Pilihan: " + String.join(", ", PREFIXES.keySet()));
        }

        Payment payment = paymentRepository.save(Payment.builder()
                .order(order)
                .paymentMethod(method)
                .paymentStatus(PaymentStatus.SUCCESS)
                .transactionId("TRX-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase())
                .virtualAccountNumber(virtualAccountNumber(method, order.getId()))
                .paidAt(Instant.now())
                .build());

        order.setStatus(OrderStatus.PAID);
        return PaymentResponse.from(payment);
    }

    public static String virtualAccountNumber(String method, Long orderId) {
        return PREFIXES.get(method) + String.format("%010d", orderId);
    }
}
