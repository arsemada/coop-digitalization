package com.coop.savings.dto;

import com.coop.savings.entity.SavingsCategory;
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
public class SavingsAccountResponse {

    private Long id;
    private Long memberId;
    private String memberName;
    private String memberNumber;
    private Long savingsProductId;
    private String productName;
    private SavingsCategory productCategory;
    private BigDecimal balance;
    private String status;
    private LocalDate openedDate;
}
