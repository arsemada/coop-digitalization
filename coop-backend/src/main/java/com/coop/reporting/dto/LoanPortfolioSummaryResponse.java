package com.coop.reporting.dto;

import com.coop.loan.entity.LoanStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanPortfolioSummaryResponse {

    private String institutionName;
    private String periodLabel;
    private String asOfDate;
    private long totalLoans;
    private BigDecimal totalDisbursed;
    private BigDecimal totalOutstanding;
    private BigDecimal totalRepaid;
    private long loansDisbursedInPeriod;
    private long loansClosedInPeriod;
}
