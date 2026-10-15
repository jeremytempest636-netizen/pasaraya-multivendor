package com.ecommerce.multivendor.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank(message = "Nama produk wajib diisi")
        @Size(max = 200, message = "Nama produk maksimal 200 karakter")
        String name,

        @Size(max = 4000, message = "Deskripsi maksimal 4000 karakter")
        String description,

        @NotNull(message = "Harga wajib diisi")
        @DecimalMin(value = "0.0", inclusive = false, message = "Harga harus lebih dari 0")
        @Digits(integer = 13, fraction = 2, message = "Format harga tidak valid")
        BigDecimal price,

        @NotNull(message = "Stok wajib diisi")
        @Min(value = 0, message = "Stok tidak boleh negatif")
        Integer stock,

        @Size(max = 1000, message = "URL gambar maksimal 1000 karakter")
        String imageUrl,

        Long categoryId
) {
}
