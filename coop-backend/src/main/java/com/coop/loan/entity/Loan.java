package com.coop.loan.entity;

import com.coop.common.entity.BaseEntity;
import com.coop.institution.entity.Institution;
import com.coop.member.entity.Member;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "loans")
@Getter
@Setter
public class Loan extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sacco_id", nullable = false)
    private Institution sacco;

    @Column(name = "principal_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal principalAmount;

    @Column(name = "interest_rate", nullable = false, precision = 19, scale = 4)
    private BigDecimal interestRate;

    @Column(name = "term_in_months", nullable = false)
    private int termInMonths;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoanStatus status = LoanStatus.PENDING_APPROVAL;

    @Column(name = "disbursement_date")
    private LocalDate disbursementDate;

    @Column(name = "outstanding_balance", precision = 19, scale = 2)
    private BigDecimal outstandingBalance;
}
