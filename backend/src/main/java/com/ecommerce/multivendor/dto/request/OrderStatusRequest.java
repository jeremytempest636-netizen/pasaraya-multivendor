package com.ecommerce.multivendor.dto.request;

import com.ecommerce.multivendor.model.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record OrderStatusRequest(
        @NotNull(message = "Status wajib diisi") OrderStatus status
) {
}
