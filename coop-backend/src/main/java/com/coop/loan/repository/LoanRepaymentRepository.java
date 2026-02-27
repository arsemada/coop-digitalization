package com.coop.loan.repository;

import com.coop.loan.entity.LoanRepayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanRepaymentRepository extends JpaRepository<LoanRepayment, Long> {

    List<LoanRepayment> findByLoanIdOrderByPaymentDateDesc(Long loanId);
}
