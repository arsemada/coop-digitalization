package com.coop.loan.controller;

import com.coop.common.response.ApiResponse;
import com.coop.loan.dto.*;
import com.coop.loan.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SACCO_ADMIN', 'SACCO_EMPLOYEE', 'MEMBER')")
public class LoanController {

    private final LoanService loanService;

    @PostMapping("/apply")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LoanResponse> apply(@Valid @RequestBody LoanApplicationRequest request) {
        return ApiResponse.success(loanService.apply(request));
    }

    @PostMapping("/{loanId}/approve")
    @PreAuthorize("hasAnyRole('SACCO_ADMIN', 'SACCO_EMPLOYEE')")
    public ApiResponse<LoanResponse> approve(@PathVariable Long loanId, @RequestBody LoanApprovalRequest request) {
        return ApiResponse.success(loanService.approve(loanId, request));
    }

    @PostMapping("/{loanId}/disburse")
    @PreAuthorize("hasAnyRole('SACCO_ADMIN', 'SACCO_EMPLOYEE')")
    public ApiResponse<LoanResponse> disburse(@PathVariable Long loanId) {
        return ApiResponse.success(loanService.disburse(loanId));
    }

    @PostMapping("/repayments")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SACCO_ADMIN', 'SACCO_EMPLOYEE', 'MEMBER')")
    public ApiResponse<LoanRepaymentResponse> recordRepayment(@Valid @RequestBody LoanRepaymentRequest request) {
        return ApiResponse.success(loanService.recordRepayment(request));
    }

    @GetMapping("/repayments")
    @PreAuthorize("hasAnyRole('SACCO_ADMIN', 'SACCO_EMPLOYEE')")
    public ApiResponse<List<LoanRepaymentResponse>> listRepayments(@RequestParam Long saccoId) {
        return ApiResponse.success(loanService.listRepaymentsBySacco(saccoId));
    }

    @GetMapping("/{id}")
    public ApiResponse<LoanResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(loanService.getById(id));
    }

    @GetMapping("/member/{memberId}")
    public ApiResponse<List<LoanResponse>> listByMember(@PathVariable Long memberId) {
        return ApiResponse.success(loanService.listByMember(memberId));
    }

    @GetMapping
    public ApiResponse<List<LoanResponse>> listBySacco(@RequestParam Long saccoId) {
        return ApiResponse.success(loanService.listBySacco(saccoId));
    }
}
