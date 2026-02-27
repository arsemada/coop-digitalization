package com.coop.savings.dto;

import com.coop.savings.entity.SavingsCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateSavingsProductRequest {

    @NotNull(message = "SACCO is required")
    private Long saccoId;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Category is required")
    private SavingsCategory category;

    private BigDecimal interestRate;
    private boolean requiresMaturity;
}
