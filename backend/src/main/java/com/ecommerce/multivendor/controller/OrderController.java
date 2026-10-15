package com.ecommerce.multivendor.controller;

import com.ecommerce.multivendor.config.UserPrincipal;
import com.ecommerce.multivendor.dto.request.OrderRequest;
import com.ecommerce.multivendor.dto.request.OrderStatusRequest;
import com.ecommerce.multivendor.dto.response.OrderResponse;
import com.ecommerce.multivendor.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                @Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.create(principal.getId(), request));
    }

    @GetMapping
    public List<OrderResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return orderService.list(principal);
    }

    @GetMapping("/{id}")
    public OrderResponse detail(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return orderService.get(principal, id);
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(@AuthenticationPrincipal UserPrincipal principal,
                                      @PathVariable Long id,
                                      @Valid @RequestBody OrderStatusRequest request) {
        return orderService.updateStatus(principal, id, request.status());
    }
}
