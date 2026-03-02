package com.coop.institution.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateInstitutionRequest {

    /** Default annual loan interest rate (%) - SACCOs/Unions can set this. */
    private BigDecimal defaultLoanInterestRate;
}
