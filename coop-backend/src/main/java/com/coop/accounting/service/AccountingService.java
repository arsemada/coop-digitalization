package com.coop.accounting.service;

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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountingService {

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
            lineEntities.add(jl);
        }
        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new CustomException("Debits must equal credits", HttpStatus.BAD_REQUEST.value());
        }
        JournalEntry entry = new JournalEntry();
        entry.setInstitution(institution);
        entry.setEntryDate(entryDate != null ? entryDate : LocalDate.now());
        entry.setDescription(description);
        entry.setReferenceType(referenceType);
        entry.setReferenceId(referenceId);
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
}
