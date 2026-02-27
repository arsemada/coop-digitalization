package com.coop.loan.repository;

import com.coop.loan.entity.Loan;
import com.coop.loan.entity.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByMemberId(Long memberId);

    List<Loan> findBySaccoId(Long saccoId);

    List<Loan> findBySaccoIdAndStatus(Long saccoId, LoanStatus status);
}
