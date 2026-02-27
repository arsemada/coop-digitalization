package com.coop.loan.dto;

import lombok.Data;

@Data
public class LoanApprovalRequest {

    private boolean approved; // true = approve, false = reject
}
