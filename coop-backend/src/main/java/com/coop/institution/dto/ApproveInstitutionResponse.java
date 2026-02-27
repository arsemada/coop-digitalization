package com.coop.institution.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApproveInstitutionResponse {

    private InstitutionResponse institution;
    private String username;
    private String otp;
}
