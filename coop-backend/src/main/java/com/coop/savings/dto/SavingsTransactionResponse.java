package com.coop.savings.dto;

import com.coop.savings.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavingsTransactionResponse {

    private Long id;
    private Long memberSavingsAccountId;
    private TransactionType type;
    private BigDecimal amount;
    private LocalDate transactionDate;
    private Instant createdAt;
}
