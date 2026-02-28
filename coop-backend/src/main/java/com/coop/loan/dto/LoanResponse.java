package com.coop.loan.dto;

import com.coop.loan.entity.LoanStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanResponse {

    private Long id;
    private Long memberId;
    private String memberName;
    private String memberNumber;
    private Long saccoId;
    private BigDecimal principalAmount;
    private BigDecimal interestRate;
    private int termInMonths;
    private Long collateralSavingsAccountId;
    private String collateralAccountName;
    private String loanReason;
    private LoanStatus status;
    private LocalDate disbursementDate;
    private BigDecimal outstandingBalance;
    private Instant createdAt;
    private List<LoanScheduleItemResponse> schedule;
}
