package com.ecommerce.multivendor.dto.response;

import com.ecommerce.multivendor.model.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Pada tampilan seller, {@code items} dan {@code totalPrice} hanya mencakup
 * produk milik toko seller tersebut.
 */
public record OrderResponse(
        Long id,
        String customerName,
        BigDecimal totalPrice,
        OrderStatus status,
        String shippingAddress,
        Instant createdAt,
        List<OrderItemResponse> items,
        PaymentResponse payment
) {
}
