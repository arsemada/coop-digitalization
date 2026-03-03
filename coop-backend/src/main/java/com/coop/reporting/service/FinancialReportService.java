package com.coop.reporting.service;

import com.coop.accounting.entity.Account;
import com.coop.accounting.entity.AccountType;
import com.coop.accounting.entity.JournalLine;
import com.coop.accounting.repository.AccountRepository;
import com.coop.accounting.repository.JournalLineRepository;
import com.coop.common.exception.CustomException;
import com.coop.institution.repository.InstitutionRepository;
import com.coop.loan.entity.Loan;
import com.coop.loan.entity.LoanRepayment;
import com.coop.loan.entity.LoanStatus;
import com.coop.loan.repository.LoanRepository;
import com.coop.loan.repository.LoanRepaymentRepository;
import com.coop.member.repository.MemberRepository;
import com.coop.reporting.dto.*;
import com.coop.savings.entity.MemberSavingsAccount;
import com.coop.savings.entity.SavingsTransaction;
import com.coop.savings.entity.TransactionType;
import com.coop.savings.repository.MemberSavingsAccountRepository;
import com.coop.savings.repository.SavingsTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinancialReportService {

    private static final String CASH_ACCOUNT_CODE = "1000";

    private final JournalLineRepository journalLineRepository;
    private final AccountRepository accountRepository;
    private final InstitutionRepository institutionRepository;
    private final LoanRepository loanRepository;
    private final LoanRepaymentRepository loanRepaymentRepository;
    private final MemberRepository memberRepository;
    private final MemberSavingsAccountRepository memberSavingsAccountRepository;
    private final SavingsTransactionRepository savingsTransactionRepository;

    public TrialBalanceResponse trialBalance(Long institutionId, LocalDate start, LocalDate end, String periodLabel) {
        var institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new CustomException("Institution not found", HttpStatus.NOT_FOUND.value()));
        List<JournalLine> allLines = journalLineRepository.findAll().stream()
                .filter(jl -> jl.getJournalEntry().getInstitution().getId().equals(institutionId))
                .filter(jl -> !jl.getJournalEntry().getEntryDate().isBefore(start) && !jl.getJournalEntry().getEntryDate().isAfter(end))
                .toList();
        Map<Long, TrialBalanceResponse.TrialBalanceLine> byAccount = new LinkedHashMap<>();
        for (JournalLine jl : allLines) {
            Account acc = jl.getAccount();
            byAccount.compute(acc.getId(), (k, v) -> {
                BigDecimal d = (v != null ? v.getDebit() : BigDecimal.ZERO).add(jl.getDebit() != null ? jl.getDebit() : BigDecimal.ZERO);
                BigDecimal c = (v != null ? v.getCredit() : BigDecimal.ZERO).add(jl.getCredit() != null ? jl.getCredit() : BigDecimal.ZERO);
                return TrialBalanceResponse.TrialBalanceLine.builder()
                        .accountCode(acc.getCode())
                        .accountName(acc.getName())
                        .accountType(acc.getType())
                        .debit(d)
                        .credit(c)
                        .build();
            });
        }
        List<TrialBalanceResponse.TrialBalanceLine> lines = new ArrayList<>(byAccount.values());
        BigDecimal totalDebit = lines.stream().map(l -> l.getDebit() != null ? l.getDebit() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCredit = lines.stream().map(l -> l.getCredit() != null ? l.getCredit() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);
        return TrialBalanceResponse.builder()
                .institutionName(institution.getName())
                .periodLabel(periodLabel != null ? periodLabel : start + " to " + end)
                .startDate(start.toString())
                .endDate(end.toString())
                .lines(lines)
                .totalDebit(totalDebit)
                .totalCredit(totalCredit)
                .balanced(totalDebit.compareTo(totalCredit) == 0)
                .build();
    }

    public IncomeStatementResponse incomeStatement(Long institutionId, LocalDate start, LocalDate end, String periodLabel) {
        var institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new CustomException("Institution not found", HttpStatus.NOT_FOUND.value()));
        List<JournalLine> allLines = journalLineRepository.findAll().stream()
                .filter(jl -> jl.getJournalEntry().getInstitution().getId().equals(institutionId))
                .filter(jl -> !jl.getJournalEntry().getEntryDate().isBefore(start) && !jl.getJournalEntry().getEntryDate().isAfter(end))
                .toList();
        Map<Long, BigDecimal> incomeNet = new HashMap<>();
        Map<Long, BigDecimal> expenseNet = new HashMap<>();
        for (JournalLine jl : allLines) {
            Account acc = jl.getAccount();
            BigDecimal net = (jl.getDebit() != null ? jl.getDebit() : BigDecimal.ZERO).subtract(jl.getCredit() != null ? jl.getCredit() : BigDecimal.ZERO);
            if (acc.getType() == AccountType.INCOME) {
                incomeNet.merge(acc.getId(), net, BigDecimal::add);
            } else if (acc.getType() == AccountType.EXPENSE) {
                expenseNet.merge(acc.getId(), net.negate(), BigDecimal::add);
            }
        }
        List<IncomeStatementResponse.LineItem> incomeItems = toIncomeStatementLineItems(incomeNet, accountRepository);
        List<IncomeStatementResponse.LineItem> expenseItems = toIncomeStatementLineItems(expenseNet, accountRepository);
        BigDecimal totalIncome = incomeItems.stream().map(IncomeStatementResponse.LineItem::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpenses = expenseItems.stream().map(IncomeStatementResponse.LineItem::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        return IncomeStatementResponse.builder()
                .institutionName(institution.getName())
                .periodLabel(periodLabel != null ? periodLabel : start + " to " + end)
                .startDate(start.toString())
                .endDate(end.toString())
                .income(incomeItems)
                .expenses(expenseItems)
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netIncome(totalIncome.subtract(totalExpenses))
                .build();
    }

    public BalanceSheetResponse balanceSheet(Long institutionId, LocalDate asOf, String periodLabel) {
        var institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new CustomException("Institution not found", HttpStatus.NOT_FOUND.value()));
        List<JournalLine> allLines = journalLineRepository.findAll().stream()
                .filter(jl -> jl.getJournalEntry().getInstitution().getId().equals(institutionId))
                .filter(jl -> !jl.getJournalEntry().getEntryDate().isAfter(asOf))
                .toList();
        Map<Long, BigDecimal> assets = new HashMap<>();
        Map<Long, BigDecimal> liabilities = new HashMap<>();
        Map<Long, BigDecimal> equity = new HashMap<>();
        for (JournalLine jl : allLines) {
            Account acc = jl.getAccount();
            BigDecimal net = (jl.getDebit() != null ? jl.getDebit() : BigDecimal.ZERO).subtract(jl.getCredit() != null ? jl.getCredit() : BigDecimal.ZERO);
            switch (acc.getType()) {
                case ASSET -> assets.merge(acc.getId(), net, BigDecimal::add);
                case LIABILITY -> liabilities.merge(acc.getId(), net.negate(), BigDecimal::add);
                case EQUITY -> equity.merge(acc.getId(), net.negate(), BigDecimal::add);
                default -> {}
            }
        }
        List<BalanceSheetResponse.LineItem> assetItems = toBalanceSheetLineItems(assets, accountRepository);
        List<BalanceSheetResponse.LineItem> liabilityItems = toBalanceSheetLineItems(liabilities, accountRepository);
        List<BalanceSheetResponse.LineItem> equityItems = toBalanceSheetLineItems(equity, accountRepository);
        BigDecimal totalAssets = assetItems.stream().map(BalanceSheetResponse.LineItem::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLiabilities = liabilityItems.stream().map(BalanceSheetResponse.LineItem::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalEquity = equityItems.stream().map(BalanceSheetResponse.LineItem::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        return BalanceSheetResponse.builder()
                .institutionName(institution.getName())
                .periodLabel(periodLabel != null ? periodLabel : "As of " + asOf)
                .asOfDate(asOf.toString())
                .assets(assetItems)
                .liabilities(liabilityItems)
                .equity(equityItems)
                .totalAssets(totalAssets)
                .totalLiabilities(totalLiabilities)
                .totalEquity(totalEquity)
                .build();
    }

    public LoanPortfolioSummaryResponse loanPortfolioSummary(Long saccoId, LocalDate asOf, String periodLabel) {
        var institution = institutionRepository.findById(saccoId)
                .orElseThrow(() -> new CustomException("Institution not found", HttpStatus.NOT_FOUND.value()));
        List<Loan> all = loanRepository.findBySaccoId(saccoId);
        BigDecimal totalDisbursed = all.stream()
                .filter(l -> l.getDisbursementDate() != null)
                .map(Loan::getPrincipalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalOutstanding = all.stream()
                .filter(l -> l.getOutstandingBalance() != null)
                .map(Loan::getOutstandingBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long disbursedInPeriod = all.stream()
                .filter(l -> l.getDisbursementDate() != null && !l.getDisbursementDate().isAfter(asOf) && l.getDisbursementDate().isAfter(asOf.minusMonths(12)))
                .count();
        long closedInPeriod = all.stream()
                .filter(l -> l.getStatus() == LoanStatus.CLOSED)
                .count();
        return LoanPortfolioSummaryResponse.builder()
                .institutionName(institution.getName())
                .periodLabel(periodLabel != null ? periodLabel : "As of " + asOf)
                .asOfDate(asOf.toString())
                .totalLoans(all.size())
                .totalDisbursed(totalDisbursed)
                .totalOutstanding(totalOutstanding)
                .totalRepaid(totalDisbursed.subtract(totalOutstanding))
                .loansDisbursedInPeriod(disbursedInPeriod)
                .loansClosedInPeriod(closedInPeriod)
                .build();
    }

    public SavingsSummaryResponse savingsSummary(Long saccoId, LocalDate start, LocalDate end, String periodLabel) {
        var institution = institutionRepository.findById(saccoId)
                .orElseThrow(() -> new CustomException("Institution not found", HttpStatus.NOT_FOUND.value()));
        List<MemberSavingsAccount> accounts = memberSavingsAccountRepository.findAll().stream()
                .filter(a -> a.getSavingsProduct().getSacco().getId().equals(saccoId))
                .toList();
        BigDecimal totalBalance = accounts.stream().map(MemberSavingsAccount::getBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
        List<SavingsTransaction> inPeriod = savingsTransactionRepository.findAll().stream()
                .filter(t -> t.getMemberSavingsAccount().getSavingsProduct().getSacco().getId().equals(saccoId))
                .filter(t -> !t.getTransactionDate().isBefore(start) && !t.getTransactionDate().isAfter(end))
                .toList();
        long depositCount = inPeriod.stream().filter(t -> t.getType() == TransactionType.DEPOSIT).count();
        BigDecimal totalDeposits = inPeriod.stream().filter(t -> t.getType() == TransactionType.DEPOSIT).map(SavingsTransaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        long withdrawalCount = inPeriod.stream().filter(t -> t.getType() == TransactionType.WITHDRAWAL).count();
        BigDecimal totalWithdrawals = inPeriod.stream().filter(t -> t.getType() == TransactionType.WITHDRAWAL).map(SavingsTransaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        return SavingsSummaryResponse.builder()
                .institutionName(institution.getName())
                .periodLabel(periodLabel != null ? periodLabel : start + " to " + end)
                .asOfDate(end.toString())
                .totalAccounts(accounts.size())
                .totalBalance(totalBalance)
                .depositCountInPeriod(depositCount)
                .totalDepositsInPeriod(totalDeposits)
                .withdrawalCountInPeriod(withdrawalCount)
                .totalWithdrawalsInPeriod(totalWithdrawals)
                .build();
    }

    private List<IncomeStatementResponse.LineItem> toIncomeStatementLineItems(Map<Long, BigDecimal> map, AccountRepository accountRepository) {
        return map.entrySet().stream()
                .filter(e -> e.getValue().compareTo(BigDecimal.ZERO) != 0)
                .map(e -> {
                    Account acc = accountRepository.findById(e.getKey()).orElse(null);
                    return IncomeStatementResponse.LineItem.builder()
                            .amount(e.getValue())
                            .accountCode(acc != null ? acc.getCode() : "")
                            .accountName(acc != null ? acc.getName() : "")
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<BalanceSheetResponse.LineItem> toBalanceSheetLineItems(Map<Long, BigDecimal> map, AccountRepository accountRepository) {
        return map.entrySet().stream()
                .filter(e -> e.getValue().compareTo(BigDecimal.ZERO) != 0)
                .map(e -> {
                    Account acc = accountRepository.findById(e.getKey()).orElse(null);
                    return BalanceSheetResponse.LineItem.builder()
                            .amount(e.getValue())
                            .accountCode(acc != null ? acc.getCode() : "")
                            .accountName(acc != null ? acc.getName() : "")
                            .build();
                })
                .collect(Collectors.toList());
    }

    /** Savings summary grouped by product type/category from journal lines (financial truth). */
    public SavingsByProductResponse savingsSummaryByProduct(Long institutionId, LocalDate start, LocalDate end, String periodLabel) {
        var institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new CustomException("Institution not found", HttpStatus.NOT_FOUND.value()));
        List<JournalLine> lines = journalLineRepository.findByInstitutionAndDateRange(institutionId, start, end);
        Map<String, SavingsByProductResponse.Row> byCategory = new LinkedHashMap<>();
        for (JournalLine jl : lines) {
            if (!"Savings".equals(jl.getProductType())) continue;
            String cat = jl.getProductCategory() != null ? jl.getProductCategory() : "Regular";
            byCategory.compute(cat, (k, row) -> {
                BigDecimal d = jl.getDebit() != null ? jl.getDebit() : BigDecimal.ZERO;
                BigDecimal c = jl.getCredit() != null ? jl.getCredit() : BigDecimal.ZERO;
                BigDecimal deposits = (row != null ? row.getTotalDeposits() : BigDecimal.ZERO).add(c);
                BigDecimal withdrawals = (row != null ? row.getTotalWithdrawals() : BigDecimal.ZERO).add(d);
                return SavingsByProductResponse.Row.builder()
                        .productType("Savings")
                        .productCategory(k)
                        .totalDeposits(deposits)
                        .totalWithdrawals(withdrawals)
                        .netBalance(deposits.subtract(withdrawals))
                        .build();
            });
        }
        List<SavingsByProductResponse.Row> rows = new ArrayList<>(byCategory.values());
        return SavingsByProductResponse.builder()
                .institutionName(institution.getName())
                .periodLabel(periodLabel != null ? periodLabel : start + " to " + end)
                .startDate(start.toString())
                .endDate(end.toString())
                .rows(rows)
                .build();
    }

    /** Loan summary: total disbursed, repaid, outstanding, interest collected (from loan/repayment entities). */
    public LoanSummaryResponse loanSummary(Long saccoId, LocalDate asOf, String periodLabel) {
        var institution = institutionRepository.findById(saccoId)
                .orElseThrow(() -> new CustomException("Institution not found", HttpStatus.NOT_FOUND.value()));
        List<Loan> loans = loanRepository.findBySaccoId(saccoId);
        List<LoanRepayment> repayments = loanRepaymentRepository.findByLoan_Sacco_IdOrderByPaymentDateDesc(saccoId);
        BigDecimal totalDisbursed = loans.stream()
                .filter(l -> l.getDisbursementDate() != null && !l.getDisbursementDate().isAfter(asOf))
                .map(Loan::getPrincipalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalOutstanding = loans.stream()
                .filter(l -> l.getOutstandingBalance() != null)
                .map(Loan::getOutstandingBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalRepaid = totalDisbursed.subtract(totalOutstanding);
        BigDecimal totalInterest = repayments.stream()
                .filter(r -> r.getPaymentDate() != null && !r.getPaymentDate().isAfter(asOf))
                .map(r -> r.getInterestComponent() != null ? r.getInterestComponent() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        LoanSummaryResponse.LoanSummaryRow row = LoanSummaryResponse.LoanSummaryRow.builder()
                .category("All")
                .totalDisbursed(totalDisbursed)
                .totalRepaid(totalRepaid)
                .outstanding(totalOutstanding)
                .interestCollected(totalInterest)
                .build();
        return LoanSummaryResponse.builder()
                .institutionName(institution.getName())
                .periodLabel(periodLabel != null ? periodLabel : "As of " + asOf)
                .asOfDate(asOf.toString())
                .rows(List.of(row))
                .totalDisbursed(totalDisbursed)
                .totalRepaid(totalRepaid)
                .totalOutstanding(totalOutstanding)
                .totalInterestCollected(totalInterest)
                .build();
    }

    /** Member financial summary: per-member savings balance, loans, outstanding, interest paid. */
    public MemberFinancialSummaryResponse memberFinancialSummary(Long saccoId, LocalDate asOf, String periodLabel) {
        var institution = institutionRepository.findById(saccoId)
                .orElseThrow(() -> new CustomException("Institution not found", HttpStatus.NOT_FOUND.value()));
        List<com.coop.member.entity.Member> members = memberRepository.findBySaccoId(saccoId);
        List<MemberFinancialSummaryResponse.Row> rows = new ArrayList<>();
        for (com.coop.member.entity.Member m : members) {
            BigDecimal totalSavings = memberSavingsAccountRepository.findByMemberId(m.getId()).stream()
                    .map(MemberSavingsAccount::getBalance)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            List<Loan> memberLoans = loanRepository.findByMemberId(m.getId());
            BigDecimal totalLoans = memberLoans.stream().map(Loan::getPrincipalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal outstanding = memberLoans.stream()
                    .map(l -> l.getOutstandingBalance() != null ? l.getOutstandingBalance() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal interestPaid = BigDecimal.ZERO;
            for (Loan loan : memberLoans) {
                interestPaid = interestPaid.add(
                        loanRepaymentRepository.findByLoanIdOrderByPaymentDateDesc(loan.getId()).stream()
                                .map(r -> r.getInterestComponent() != null ? r.getInterestComponent() : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add));
            }
            rows.add(MemberFinancialSummaryResponse.Row.builder()
                    .memberId(m.getId())
                    .memberName(m.getFullName())
                    .memberNumber(m.getMemberNumber())
                    .totalSavings(totalSavings)
                    .totalLoans(totalLoans)
                    .outstandingLoan(outstanding)
                    .interestPaid(interestPaid)
                    .build());
        }
        return MemberFinancialSummaryResponse.builder()
                .institutionName(institution.getName())
                .periodLabel(periodLabel != null ? periodLabel : "As of " + asOf)
                .asOfDate(asOf.toString())
                .rows(rows)
                .build();
    }

    /** Cash flow: opening balance, movements by type, closing balance (from journal lines to cash account). */
    public CashFlowResponse cashFlowReport(Long institutionId, LocalDate start, LocalDate end, String periodLabel) {
        var institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new CustomException("Institution not found", HttpStatus.NOT_FOUND.value()));
        var cashAccountOpt = accountRepository.findByInstitutionIdAndCode(institutionId, CASH_ACCOUNT_CODE);
        if (cashAccountOpt.isEmpty()) {
            return CashFlowResponse.builder()
                    .institutionName(institution.getName())
                    .periodLabel(periodLabel != null ? periodLabel : start + " to " + end)
                    .startDate(start.toString())
                    .endDate(end.toString())
                    .openingBalance(BigDecimal.ZERO)
                    .savingsDeposits(BigDecimal.ZERO)
                    .loanRepayments(BigDecimal.ZERO)
                    .loanDisbursements(BigDecimal.ZERO)
                    .withdrawals(BigDecimal.ZERO)
                    .expenses(BigDecimal.ZERO)
                    .closingBalance(BigDecimal.ZERO)
                    .build();
        }
        Long cashId = cashAccountOpt.get().getId();
        List<JournalLine> allCashLines = journalLineRepository.findByAccountAndInstitutionAndDateRange(cashId, institutionId, LocalDate.EPOCH, end);
        BigDecimal openingBalance = BigDecimal.ZERO;
        for (JournalLine jl : allCashLines) {
            if (jl.getJournalEntry().getEntryDate().isBefore(start)) {
                openingBalance = openingBalance.add(jl.getDebit() != null ? jl.getDebit() : BigDecimal.ZERO).subtract(jl.getCredit() != null ? jl.getCredit() : BigDecimal.ZERO);
            }
        }
        List<JournalLine> periodLines = journalLineRepository.findByAccountAndInstitutionAndDateRange(cashId, institutionId, start, end);
        BigDecimal totalDebits = BigDecimal.ZERO;
        BigDecimal totalCredits = BigDecimal.ZERO;
        BigDecimal savingsDeposits = BigDecimal.ZERO;
        BigDecimal withdrawals = BigDecimal.ZERO;
        for (JournalLine jl : periodLines) {
            BigDecimal d = jl.getDebit() != null ? jl.getDebit() : BigDecimal.ZERO;
            BigDecimal c = jl.getCredit() != null ? jl.getCredit() : BigDecimal.ZERO;
            totalDebits = totalDebits.add(d);
            totalCredits = totalCredits.add(c);
            String refType = jl.getJournalEntry().getReferenceType();
            if ("SAVINGS_TRANSACTION".equals(refType)) {
                savingsDeposits = savingsDeposits.add(d);
                withdrawals = withdrawals.add(c);
            }
        }
        BigDecimal closingBalance = openingBalance.add(totalDebits).subtract(totalCredits);
        return CashFlowResponse.builder()
                .institutionName(institution.getName())
                .periodLabel(periodLabel != null ? periodLabel : start + " to " + end)
                .startDate(start.toString())
                .endDate(end.toString())
                .openingBalance(openingBalance)
                .savingsDeposits(savingsDeposits)
                .loanRepayments(BigDecimal.ZERO)
                .loanDisbursements(BigDecimal.ZERO)
                .withdrawals(withdrawals)
                .expenses(totalCredits.subtract(withdrawals).max(BigDecimal.ZERO))
                .closingBalance(closingBalance)
                .build();
    }
}
