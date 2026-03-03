package com.coop.accounting.entity;

import com.coop.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "journal_lines")
@Getter
@Setter
public class JournalLine extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id", nullable = false)
    private JournalEntry journalEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(precision = 19, scale = 2)
    private BigDecimal debit = BigDecimal.ZERO;

    @Column(precision = 19, scale = 2)
    private BigDecimal credit = BigDecimal.ZERO;

    @Column(name = "member_id")
    private Long memberId;

    @Column(name = "product_type", length = 32)
    private String productType; // Savings, Loan

    @Column(name = "product_category", length = 64)
    private String productCategory; // Regular, Voluntary, etc.
}
