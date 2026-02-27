package com.coop.member.dto;

import com.coop.member.entity.MemberStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateMemberRequest {

    /** Optional: if omitted, a unique member number (SACCO account) is auto-generated. */
    private String memberNumber;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;
    private LocalDate joinDate;

    /** SACCO ID. For SACCO staff, can be omitted—their institution is used. */
    private Long saccoId;

    private String region;
    private String woreda;
    private String kebele;
    private String houseNumber;
}
