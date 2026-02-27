package com.coop.reporting.entity;

import com.coop.common.entity.BaseEntity;
import com.coop.institution.entity.Institution;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "financial_periods")
@Getter
@Setter
public class FinancialPeriod extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private String name; // e.g. "Jan 2025", "Q1 2025"
}
