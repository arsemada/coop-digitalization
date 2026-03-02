package com.coop.savings.dto;

import com.coop.savings.entity.SavingsCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavingsProductResponse {

    private Long id;
    private String name;
    private SavingsCategory category;
    private BigDecimal interestRate;
    private boolean requiresMaturity;
}
