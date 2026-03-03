package com.coop.accounting.service;

import com.coop.accounting.dto.GeneralLedgerRow;
import com.coop.accounting.dto.MemberLedgerRow;
import com.coop.accounting.entity.JournalLine;
import com.coop.accounting.repository.JournalLineRepository;
import com.coop.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LedgerService {

    private final JournalLineRepository journalLineRepository;
    private final MemberRepository memberRepository;

    /**
     * Member ledger: lines for the given member in date range, with running balance.
     */
    public List<MemberLedgerRow> getMemberLedger(Long memberId, Long institutionId, LocalDate start, LocalDate end) {
        List<JournalLine> lines = journalLineRepository.findByMemberIdAndInstitutionAndDateRange(memberId, institutionId, start, end);
        String memberName = memberRepository.findById(memberId).map(m -> m.getFullName()).orElse("Member #" + memberId);
        List<MemberLedgerRow> rows = new ArrayList<>();
        BigDecimal runningBalance = BigDecimal.ZERO;
        for (JournalLine jl : lines) {
            BigDecimal debit = jl.getDebit() != null ? jl.getDebit() : BigDecimal.ZERO;
            BigDecimal credit = jl.getCredit() != null ? jl.getCredit() : BigDecimal.ZERO;
            // Member perspective: credits (deposits) increase balance, debits (withdrawals) decrease it
            runningBalance = runningBalance.add(credit).subtract(debit);
            rows.add(MemberLedgerRow.builder()
                    .date(jl.getJournalEntry().getEntryDate())
                    .memberName(memberName)
                    .productType(jl.getProductType())
                    .description(jl.getJournalEntry().getDescription())
                    .debit(debit)
                    .credit(credit)
                    .runningBalance(runningBalance)
                    .build());
        }
        return rows;
    }

    /**
     * General ledger: lines for the given account in date range, with running balance.
     */
    public List<GeneralLedgerRow> getGeneralLedger(Long accountId, Long institutionId, LocalDate start, LocalDate end) {
        List<JournalLine> lines = journalLineRepository.findByAccountAndInstitutionAndDateRange(accountId, institutionId, start, end);
        List<GeneralLedgerRow> rows = new ArrayList<>();
        BigDecimal balance = BigDecimal.ZERO;
        for (JournalLine jl : lines) {
            BigDecimal debit = jl.getDebit() != null ? jl.getDebit() : BigDecimal.ZERO;
            BigDecimal credit = jl.getCredit() != null ? jl.getCredit() : BigDecimal.ZERO;
            balance = balance.add(debit).subtract(credit);
            rows.add(GeneralLedgerRow.builder()
                    .date(jl.getJournalEntry().getEntryDate())
                    .accountName(jl.getAccount().getName())
                    .accountCode(jl.getAccount().getCode())
                    .description(jl.getJournalEntry().getDescription())
                    .debit(debit)
                    .credit(credit)
                    .balance(balance)
                    .build());
        }
        return rows;
    }
}
