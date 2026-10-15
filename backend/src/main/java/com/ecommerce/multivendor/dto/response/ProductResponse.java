package com.ecommerce.multivendor.dto.response;

import com.ecommerce.multivendor.model.Product;

import java.math.BigDecimal;
import java.time.Instant;

public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Integer stock,
        String imageUrl,
        Long categoryId,
        String categoryName,
        Long storeId,
        String storeName,
        String storeDescription,
        String storeAddress,
        Instant createdAt
) {
    public static ProductResponse from(Product p) {
        var store = p.getStore();
        var category = p.getCategory();
        return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getStock(),
                p.getImageUrl(),
                category != null ? category.getId() : null,
                category != null ? category.getName() : null,
                store.getId(),
                store.getStoreName(),
                store.getDescription(),
                store.getAddress(),
                p.getCreatedAt()
        );
    }
}
