package com.ecommerce.multivendor.dto.response;

public record AuthResponse(
        String message,
        String token,
        String role,
        String email,
        String name
) {
}
