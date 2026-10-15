package com.ecommerce.multivendor.dto.response;

import com.ecommerce.multivendor.model.OrderItem;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long productId,
        String productName,
        String imageUrl,
        Long storeId,
        String storeName,
        Integer quantity,
        BigDecimal price,
        BigDecimal subtotal
) {
    public static OrderItemResponse from(OrderItem i) {
        var product = i.getProduct();
        return new OrderItemResponse(
                product.getId(),
                product.getName(),
                product.getImageUrl(),
                product.getStore().getId(),
                product.getStore().getStoreName(),
                i.getQuantity(),
                i.getPrice(),
                i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity()))
        );
    }
}
