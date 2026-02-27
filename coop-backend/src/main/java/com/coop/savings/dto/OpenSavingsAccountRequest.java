package com.coop.savings.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OpenSavingsAccountRequest {

    @NotNull(message = "Member is required")
    private Long memberId;

    @NotNull(message = "Savings product is required")
    private Long savingsProductId;
}
