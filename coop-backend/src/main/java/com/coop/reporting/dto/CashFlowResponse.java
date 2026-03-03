package com.coop.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashFlowResponse {

    private String institutionName;
    private String periodLabel;
    private String startDate;
    private String endDate;
    private BigDecimal openingBalance;
    private BigDecimal savingsDeposits;
    private BigDecimal loanRepayments;
    private BigDecimal loanDisbursements;
    private BigDecimal withdrawals;
    private BigDecimal expenses;
    private BigDecimal closingBalance;
}
