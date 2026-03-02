package com.coop.savings.controller;

import com.coop.common.response.ApiResponse;
import com.coop.savings.dto.*;
import com.coop.savings.entity.TransferRequestStatus;
import com.coop.savings.service.SavingsService;
import com.coop.savings.service.TransferRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/savings")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SACCO_ADMIN', 'SACCO_EMPLOYEE', 'MEMBER')")
public class SavingsController {

    private final SavingsService savingsService;
    private final TransferRequestService transferRequestService;

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SavingsProductResponse> createProduct(@Valid @RequestBody CreateSavingsProductRequest request) {
        return ApiResponse.success(savingsService.createProduct(request));
    }

    @GetMapping("/products")
    public ApiResponse<List<SavingsProductResponse>> listProducts(@RequestParam Long saccoId) {
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

    @GetMapping("/accounts/lookup")
    public ResponseEntity<ApiResponse<AccountLookupResponse>> lookupAccount(@RequestParam String accountNumber) {
        return savingsService.lookupAccountByNumber(accountNumber)
                .map(ApiResponse::success)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Account not found")));
    }

    @PostMapping("/transactions")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SavingsTransactionResponse> recordTransaction(@Valid @RequestBody SavingsTransactionRequest request) {
        return ApiResponse.success(savingsService.recordTransaction(request));
    }

    @GetMapping("/accounts/{accountId}/transactions")
    public ApiResponse<List<SavingsTransactionResponse>> listTransactions(
            @PathVariable Long accountId,
            @RequestParam(defaultValue = "50") int limit) {
        return ApiResponse.success(savingsService.listTransactions(accountId, limit));
    }

    @PostMapping("/transfer-requests")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TransferRequestResponse> createTransferRequest(@Valid @RequestBody CreateTransferRequestRequest request) {
        return ApiResponse.success(transferRequestService.createRequest(request));
    }

    @GetMapping("/transfer-requests/member/{memberId}")
    public ApiResponse<List<TransferRequestResponse>> listTransferRequestsByMember(@PathVariable Long memberId) {
        return ApiResponse.success(transferRequestService.listByMember(memberId));
    }

    @GetMapping("/transfer-requests/member/{memberId}/history")
    public ApiResponse<List<TransferRequestResponse>> listTransferHistoryByMember(@PathVariable Long memberId) {
        return ApiResponse.success(transferRequestService.listHistoryByMember(memberId));
    }

    @GetMapping("/transfer-requests/sacco/{saccoId}")
    @PreAuthorize("hasAnyRole('SACCO_ADMIN', 'SACCO_EMPLOYEE', 'SUPER_ADMIN', 'UNION_ADMIN')")
    public ApiResponse<List<TransferRequestResponse>> listTransferRequestsBySacco(
            @PathVariable Long saccoId,
            @RequestParam(required = false) TransferRequestStatus status) {
        return ApiResponse.success(transferRequestService.listBySacco(saccoId, status));
    }

    @PostMapping("/transfer-requests/{id}/approve")
    @PreAuthorize("hasAnyRole('SACCO_ADMIN', 'SACCO_EMPLOYEE')")
    public ApiResponse<TransferRequestResponse> approveTransferRequest(@PathVariable Long id) {
        return ApiResponse.success(transferRequestService.approve(id));
    }

    @PostMapping("/transfer-requests/{id}/reject")
    @PreAuthorize("hasAnyRole('SACCO_ADMIN', 'SACCO_EMPLOYEE')")
    public ApiResponse<TransferRequestResponse> rejectTransferRequest(
            @PathVariable Long id,
            @RequestBody(required = false) RejectTransferRequestDto body) {
        return ApiResponse.success(transferRequestService.reject(id, body != null ? body.getReason() : null));
    }
}
