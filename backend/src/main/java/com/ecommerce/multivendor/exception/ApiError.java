package com.ecommerce.multivendor.exception;

import java.time.Instant;
import java.util.Map;

public record ApiError(
        int status,
        String message,
        Map<String, String> errors,
        String timestamp
) {
    public static ApiError of(int status, String message) {
        return new ApiError(status, message, null, Instant.now().toString());
    }

    public static ApiError of(int status, String message, Map<String, String> errors) {
        return new ApiError(status, message, errors, Instant.now().toString());
    }
}
