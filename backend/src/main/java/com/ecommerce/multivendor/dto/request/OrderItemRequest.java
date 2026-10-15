package com.ecommerce.multivendor.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record OrderItemRequest(
        @NotNull(message = "productId wajib diisi")
        Long productId,

        @NotNull(message = "Jumlah wajib diisi")
        @Min(value = 1, message = "Jumlah minimal 1")
        @Max(value = 999, message = "Jumlah maksimal 999")
        Integer quantity
) {
}
