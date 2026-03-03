package com.coop.accounting.service;

import com.coop.accounting.dto.JournalEntryResponse;
import com.coop.accounting.dto.JournalLineDto;
import com.coop.accounting.entity.*;
import com.coop.accounting.repository.AccountRepository;
import com.coop.accounting.repository.JournalEntryRepository;
import com.coop.accounting.repository.JournalLineRepository;
import com.coop.common.exception.CustomException;
import com.coop.institution.repository.InstitutionRepository;
import com.coop.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountingService {

    /** Standard code for the main Cash (Asset) account. */
    public static final String CASH_ACCOUNT_CODE = "1000";

    private final JournalEntryRepository journalEntryRepository;
    private final JournalLineRepository journalLineRepository;
    private final AccountRepository accountRepository;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;

    @Transactional
    public JournalEntry postEntry(Long institutionId, LocalDate entryDate, String description,
                                  String referenceType, Long referenceId, List<Map<String, Object>> lines) {
        var institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new CustomException("Institution not found", HttpStatus.NOT_FOUND.value()));
        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;
        List<JournalLine> lineEntities = new ArrayList<>();
        for (Map<String, Object> line : lines) {
            Long accountId = Long.valueOf(line.get("accountId").toString());
            BigDecimal debit = line.get("debit") != null ? new BigDecimal(line.get("debit").toString()) : BigDecimal.ZERO;
            BigDecimal credit = line.get("credit") != null ? new BigDecimal(line.get("credit").toString()) : BigDecimal.ZERO;
            totalDebit = totalDebit.add(debit);
            totalCredit = totalCredit.add(credit);
            var account = accountRepository.findById(accountId)
                    .orElseThrow(() -> new CustomException("Account not found: " + accountId, HttpStatus.NOT_FOUND.value()));
            JournalLine jl = new JournalLine();
            jl.setAccount(account);
            jl.setDebit(debit);
            jl.setCredit(credit);
            if (line.get("memberId") != null && !line.get("memberId").toString().isEmpty()) {
                jl.setMemberId(Long.valueOf(line.get("memberId").toString()));
            }
            if (line.get("productType") != null) jl.setProductType(line.get("productType").toString());
            if (line.get("productCategory") != null) jl.setProductCategory(line.get("productCategory").toString());
            lineEntities.add(jl);
        }
        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new CustomException("Debits must equal credits", HttpStatus.BAD_REQUEST.value());
        }
        JournalEntry entry = new JournalEntry();
        entry.setInstitution(institution);
        entry.setEntryDate(entryDate != null ? entryDate : LocalDate.now());
        entry.setDescription(description);
        entry.setReferenceNumber(java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase());
        entry.setReferenceType(referenceType);
        entry.setReferenceId(referenceId);
        entry.setTotalDebit(totalDebit);
        entry.setTotalCredit(totalCredit);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByUsername(username).ifPresent(entry::setCreatedBy);
        entry = journalEntryRepository.save(entry);
        for (JournalLine jl : lineEntities) {
            jl.setJournalEntry(entry);
            journalLineRepository.save(jl);
        }
        return entry;
    }

    public List<JournalEntry> listEntries(Long institutionId, LocalDate start, LocalDate end) {
        return journalEntryRepository.findByInstitutionIdAndEntryDateBetweenOrderByEntryDateAsc(institutionId, start, end);
    }

    public Optional<JournalEntry> getEntryById(Long id) {
        return journalEntryRepository.findById(id);
    }

    public List<JournalEntryResponse> listEntryResponses(Long institutionId, LocalDate start, LocalDate end, String referenceNumber) {
        List<JournalEntry> entries = (referenceNumber != null && !referenceNumber.isBlank())
                ? journalEntryRepository.findByInstitutionIdAndReferenceNumberContainingIgnoreCaseAndEntryDateBetweenOrderByEntryDateAsc(institutionId, referenceNumber.trim(), start, end)
                : journalEntryRepository.findByInstitutionIdAndEntryDateBetweenOrderByEntryDateAsc(institutionId, start, end);
        if (entries.isEmpty()) return List.of();
        List<Long> ids = entries.stream().map(JournalEntry::getId).toList();
        List<JournalLine> allLines = journalLineRepository.findByJournalEntryIdIn(ids);
        Map<Long, List<JournalLine>> linesByEntry = allLines.stream().collect(Collectors.groupingBy(jl -> jl.getJournalEntry().getId()));
        return entries.stream()
                .map(e -> toEntryResponse(e, linesByEntry.getOrDefault(e.getId(), List.of())))
                .toList();
    }

    public Optional<JournalEntryResponse> getEntryResponse(Long id) {
        return journalEntryRepository.findById(id)
                .map(e -> toEntryResponse(e, journalLineRepository.findByJournalEntryId(e.getId())));
    }

    private JournalEntryResponse toEntryResponse(JournalEntry e, List<JournalLine> lines) {
        return JournalEntryResponse.builder()
                .id(e.getId())
                .institutionId(e.getInstitution() != null ? e.getInstitution().getId() : null)
                .referenceNumber(e.getReferenceNumber())
                .referenceType(e.getReferenceType())
                .referenceId(e.getReferenceId())
                .entryDate(e.getEntryDate())
                .description(e.getDescription())
                .totalDebit(e.getTotalDebit())
                .totalCredit(e.getTotalCredit())
                .lines(lines.stream().map(this::toLineDto).toList())
                .build();
    }

    private JournalLineDto toLineDto(JournalLine jl) {
        Account a = jl.getAccount();
        return JournalLineDto.builder()
                .accountId(a.getId())
                .accountCode(a.getCode())
                .accountName(a.getName())
                .accountType(a.getType())
                .debit(jl.getDebit())
                .credit(jl.getCredit())
                .memberId(jl.getMemberId())
                .productType(jl.getProductType())
                .productCategory(jl.getProductCategory())
                .build();
    }

    public Account createAccount(Long institutionId, String name, String code, AccountType type, Long parentAccountId) {
        var institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new CustomException("Institution not found", HttpStatus.NOT_FOUND.value()));
        Account account = new Account();
        account.setInstitution(institution);
        account.setName(name);
        account.setCode(code);
        account.setType(type);
        if (parentAccountId != null) {
            account.setParentAccount(accountRepository.findById(parentAccountId)
                    .orElseThrow(() -> new CustomException("Parent account not found", HttpStatus.NOT_FOUND.value())));
        }
        return accountRepository.save(account);
    }

    public List<Account> listAccounts(Long institutionId) {
        return accountRepository.findByInstitutionId(institutionId);
    }

    public List<Account> listAccountsActiveOnly(Long institutionId) {
        return accountRepository.findByInstitutionIdAndIsActiveTrue(institutionId);
    }

    /**
     * Returns the Cash (Asset) account for the institution, creating it if it does not exist.
     */
    @Transactional
    public Account getOrCreateCashAccount(Long institutionId) {
        return accountRepository.findByInstitutionIdAndCode(institutionId, CASH_ACCOUNT_CODE)
                .orElseGet(() -> createAccount(institutionId, "Cash", CASH_ACCOUNT_CODE, AccountType.ASSET, null));
    }
}
