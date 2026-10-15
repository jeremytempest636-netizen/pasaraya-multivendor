package com.ecommerce.multivendor.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StoreRequest(
        @NotBlank(message = "Nama toko wajib diisi")
        @Size(max = 120, message = "Nama toko maksimal 120 karakter")
        String storeName,

        @Size(max = 2000, message = "Deskripsi maksimal 2000 karakter")
        String description,

        @NotBlank(message = "Alamat toko wajib diisi")
        @Size(max = 1000, message = "Alamat maksimal 1000 karakter")
        String address
) {
}
