package com.ecommerce.multivendor.dto.response;

import com.ecommerce.multivendor.model.Store;

import java.time.Instant;

public record StoreResponse(
        Long id,
        String storeName,
        String description,
        String address,
        Instant createdAt
) {
    public static StoreResponse from(Store s) {
        return new StoreResponse(s.getId(), s.getStoreName(), s.getDescription(), s.getAddress(), s.getCreatedAt());
    }
}
