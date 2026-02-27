package com.coop.member.dto;

import com.coop.member.entity.MemberStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateMemberRequest {

    @NotBlank(message = "Member number is required")
    private String memberNumber;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;
    private LocalDate joinDate;

    @NotNull(message = "SACCO is required")
    private Long saccoId;

    private String region;
    private String woreda;
    private String kebele;
    private String houseNumber;
}
