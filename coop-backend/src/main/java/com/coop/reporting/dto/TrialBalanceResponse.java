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
public class TrialBalanceResponse {

    private String institutionName;
    private String periodLabel;
    private String startDate;
    private String endDate;
    private List<TrialBalanceLine> lines;
    private BigDecimal totalDebit;
    private BigDecimal totalCredit;
    private boolean balanced;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrialBalanceLine {
        private String accountCode;
        private String accountName;
        private AccountType accountType;
        private BigDecimal debit;
        private BigDecimal credit;
    }
}
