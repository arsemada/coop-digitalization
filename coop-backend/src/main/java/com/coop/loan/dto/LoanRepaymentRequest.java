package com.coop.loan.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class LoanRepaymentRequest {

    @NotNull(message = "Loan is required")
    private Long loanId;

    @NotNull(message = "Amount is required")
    private BigDecimal amountPaid;

    private LocalDate paymentDate; // default today
}
