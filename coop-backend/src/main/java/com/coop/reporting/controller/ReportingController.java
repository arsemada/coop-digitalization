package com.coop.reporting.controller;

import com.coop.common.response.ApiResponse;
import com.coop.reporting.dto.*;
import com.coop.reporting.service.FinancialReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'UNION_ADMIN', 'SACCO_ADMIN')")
public class ReportingController {

    private final FinancialReportService financialReportService;

    /** Resolve start/end from periodType + endDate, or from explicit start/end for CUSTOM. */
    private LocalDate[] resolveDates(String periodType, String start, String end, String asOf) {
        if (start != null && !start.isEmpty() && end != null && !end.isEmpty()) {
            return ReportPeriodType.resolveCustom(LocalDate.parse(start), LocalDate.parse(end));
        }
        LocalDate endDate = (asOf != null && !asOf.isEmpty()) ? LocalDate.parse(asOf) : LocalDate.now();
        ReportPeriodType type = (periodType != null && !periodType.isEmpty())
                ? ReportPeriodType.valueOf(periodType.toUpperCase()) : ReportPeriodType.MONTHLY;
        return ReportPeriodType.resolveRange(endDate, type);
    }

    @GetMapping("/trial-balance")
    public ApiResponse<TrialBalanceResponse> trialBalance(
            @RequestParam Long institutionId,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false) String periodType,
            @RequestParam(required = false) String asOf,
            @RequestParam(required = false) String periodLabel) {
        LocalDate[] range = resolveDates(periodType, start, end, asOf);
        LocalDate startDate = range[0];
        LocalDate endDate = range[1];
        String label = periodLabel != null ? periodLabel : startDate + " to " + endDate;
        return ApiResponse.success(financialReportService.trialBalance(institutionId, startDate, endDate, label));
    }

    @GetMapping("/income-statement")
    public ApiResponse<IncomeStatementResponse> incomeStatement(
            @RequestParam Long institutionId,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false) String periodType,
            @RequestParam(required = false) String asOf,
            @RequestParam(required = false) String periodLabel) {
        LocalDate[] range = resolveDates(periodType, start, end, asOf);
        String label = periodLabel != null ? periodLabel : range[0] + " to " + range[1];
        return ApiResponse.success(financialReportService.incomeStatement(institutionId, range[0], range[1], label));
    }

    @GetMapping("/balance-sheet")
    public ApiResponse<BalanceSheetResponse> balanceSheet(
            @RequestParam Long institutionId,
            @RequestParam(required = false) String asOf,
            @RequestParam(required = false) String periodLabel) {
        LocalDate asOfDate = (asOf != null && !asOf.isEmpty()) ? LocalDate.parse(asOf) : LocalDate.now();
        String label = periodLabel != null ? periodLabel : "As of " + asOfDate;
        return ApiResponse.success(financialReportService.balanceSheet(institutionId, asOfDate, label));
    }

    @GetMapping("/loan-portfolio")
    public ApiResponse<LoanPortfolioSummaryResponse> loanPortfolioSummary(
            @RequestParam Long saccoId,
            @RequestParam(required = false) String asOf,
            @RequestParam(required = false) String periodLabel) {
        LocalDate asOfDate = (asOf != null && !asOf.isEmpty()) ? LocalDate.parse(asOf) : LocalDate.now();
        String label = periodLabel != null ? periodLabel : "As of " + asOfDate;
        return ApiResponse.success(financialReportService.loanPortfolioSummary(saccoId, asOfDate, label));
    }

    @GetMapping("/loan-summary")
    public ApiResponse<LoanSummaryResponse> loanSummary(
            @RequestParam Long saccoId,
            @RequestParam(required = false) String asOf,
            @RequestParam(required = false) String periodLabel) {
        LocalDate asOfDate = (asOf != null && !asOf.isEmpty()) ? LocalDate.parse(asOf) : LocalDate.now();
        String label = periodLabel != null ? periodLabel : "As of " + asOfDate;
        return ApiResponse.success(financialReportService.loanSummary(saccoId, asOfDate, label));
    }

    @GetMapping("/savings-summary")
    public ApiResponse<SavingsSummaryResponse> savingsSummary(
            @RequestParam Long saccoId,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false) String periodType,
            @RequestParam(required = false) String asOf,
            @RequestParam(required = false) String periodLabel) {
        LocalDate[] range = resolveDates(periodType, start, end, asOf);
        String label = periodLabel != null ? periodLabel : range[0] + " to " + range[1];
        return ApiResponse.success(financialReportService.savingsSummary(saccoId, range[0], range[1], label));
    }

    @GetMapping("/savings-by-product")
    public ApiResponse<SavingsByProductResponse> savingsByProduct(
            @RequestParam Long institutionId,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false) String periodType,
            @RequestParam(required = false) String asOf,
            @RequestParam(required = false) String periodLabel) {
        LocalDate[] range = resolveDates(periodType, start, end, asOf);
        String label = periodLabel != null ? periodLabel : range[0] + " to " + range[1];
        return ApiResponse.success(financialReportService.savingsSummaryByProduct(institutionId, range[0], range[1], label));
    }

    @GetMapping("/member-financial-summary")
    public ApiResponse<MemberFinancialSummaryResponse> memberFinancialSummary(
            @RequestParam Long saccoId,
            @RequestParam(required = false) String asOf,
            @RequestParam(required = false) String periodLabel) {
        LocalDate asOfDate = (asOf != null && !asOf.isEmpty()) ? LocalDate.parse(asOf) : LocalDate.now();
        String label = periodLabel != null ? periodLabel : "As of " + asOfDate;
        return ApiResponse.success(financialReportService.memberFinancialSummary(saccoId, asOfDate, label));
    }

    @GetMapping("/cash-flow")
    public ApiResponse<CashFlowResponse> cashFlow(
            @RequestParam Long institutionId,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false) String periodType,
            @RequestParam(required = false) String asOf,
            @RequestParam(required = false) String periodLabel) {
        LocalDate[] range = resolveDates(periodType, start, end, asOf);
        String label = periodLabel != null ? periodLabel : range[0] + " to " + range[1];
        return ApiResponse.success(financialReportService.cashFlowReport(institutionId, range[0], range[1], label));
    }
}
