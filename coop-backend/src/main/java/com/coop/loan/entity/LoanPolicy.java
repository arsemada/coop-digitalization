package com.coop.loan.entity;

import com.coop.common.entity.BaseEntity;
import com.coop.institution.entity.Institution;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "loan_policies")
@Getter
@Setter
public class LoanPolicy extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    /** Multiplier: MaxLoan = EligibleSavings × this value (e.g. 3.0 = 3x savings). */
    @Column(name = "savings_to_loan_multiplier", nullable = false, precision = 19, scale = 4)
    private BigDecimal savingsToLoanMultiplier = BigDecimal.valueOf(3);

    /** Minimum total savings (withdrawable) required to be eligible for any loan. */
    @Column(name = "min_savings_required", nullable = false, precision = 19, scale = 2)
    private BigDecimal minSavingsRequired = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
