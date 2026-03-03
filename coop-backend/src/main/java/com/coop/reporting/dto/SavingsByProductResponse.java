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
public class SavingsByProductResponse {

    private String institutionName;
    private String periodLabel;
    private String startDate;
    private String endDate;
    private List<Row> rows;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Row {
        private String productType;
        private String productCategory;
        private BigDecimal totalDeposits;
        private BigDecimal totalWithdrawals;
        private BigDecimal netBalance;
    }
}
