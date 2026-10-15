package com.ecommerce.multivendor.repository;

import com.ecommerce.multivendor.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Long> {

    Optional<Store> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<Store> findAllByOrderByStoreNameAsc();
}
