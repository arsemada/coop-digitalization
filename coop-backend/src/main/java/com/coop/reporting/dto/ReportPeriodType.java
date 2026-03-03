package com.coop.reporting.dto;

import lombok.Getter;

import java.time.LocalDate;

@Getter
public enum ReportPeriodType {
    WEEKLY(1),
    MONTHLY(1),
    QUARTERLY(3),
    SEMI_ANNUAL(6),
    SIX_MONTHS(6),
    ANNUAL(12),
    YEARLY(12),
    CUSTOM(0);

    private final int monthsEquivalent;

    ReportPeriodType(int monthsEquivalent) {
        this.monthsEquivalent = monthsEquivalent;
    }

    /** Resolves [start, end] for the given period type and end date. For CUSTOM, use resolveCustom(start, end). */
    public static LocalDate[] resolveRange(LocalDate asOf, ReportPeriodType type) {
        if (type == CUSTOM) {
            return new LocalDate[]{asOf, asOf};
        }
        LocalDate end = asOf;
        LocalDate start;
        switch (type) {
            case WEEKLY -> start = end.minusWeeks(1);
            case MONTHLY -> start = end.minusMonths(1);
            case QUARTERLY -> start = end.minusMonths(3);
            case SEMI_ANNUAL, SIX_MONTHS -> start = end.minusMonths(6);
            case ANNUAL, YEARLY -> start = end.minusYears(1);
            default -> start = end.minusMonths(1);
        }
        return new LocalDate[]{start, end};
    }

    public static LocalDate[] resolveCustom(LocalDate start, LocalDate end) {
        return new LocalDate[]{start, end};
    }
}
