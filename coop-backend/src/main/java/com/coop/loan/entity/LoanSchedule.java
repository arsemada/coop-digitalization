package com.coop.loan.entity;

import com.coop.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "loan_schedules")
@Getter
@Setter
public class LoanSchedule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_id", nullable = false)
    private Loan loan;

    @Column(name = "installment_number", nullable = false)
    private int installmentNumber;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "principal_due", precision = 19, scale = 2)
    private BigDecimal principalDue;

    @Column(name = "interest_due", precision = 19, scale = 2)
    private BigDecimal interestDue;

    @Column(name = "total_due", precision = 19, scale = 2)
    private BigDecimal totalDue;

    @Column(nullable = false)
    private boolean paid = false;
}
