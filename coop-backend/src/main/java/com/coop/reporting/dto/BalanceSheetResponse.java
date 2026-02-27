package com.coop.reporting.dto;

import com.coop.accounting.entity.AccountType;
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
public class BalanceSheetResponse {

    private String institutionName;
    private String periodLabel;
    private String asOfDate;
    private List<LineItem> assets;
    private List<LineItem> liabilities;
    private List<LineItem> equity;
    private BigDecimal totalAssets;
    private BigDecimal totalLiabilities;
    private BigDecimal totalEquity;

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
