package com.coop.savings.entity;

import com.coop.common.entity.BaseEntity;
import com.coop.member.entity.Member;
import com.coop.accounting.entity.Account;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "member_savings_accounts")
@Getter
@Setter
public class MemberSavingsAccount extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "savings_product_id", nullable = false)
    private SavingsProduct savingsProduct;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(nullable = false)
    private String status = "ACTIVE";

    /** Human-readable account number for this category (e.g. SAV-000001). Member sees one per category. */
    @Column(name = "account_number", unique = true)
    private String accountNumber;

    @Column(name = "opened_date", nullable = false)
    private LocalDate openedDate;

    /** GL liability account for this member's savings in this product/category. One account per category. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "liability_account_id")
    private Account liabilityAccount;
}
