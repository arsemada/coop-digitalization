package com.coop.loan.repository;

import com.coop.loan.entity.LoanRepayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface LoanRepaymentRepository extends JpaRepository<LoanRepayment, Long> {

    List<LoanRepayment> findByLoanIdOrderByPaymentDateDesc(Long loanId);

    List<LoanRepayment> findByLoan_Sacco_IdOrderByPaymentDateDesc(Long saccoId);

    @Query("SELECT COALESCE(SUM(r.principalComponent), 0) FROM LoanRepayment r WHERE r.loan.id = :loanId")
    BigDecimal sumPrincipalComponentByLoanId(@Param("loanId") Long loanId);
}
