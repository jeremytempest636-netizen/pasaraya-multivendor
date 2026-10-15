package com.ecommerce.multivendor.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Email wajib diisi") String email,
        @NotBlank(message = "Password wajib diisi") String password
) {
}
