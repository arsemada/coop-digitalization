package com.coop.loan.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LoanApplicationRequest {

    @NotNull(message = "Member is required")
    private Long memberId;

    @NotNull(message = "SACCO is required")
    private Long saccoId;

    @NotNull(message = "Principal amount is required")
    private BigDecimal principalAmount;

    @NotNull(message = "Interest rate is required")
    private BigDecimal interestRate;

    @NotNull(message = "Term in months is required")
    private Integer termInMonths;
}
