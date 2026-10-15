package com.ecommerce.multivendor.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PaymentRequest(
        @NotNull(message = "orderId wajib diisi")
        Long orderId,

        @NotBlank(message = "Metode pembayaran wajib diisi")
        String paymentMethod
) {
}
