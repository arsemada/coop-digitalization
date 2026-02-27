package com.coop.accounting.dto;

import com.coop.accounting.entity.AccountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JournalLineDto {

    private Long accountId;
    private String accountCode;
    private String accountName;
    private AccountType accountType;
    private BigDecimal debit;
    private BigDecimal credit;
}
