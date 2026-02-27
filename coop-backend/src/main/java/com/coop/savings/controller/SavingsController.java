package com.coop.savings.controller;

import com.coop.common.response.ApiResponse;
import com.coop.savings.dto.*;
import com.coop.savings.entity.SavingsProduct;
import com.coop.savings.entity.SavingsTransaction;
import com.coop.savings.service.SavingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/savings")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SACCO_ADMIN', 'SACCO_EMPLOYEE', 'MEMBER')")
public class SavingsController {

    private final SavingsService savingsService;

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SavingsProduct> createProduct(@Valid @RequestBody CreateSavingsProductRequest request) {
        return ApiResponse.success(savingsService.createProduct(request));
    }

    @GetMapping("/products")
    public ApiResponse<List<SavingsProduct>> listProducts(@RequestParam Long saccoId) {
        return ApiResponse.success(savingsService.listProductsBySacco(saccoId));
    }

    @PostMapping("/accounts")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SavingsAccountResponse> openAccount(@Valid @RequestBody OpenSavingsAccountRequest request) {
        return ApiResponse.success(savingsService.openAccount(request));
    }

    @GetMapping("/accounts/member/{memberId}")
    public ApiResponse<List<SavingsAccountResponse>> listAccountsByMember(@PathVariable Long memberId) {
        return ApiResponse.success(savingsService.listAccountsByMember(memberId));
    }

    @PostMapping("/transactions")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SavingsTransaction> recordTransaction(@Valid @RequestBody SavingsTransactionRequest request) {
        return ApiResponse.success(savingsService.recordTransaction(request));
    }

    @GetMapping("/accounts/{accountId}/transactions")
    public ApiResponse<List<SavingsTransaction>> listTransactions(
            @PathVariable Long accountId,
            @RequestParam(defaultValue = "50") int limit) {
        return ApiResponse.success(savingsService.listTransactions(accountId, limit));
    }
}
