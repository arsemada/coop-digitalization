package com.coop.loan.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LoanApplicationRequest {

    /** Required for staff; optional for MEMBER (derived from current user) */
    private Long memberId;

    /** Required for staff; optional for MEMBER (derived from institution) */
    private Long saccoId;

    @NotNull(message = "Principal amount is required")
    private BigDecimal principalAmount;

    @NotNull(message = "Interest rate is required")
    private BigDecimal interestRate;

    @NotNull(message = "Term in months is required")
    private Integer termInMonths;

    /** Collateral/security savings account - member selects from their savings accounts */
    @NotNull(message = "Savings account is required")
    private Long memberSavingsAccountId;

    /** Reason for the loan */
    private String loanReason;
}
