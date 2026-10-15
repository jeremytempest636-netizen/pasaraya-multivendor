package com.ecommerce.multivendor.dto.response;

import com.ecommerce.multivendor.model.Category;

public record CategoryResponse(Long id, String name) {

    public static CategoryResponse from(Category c) {
        return new CategoryResponse(c.getId(), c.getName());
    }
}
