package com.ecommerce.multivendor.repository;

import com.ecommerce.multivendor.model.Order;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("select o from Order o where o.customer.id = :customerId order by o.createdAt desc, o.id desc")
    List<Order> findByCustomer(@Param("customerId") Long customerId);

    @Query("select distinct o from Order o join o.items i " +
           "where i.product.store.id = :storeId order by o.createdAt desc, o.id desc")
    List<Order> findBySellerStore(@Param("storeId") Long storeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") Long id);
}
