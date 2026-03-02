package com.coop.member.dto;

import com.coop.member.entity.MemberStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberResponse {

    private Long id;
    private String memberNumber;
    private String fullName;
    private String phone;
    private String email;
    private LocalDate joinDate;
    private Long saccoId;
    private String saccoName;
    private String region;
    private String woreda;
    private String kebele;
    private String houseNumber;
    private MemberStatus status;
    private Instant createdAt;
}
