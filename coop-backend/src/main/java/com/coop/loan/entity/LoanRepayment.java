package com.coop.loan.entity;

import com.coop.common.entity.BaseEntity;
import com.coop.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "loan_repayments")
@Getter
@Setter
public class LoanRepayment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_id", nullable = false)
    private Loan loan;

    @Column(name = "amount_paid", nullable = false, precision = 19, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "principal_component", precision = 19, scale = 2)
    private BigDecimal principalComponent;

    @Column(name = "interest_component", precision = 19, scale = 2)
    private BigDecimal interestComponent;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by")
    private User recordedBy;
}
