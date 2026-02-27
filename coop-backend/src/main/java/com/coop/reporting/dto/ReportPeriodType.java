package com.coop.reporting.dto;

import lombok.Getter;

import java.time.LocalDate;

@Getter
public enum ReportPeriodType {
    WEEKLY(1),
    MONTHLY(1),
    QUARTERLY(3),
    SEMI_ANNUAL(6),
    ANNUAL(12);

    private final int monthsEquivalent;

    ReportPeriodType(int monthsEquivalent) {
        this.monthsEquivalent = monthsEquivalent;
    }

    public static LocalDate[] resolveRange(LocalDate asOf, ReportPeriodType type) {
        LocalDate end = asOf;
        LocalDate start;
        switch (type) {
            case WEEKLY -> start = end.minusWeeks(1);
            case MONTHLY -> start = end.minusMonths(1);
            case QUARTERLY -> start = end.minusMonths(3);
            case SEMI_ANNUAL -> start = end.minusMonths(6);
            case ANNUAL -> start = end.minusYears(1);
            default -> start = end.minusMonths(1);
        }
        return new LocalDate[]{start, end};
    }
}
