package com.ecommerce.multivendor.repository;

import com.ecommerce.multivendor.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("select p from Payment p where p.order.id = :orderId order by p.id desc")
    List<Payment> findByOrderIdLatestFirst(@Param("orderId") Long orderId);
}
