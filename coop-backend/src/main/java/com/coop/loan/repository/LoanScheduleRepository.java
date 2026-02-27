package com.coop.loan.repository;

import com.coop.loan.entity.LoanSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanScheduleRepository extends JpaRepository<LoanSchedule, Long> {

    List<LoanSchedule> findByLoanIdOrderByInstallmentNumber(Long loanId);
}
