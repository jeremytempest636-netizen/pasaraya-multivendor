package com.ecommerce.multivendor.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Nama wajib diisi")
        @Size(max = 100, message = "Nama maksimal 100 karakter")
        String name,

        @NotBlank(message = "Email wajib diisi")
        @Email(message = "Format email tidak valid")
        @Size(max = 150, message = "Email maksimal 150 karakter")
        String email,

        @NotBlank(message = "Password wajib diisi")
        @Size(min = 8, max = 72, message = "Password minimal 8 karakter")
        String password,

        @NotBlank(message = "Role wajib diisi (CUSTOMER atau SELLER)")
        String role
) {
}
