package com.ecommerce.multivendor.controller;

import com.ecommerce.multivendor.config.UserPrincipal;
import com.ecommerce.multivendor.dto.request.PaymentRequest;
import com.ecommerce.multivendor.dto.response.PaymentResponse;
import com.ecommerce.multivendor.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/simulate")
    public PaymentResponse simulate(@AuthenticationPrincipal UserPrincipal principal,
                                    @Valid @RequestBody PaymentRequest request) {
        return paymentService.simulate(principal.getId(), request);
    }
}
