package com.ecommerce.multivendor.service;

import com.ecommerce.multivendor.dto.request.StoreRequest;
import com.ecommerce.multivendor.dto.response.ProductResponse;
import com.ecommerce.multivendor.dto.response.StoreResponse;
import com.ecommerce.multivendor.exception.BadRequestException;
import com.ecommerce.multivendor.exception.ResourceNotFoundException;
import com.ecommerce.multivendor.model.Store;
import com.ecommerce.multivendor.model.User;
import com.ecommerce.multivendor.repository.ProductRepository;
import com.ecommerce.multivendor.repository.StoreRepository;
import com.ecommerce.multivendor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public StoreResponse create(Long userId, StoreRequest request) {
        if (storeRepository.existsByUserId(userId)) {
            throw new BadRequestException("Anda sudah memiliki toko");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Pengguna tidak ditemukan"));

        Store store = storeRepository.save(Store.builder()
                .user(user)
                .storeName(request.storeName().trim())
                .description(blankToNull(request.description()))
                .address(request.address().trim())
                .build());
        return StoreResponse.from(store);
    }

    @Transactional(readOnly = true)
    public StoreResponse getMyStore(Long userId) {
        return StoreResponse.from(requireStore(userId));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getMyProducts(Long userId) {
        Store store = requireStore(userId);
        return productRepository.findByStoreIdOrderByCreatedAtDesc(store.getId())
                .stream().map(ProductResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<StoreResponse> listAll() {
        return storeRepository.findAllByOrderByStoreNameAsc().stream().map(StoreResponse::from).toList();
    }

    private Store requireStore(Long userId) {
        return storeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Toko belum dibuat"));
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
