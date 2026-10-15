package com.ecommerce.multivendor.controller;

import com.ecommerce.multivendor.config.UserPrincipal;
import com.ecommerce.multivendor.dto.request.ProductRequest;
import com.ecommerce.multivendor.dto.response.CategoryResponse;
import com.ecommerce.multivendor.dto.response.PageResponse;
import com.ecommerce.multivendor.dto.response.ProductResponse;
import com.ecommerce.multivendor.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/api/products")
    public PageResponse<ProductResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return productService.search(search, categoryId, storeId, sort, page, size);
    }

    @GetMapping("/api/products/{id}")
    public ProductResponse detail(@PathVariable Long id) {
        return productService.getById(id);
    }

    @PostMapping("/api/products")
    public ResponseEntity<ProductResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                  @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(principal.getId(), request));
    }

    @PutMapping("/api/products/{id}")
    public ProductResponse update(@AuthenticationPrincipal UserPrincipal principal,
                                  @PathVariable Long id,
                                  @Valid @RequestBody ProductRequest request) {
        return productService.update(principal.getId(), id, request);
    }

    @DeleteMapping("/api/products/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        productService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/categories")
    public List<CategoryResponse> categories() {
        return productService.listCategories();
    }
}
