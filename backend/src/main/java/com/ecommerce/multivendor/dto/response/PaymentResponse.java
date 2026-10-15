package com.ecommerce.multivendor.dto.response;

import com.ecommerce.multivendor.model.Payment;
import com.ecommerce.multivendor.model.PaymentStatus;

import java.time.Instant;

public record PaymentResponse(
        Long id,
        Long orderId,
        String paymentMethod,
        PaymentStatus paymentStatus,
        String transactionId,
        String virtualAccountNumber,
        Instant paidAt
) {
    public static PaymentResponse from(Payment p) {
        return new PaymentResponse(
                p.getId(),
                p.getOrder().getId(),
                p.getPaymentMethod(),
                p.getPaymentStatus(),
                p.getTransactionId(),
                p.getVirtualAccountNumber(),
                p.getPaidAt()
        );
    }
}
