package com.coop.accounting.controller;

import com.coop.accounting.dto.GeneralLedgerRow;
import com.coop.accounting.dto.JournalEntryResponse;
import com.coop.accounting.dto.MemberLedgerRow;
import com.coop.accounting.entity.Account;
import com.coop.accounting.entity.AccountType;
import com.coop.accounting.entity.JournalEntry;
import com.coop.accounting.service.AccountingService;
import com.coop.accounting.service.LedgerService;
import com.coop.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounting")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'UNION_ADMIN', 'SACCO_ADMIN')")
public class AccountingController {

    private final AccountingService accountingService;
    private final LedgerService ledgerService;

    @PostMapping("/entries")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<JournalEntry> postEntry(
            @RequestParam Long institutionId,
            @RequestParam(required = false) String entryDate,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String referenceType,
            @RequestParam(required = false) Long referenceId,
            @RequestBody List<Map<String, Object>> lines) {
        LocalDate date = entryDate != null ? LocalDate.parse(entryDate) : null;
        JournalEntry entry = accountingService.postEntry(institutionId, date, description, referenceType, referenceId, lines);
        return ApiResponse.success(entry);
    }

    @GetMapping("/entries")
    public ApiResponse<List<JournalEntryResponse>> listEntries(
            @RequestParam Long institutionId,
            @RequestParam String start,
            @RequestParam String end,
            @RequestParam(required = false) String referenceNumber) {
        return ApiResponse.success(accountingService.listEntryResponses(institutionId, LocalDate.parse(start), LocalDate.parse(end), referenceNumber));
    }

    @GetMapping("/entries/{id}")
    public ResponseEntity<ApiResponse<JournalEntryResponse>> getEntry(@PathVariable Long id) {
        return accountingService.getEntryResponse(id)
                .map(e -> ResponseEntity.ok(ApiResponse.success(e)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Entry not found")));
    }

    @GetMapping("/ledger/member")
    public ApiResponse<List<MemberLedgerRow>> getMemberLedger(
            @RequestParam Long memberId,
            @RequestParam Long institutionId,
            @RequestParam String start,
            @RequestParam String end) {
        return ApiResponse.success(ledgerService.getMemberLedger(memberId, institutionId, LocalDate.parse(start), LocalDate.parse(end)));
    }

    @GetMapping("/ledger/general")
    public ApiResponse<List<GeneralLedgerRow>> getGeneralLedger(
            @RequestParam Long accountId,
            @RequestParam Long institutionId,
            @RequestParam String start,
            @RequestParam String end) {
        return ApiResponse.success(ledgerService.getGeneralLedger(accountId, institutionId, LocalDate.parse(start), LocalDate.parse(end)));
    }

    @PostMapping("/accounts")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Account> createAccount(
            @RequestParam Long institutionId,
            @RequestParam String name,
            @RequestParam String code,
            @RequestParam AccountType type,
            @RequestParam(required = false) Long parentAccountId) {
        return ApiResponse.success(accountingService.createAccount(institutionId, name, code, type, parentAccountId));
    }

    @GetMapping("/accounts")
    public ApiResponse<List<Account>> listAccounts(
            @RequestParam Long institutionId,
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        return ApiResponse.success(activeOnly ? accountingService.listAccountsActiveOnly(institutionId) : accountingService.listAccounts(institutionId));
    }
}
