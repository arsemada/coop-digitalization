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

    @GetMapping("/trial-balance")
    public ApiResponse<TrialBalanceResponse> trialBalance(
            @RequestParam Long institutionId,
            @RequestParam String start,
            @RequestParam String end,
            @RequestParam(required = false) String periodType,
            @RequestParam(required = false) String periodLabel) {
        LocalDate startDate = LocalDate.parse(start);
        LocalDate endDate = LocalDate.parse(end);
        String label = periodLabel != null ? periodLabel : startDate + " to " + endDate;
        return ApiResponse.success(financialReportService.trialBalance(institutionId, startDate, endDate, label));
    }

    @GetMapping("/income-statement")
    public ApiResponse<IncomeStatementResponse> incomeStatement(
            @RequestParam Long institutionId,
            @RequestParam String start,
            @RequestParam String end,
            @RequestParam(required = false) String periodLabel) {
        LocalDate startDate = LocalDate.parse(start);
        LocalDate endDate = LocalDate.parse(end);
        String label = periodLabel != null ? periodLabel : startDate + " to " + endDate;
        return ApiResponse.success(financialReportService.incomeStatement(institutionId, startDate, endDate, label));
    }

    @GetMapping("/balance-sheet")
    public ApiResponse<BalanceSheetResponse> balanceSheet(
            @RequestParam Long institutionId,
            @RequestParam String asOf,
            @RequestParam(required = false) String periodLabel) {
        LocalDate asOfDate = LocalDate.parse(asOf);
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

    @GetMapping("/savings-summary")
    public ApiResponse<SavingsSummaryResponse> savingsSummary(
            @RequestParam Long saccoId,
            @RequestParam String start,
            @RequestParam String end,
            @RequestParam(required = false) String periodLabel) {
        LocalDate startDate = LocalDate.parse(start);
        LocalDate endDate = LocalDate.parse(end);
        String label = periodLabel != null ? periodLabel : startDate + " to " + endDate;
        return ApiResponse.success(financialReportService.savingsSummary(saccoId, startDate, endDate, label));
    }
}
