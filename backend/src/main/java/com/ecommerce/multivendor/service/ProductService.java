package com.ecommerce.multivendor.service;

import com.ecommerce.multivendor.dto.request.ProductRequest;
import com.ecommerce.multivendor.dto.response.CategoryResponse;
import com.ecommerce.multivendor.dto.response.PageResponse;
import com.ecommerce.multivendor.dto.response.ProductResponse;
import com.ecommerce.multivendor.exception.BadRequestException;
import com.ecommerce.multivendor.exception.ForbiddenException;
import com.ecommerce.multivendor.exception.ResourceNotFoundException;
import com.ecommerce.multivendor.model.Category;
import com.ecommerce.multivendor.model.Product;
import com.ecommerce.multivendor.model.Store;
import com.ecommerce.multivendor.repository.CategoryRepository;
import com.ecommerce.multivendor.repository.OrderItemRepository;
import com.ecommerce.multivendor.repository.ProductRepository;
import com.ecommerce.multivendor.repository.StoreRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final int MAX_PAGE_SIZE = 60;

    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    private final CategoryRepository categoryRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> search(String search, Long categoryId, Long storeId,
                                                String sort, int page, int size) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + escapeLike(search.trim().toLowerCase(Locale.ROOT)) + "%";
                predicates.add(cb.like(cb.lower(root.get("name")), pattern, '\\'));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (storeId != null) {
                predicates.add(cb.equal(root.get("store").get("id"), storeId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        PageRequest pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
                resolveSort(sort));

        Page<ProductResponse> result = productRepository.findAll(spec, pageable).map(ProductResponse::from);
        return PageResponse.of(result);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return ProductResponse.from(findProduct(id));
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listCategories() {
        return categoryRepository.findAllByOrderByNameAsc().stream().map(CategoryResponse::from).toList();
    }

    @Transactional
    public ProductResponse create(Long sellerUserId, ProductRequest request) {
        Store store = storeRepository.findByUserId(sellerUserId)
                .orElseThrow(() -> new BadRequestException("Buat toko terlebih dahulu sebelum menambah produk"));

        Product product = Product.builder().store(store).build();
        apply(product, request);
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long sellerUserId, Long id, ProductRequest request) {
        Product product = findOwnedProduct(sellerUserId, id);
        apply(product, request);
        return ProductResponse.from(product);
    }

    @Transactional
    public void delete(Long sellerUserId, Long id) {
        Product product = findOwnedProduct(sellerUserId, id);
        if (orderItemRepository.existsByProductId(id)) {
            throw new BadRequestException(
                    "Produk ini sudah pernah dipesan sehingga tidak dapat dihapus. Ubah stok menjadi 0 untuk menonaktifkannya.");
        }
        productRepository.delete(product);
    }

    // ---- helpers ----

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produk dengan ID " + id + " tidak ditemukan"));
    }

    private Product findOwnedProduct(Long sellerUserId, Long id) {
        Product product = findProduct(id);
        Store store = storeRepository.findByUserId(sellerUserId)
                .orElseThrow(() -> new ForbiddenException("Anda belum memiliki toko"));
        if (!product.getStore().getId().equals(store.getId())) {
            throw new ForbiddenException("Produk ini bukan milik toko Anda");
        }
        return product;
    }

    private void apply(Product product, ProductRequest request) {
        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new BadRequestException("Kategori tidak ditemukan"));
        }
        product.setName(request.name().trim());
        product.setDescription(blankToNull(request.description()));
        product.setPrice(request.price());
        product.setStock(request.stock());
        product.setImageUrl(blankToNull(request.imageUrl()));
        product.setCategory(category);
    }

    private static Sort resolveSort(String sort) {
        if (sort == null) {
            return newest();
        }
        return switch (sort) {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price").and(Sort.by(Sort.Direction.DESC, "id"));
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price").and(Sort.by(Sort.Direction.DESC, "id"));
            case "name" -> Sort.by(Sort.Direction.ASC, "name").and(Sort.by(Sort.Direction.DESC, "id"));
            default -> newest();
        };
    }

    private static Sort newest() {
        return Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id"));
    }

    private static String escapeLike(String s) {
        return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
