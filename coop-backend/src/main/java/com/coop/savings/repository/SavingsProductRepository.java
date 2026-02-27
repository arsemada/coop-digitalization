package com.coop.savings.repository;

import com.coop.savings.entity.SavingsProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavingsProductRepository extends JpaRepository<SavingsProduct, Long> {

    List<SavingsProduct> findBySaccoId(Long saccoId);
}
