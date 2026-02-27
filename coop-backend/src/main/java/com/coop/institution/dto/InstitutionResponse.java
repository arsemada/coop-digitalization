package com.coop.institution.dto;

import com.coop.institution.entity.InstitutionStatus;
import com.coop.institution.entity.InstitutionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstitutionResponse {

    private Long id;
    private String name;
    private InstitutionType type;
    private String registrationNumber;
    private String region;
    private String woreda;
    private String kebele;
    private String houseNumber;
    private InstitutionStatus status;
    private Instant createdAt;
    private String applicantUsername;
    private String applicantEmail;
    private String applicantPhone;
}
