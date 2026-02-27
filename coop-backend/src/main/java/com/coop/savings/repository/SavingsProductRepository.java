package com.coop.savings.repository;

import com.coop.savings.entity.SavingsCategory;
import com.coop.savings.entity.SavingsProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavingsProductRepository extends JpaRepository<SavingsProduct, Long> {

    List<SavingsProduct> findBySaccoId(Long saccoId);

    Optional<SavingsProduct> findBySaccoIdAndCategory(Long saccoId, SavingsCategory category);
}
