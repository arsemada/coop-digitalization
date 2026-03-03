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
public class MemberFinancialSummaryResponse {

    private String institutionName;
    private String periodLabel;
    private String asOfDate;
    private List<Row> rows;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Row {
        private Long memberId;
        private String memberName;
        private String memberNumber;
        private BigDecimal totalSavings;
        private BigDecimal totalLoans;
        private BigDecimal outstandingLoan;
        private BigDecimal interestPaid;
    }
}
