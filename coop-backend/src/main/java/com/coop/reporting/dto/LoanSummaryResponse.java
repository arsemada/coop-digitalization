package com.coop.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanSummaryResponse {

    private String institutionName;
    private String periodLabel;
    private String asOfDate;
    private List<LoanSummaryRow> rows;
    private BigDecimal totalDisbursed;
    private BigDecimal totalRepaid;
    private BigDecimal totalOutstanding;
    private BigDecimal totalInterestCollected;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoanSummaryRow {
        private String category;
        private BigDecimal totalDisbursed;
        private BigDecimal totalRepaid;
        private BigDecimal outstanding;
        private BigDecimal interestCollected;
    }
}
