package com.coop.accounting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneralLedgerRow {

    private LocalDate date;
    private String accountName;
    private String accountCode;
    private String description;
    private BigDecimal debit;
    private BigDecimal credit;
    private BigDecimal balance;
}
