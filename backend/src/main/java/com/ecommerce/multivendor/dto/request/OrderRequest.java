package com.ecommerce.multivendor.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record OrderRequest(
        @NotBlank(message = "Alamat pengiriman wajib diisi")
        @Size(max = 1000, message = "Alamat pengiriman maksimal 1000 karakter")
        String shippingAddress,

        @NotEmpty(message = "Pesanan harus berisi minimal satu produk")
        @Valid
        List<OrderItemRequest> items
) {
}
