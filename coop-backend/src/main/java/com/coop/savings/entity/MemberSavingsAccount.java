package com.coop.savings.entity;

import com.coop.common.entity.BaseEntity;
import com.coop.member.entity.Member;
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

    @Column(name = "opened_date", nullable = false)
    private LocalDate openedDate;
}
