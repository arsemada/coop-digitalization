package com.coop.ussd.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UssdRequest {

    @NotBlank(message = "sessionId is required")
    private String sessionId;

    @NotBlank(message = "phoneNumber is required")
    private String phoneNumber;

    /** Full USSD input string (e.g. "1*1234" or "1*1234*1"). Empty on first menu. */
    private String text;
}
