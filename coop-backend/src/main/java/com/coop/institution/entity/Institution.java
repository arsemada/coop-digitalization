package com.coop.institution.entity;

import com.coop.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "institutions")
@Getter
@Setter
public class Institution extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InstitutionType type;

    @Column(name = "registration_number")
    private String registrationNumber;

    private String region;
    private String woreda;
    private String kebele;

    @Column(name = "house_number")
    private String houseNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InstitutionStatus status = InstitutionStatus.PENDING_APPROVAL;

    @Column(name = "applicant_username")
    private String applicantUsername;

    @Column(name = "applicant_email")
    private String applicantEmail;

    @Column(name = "applicant_phone")
    private String applicantPhone;

    /** Default annual loan interest rate (%). SACCOs/Unions set this; members see it when applying. */
    @Column(name = "default_loan_interest_rate", precision = 19, scale = 4)
    private java.math.BigDecimal defaultLoanInterestRate;
}
