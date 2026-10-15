package com.ecommerce.multivendor.controller;

import com.ecommerce.multivendor.config.UserPrincipal;
import com.ecommerce.multivendor.dto.request.StoreRequest;
import com.ecommerce.multivendor.dto.response.ProductResponse;
import com.ecommerce.multivendor.dto.response.StoreResponse;
import com.ecommerce.multivendor.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class SellerController {

    private final StoreService storeService;

    /** Publik: daftar toko untuk filter katalog. */
    @GetMapping
    public List<StoreResponse> list() {
        return storeService.listAll();
    }

    @PostMapping
    public ResponseEntity<StoreResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                @Valid @RequestBody StoreRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(storeService.create(principal.getId(), request));
    }

    @GetMapping("/me")
    public StoreResponse myStore(@AuthenticationPrincipal UserPrincipal principal) {
        return storeService.getMyStore(principal.getId());
    }

    @GetMapping("/my-products")
    public List<ProductResponse> myProducts(@AuthenticationPrincipal UserPrincipal principal) {
        return storeService.getMyProducts(principal.getId());
    }
}
