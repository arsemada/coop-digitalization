package com.coop.savings.entity;

import com.coop.common.entity.BaseEntity;
import com.coop.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "transfer_requests")
@Getter
@Setter
public class TransferRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_account_id", nullable = false)
    private MemberSavingsAccount sourceAccount;

    /** Destination account number (e.g. SAV-000002). Resolved to account on approval. */
    @Column(name = "destination_account_number", nullable = false)
    private String destinationAccountNumber;

    /** Set when request is approved; used for transfer history (receiver side). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_account_id")
    private MemberSavingsAccount destinationAccount;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransferRequestStatus status = TransferRequestStatus.PENDING;

    @Column(name = "processed_at")
    private Instant processedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;
}
