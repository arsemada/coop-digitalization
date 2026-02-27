package com.coop.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMemberResponse {

    private MemberResponse member;
    /** Username for login (same as member number) */
    private String username;
    /** OTP to share with member for first login */
    private String otp;
}
