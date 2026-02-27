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
public class SavingsSummaryResponse {

    private String institutionName;
    private String periodLabel;
    private String asOfDate;
    private long totalAccounts;
    private BigDecimal totalBalance;
    private long depositCountInPeriod;
    private BigDecimal totalDepositsInPeriod;
    private long withdrawalCountInPeriod;
    private BigDecimal totalWithdrawalsInPeriod;
}
