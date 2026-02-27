package com.coop.savings.dto;

import com.coop.savings.entity.TransactionType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SavingsTransactionRequest {

    @NotNull(message = "Member savings account is required")
    private Long memberSavingsAccountId;

    @NotNull(message = "Type is required")
    private TransactionType type;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private LocalDate transactionDate; // default today
}
