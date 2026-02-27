package com.coop.savings.entity;

import com.coop.common.entity.BaseEntity;
import com.coop.institution.entity.Institution;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "savings_products")
@Getter
@Setter
public class SavingsProduct extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sacco_id", nullable = false)
    private Institution sacco;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SavingsCategory category;

    @Column(name = "interest_rate", precision = 19, scale = 4)
    private BigDecimal interestRate = BigDecimal.ZERO;

    @Column(name = "requires_maturity", nullable = false)
    private boolean requiresMaturity = false;
}
