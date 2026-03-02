package com.coop.institution.dto;

import com.coop.institution.entity.InstitutionStatus;
import com.coop.institution.entity.InstitutionType;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateInstitutionRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private InstitutionType type;

    private String registrationNumber;
    private String region;
    private String woreda;
    private String kebele;
    private String houseNumber;

    /** Default annual loan interest rate (%) for loans - optional, default 12. */
    private BigDecimal defaultLoanInterestRate;

    /** Admin username for the account created on approval (OTP flow) */
    private String applicantUsername;
    private String applicantEmail;
    private String applicantPhone;
}
