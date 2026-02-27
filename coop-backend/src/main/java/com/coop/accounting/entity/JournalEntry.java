package com.coop.accounting.entity;

import com.coop.common.entity.BaseEntity;
import com.coop.institution.entity.Institution;
import com.coop.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "journal_entries")
@Getter
@Setter
public class JournalEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(name = "reference_type")
    private String referenceType; // e.g. SAVINGS_TRANSACTION, LOAN_REPAYMENT

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
}
