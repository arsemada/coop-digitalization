package com.coop.savings.dto;

import com.coop.savings.entity.TransferRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferRequestResponse {

    private Long id;
    private Long sourceAccountId;
    private String sourceAccountNumber;
    private String sourceMemberName;
    private String sourceMemberNumber;
    private String destinationAccountNumber;
    private String destinationMemberName;  // set when approved or when looked up
    private BigDecimal amount;
    private TransferRequestStatus status;
    private Instant createdAt;
    private Instant processedAt;
    private String processedByUsername;
    private String rejectionReason;

    /** For history: "SENT" or "RECEIVED" from current user's perspective. */
    private String direction;
}
