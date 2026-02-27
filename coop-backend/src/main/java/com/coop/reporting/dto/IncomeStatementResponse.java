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
public class IncomeStatementResponse {

    private String institutionName;
    private String periodLabel;
    private String startDate;
    private String endDate;
    private List<LineItem> income;
    private List<LineItem> expenses;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netIncome;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LineItem {
        private String accountCode;
        private String accountName;
        private BigDecimal amount;
    }
}
