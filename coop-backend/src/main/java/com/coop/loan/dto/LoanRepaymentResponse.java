package com.coop.loan.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class LoanRepaymentResponse {

    private Long id;
    private Long loanId;
    private String memberName;
    private String memberNumber;
    private BigDecimal amountPaid;
    private BigDecimal principalComponent;
    private BigDecimal interestComponent;
    private LocalDate paymentDate;
    private String recordedBy;
    private Instant createdAt;
}
