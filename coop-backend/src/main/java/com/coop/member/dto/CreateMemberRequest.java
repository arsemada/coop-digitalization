package com.coop.member.dto;

import com.coop.savings.entity.SavingsCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

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

    @NotEmpty(message = "At least one savings category is required")
    private List<SavingsCategory> savingsCategories;
}
