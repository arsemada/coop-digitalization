package com.coop.reporting.repository;

import com.coop.reporting.entity.FinancialPeriod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FinancialPeriodRepository extends JpaRepository<FinancialPeriod, Long> {

    List<FinancialPeriod> findByInstitutionIdOrderByStartDateDesc(Long institutionId);
}
