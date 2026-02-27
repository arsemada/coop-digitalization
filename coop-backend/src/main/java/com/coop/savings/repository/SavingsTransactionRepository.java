package com.coop.savings.repository;

import com.coop.savings.entity.SavingsTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SavingsTransactionRepository extends JpaRepository<SavingsTransaction, Long> {

    List<SavingsTransaction> findByMemberSavingsAccountIdOrderByTransactionDateDesc(Long accountId, org.springframework.data.domain.Pageable pageable);

    List<SavingsTransaction> findByMemberSavingsAccountIdAndTransactionDateBetween(Long accountId, LocalDate start, LocalDate end);
}
