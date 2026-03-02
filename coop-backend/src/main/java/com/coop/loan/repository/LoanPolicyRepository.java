package com.coop.loan.repository;

import com.coop.loan.entity.LoanPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoanPolicyRepository extends JpaRepository<LoanPolicy, Long> {

    Optional<LoanPolicy> findByInstitutionIdAndIsActiveTrue(Long institutionId);
}
