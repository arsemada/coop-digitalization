package com.coop.savings.service;

import com.coop.accounting.entity.AccountType;
import com.coop.accounting.service.AccountingService;
import com.coop.common.exception.CustomException;
import com.coop.config.security.SecurityUtils;
import com.coop.institution.repository.InstitutionRepository;
import com.coop.member.repository.MemberRepository;
import com.coop.savings.dto.CreateSavingsProductRequest;
import com.coop.savings.dto.OpenSavingsAccountRequest;
import com.coop.savings.dto.SavingsAccountResponse;
import com.coop.savings.dto.SavingsProductResponse;
import com.coop.savings.dto.SavingsTransactionRequest;
import com.coop.savings.dto.SavingsTransactionResponse;
import com.coop.savings.entity.MemberSavingsAccount;
import com.coop.savings.entity.SavingsProduct;
import com.coop.savings.entity.SavingsTransaction;
import com.coop.savings.entity.TransactionType;
import com.coop.savings.repository.MemberSavingsAccountRepository;
import com.coop.savings.repository.SavingsProductRepository;
import com.coop.savings.repository.SavingsTransactionRepository;
import com.coop.user.entity.User;
import com.coop.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavingsService {

    private final SavingsProductRepository savingsProductRepository;
    private final MemberSavingsAccountRepository memberSavingsAccountRepository;
    private final SavingsTransactionRepository savingsTransactionRepository;
    private final InstitutionRepository institutionRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final AccountingService accountingService;

    @Transactional
    public SavingsProductResponse createProduct(CreateSavingsProductRequest request) {
        if (!SecurityUtils.canAccessInstitution(request.getSaccoId())) {
            throw new CustomException("Access denied to this institution", 403);
        }
        var sacco = institutionRepository.findById(request.getSaccoId())
                .orElseThrow(() -> new CustomException("SACCO not found", HttpStatus.NOT_FOUND.value()));
        SavingsProduct product = new SavingsProduct();
        product.setSacco(sacco);
        product.setName(request.getName());
        product.setCategory(request.getCategory());
        product.setInterestRate(request.getInterestRate() != null ? request.getInterestRate() : BigDecimal.ZERO);
        product.setRequiresMaturity(request.isRequiresMaturity());
        product = savingsProductRepository.save(product);
        return toProductResponse(product);
    }

    public List<SavingsProductResponse> listProductsBySacco(Long saccoId) {
        return savingsProductRepository.findBySaccoId(saccoId).stream()
                .map(this::toProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SavingsAccountResponse openAccount(OpenSavingsAccountRequest request) {
        var member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new CustomException("Member not found", HttpStatus.NOT_FOUND.value()));
        var product = savingsProductRepository.findById(request.getSavingsProductId())
                .orElseThrow(() -> new CustomException("Savings product not found", HttpStatus.NOT_FOUND.value()));
        if (memberSavingsAccountRepository.findByMemberIdAndSavingsProductId(request.getMemberId(), request.getSavingsProductId()).isPresent()) {
            throw new CustomException("Member already has an account for this product", HttpStatus.CONFLICT.value());
        }
        MemberSavingsAccount account = new MemberSavingsAccount();
        account.setMember(member);
        account.setSavingsProduct(product);
        account.setOpenedDate(LocalDate.now());
        account = memberSavingsAccountRepository.save(account);
        account.setAccountNumber("SAV-" + String.format("%06d", account.getId()));
        account = memberSavingsAccountRepository.save(account);
        // Step 1: Each saving category gets a separate GL liability account.
        String liabilityCode = "SL-" + member.getId() + "-" + product.getId();
        String liabilityName = "Member Savings - " + member.getMemberNumber() + " - " + product.getName();
        var liabilityAccount = accountingService.createAccount(
                member.getSacco().getId(), liabilityName, liabilityCode, AccountType.LIABILITY, null);
        account.setLiabilityAccount(liabilityAccount);
        account = memberSavingsAccountRepository.save(account);
        return toAccountResponse(account);
    }

    @Transactional
    public SavingsTransactionResponse recordTransaction(SavingsTransactionRequest request) {
        var account = memberSavingsAccountRepository.findById(request.getMemberSavingsAccountId())
                .orElseThrow(() -> new CustomException("Savings account not found", HttpStatus.NOT_FOUND.value()));
        if (!"ACTIVE".equals(account.getStatus())) {
            throw new CustomException("Account is not active", HttpStatus.BAD_REQUEST.value());
        }
        BigDecimal amount = request.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CustomException("Amount must be positive", HttpStatus.BAD_REQUEST.value());
        }
        if (request.getType() == TransactionType.WITHDRAWAL && account.getBalance().compareTo(amount) < 0) {
            throw new CustomException("Insufficient balance", HttpStatus.BAD_REQUEST.value());
        }
        LocalDate txnDate = request.getTransactionDate() != null ? request.getTransactionDate() : LocalDate.now();
        SavingsTransaction txn = new SavingsTransaction();
        txn.setMemberSavingsAccount(account);
        txn.setType(request.getType());
        txn.setAmount(amount);
        txn.setTransactionDate(txnDate);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByUsername(username).ifPresent(txn::setCreatedBy);
        txn = savingsTransactionRepository.save(txn);
        account.setBalance(request.getType() == TransactionType.DEPOSIT
                ? account.getBalance().add(amount)
                : account.getBalance().subtract(amount));
        memberSavingsAccountRepository.save(account);

        // Step 2: Double-entry: Deposit → Debit Cash, Credit Member Savings Liability; Withdrawal → Debit Liability, Credit Cash
        ensureLiabilityAccount(account);
        var saccoId = account.getMember().getSacco().getId();
        var cashAccount = accountingService.getOrCreateCashAccount(saccoId);
        var liabilityAccount = account.getLiabilityAccount();
        List<Map<String, Object>> lines;
        if (request.getType() == TransactionType.DEPOSIT) {
            lines = List.of(
                    Map.of("accountId", cashAccount.getId(), "debit", amount, "credit", BigDecimal.ZERO),
                    Map.of("accountId", liabilityAccount.getId(), "debit", BigDecimal.ZERO, "credit", amount)
            );
        } else {
            lines = List.of(
                    Map.of("accountId", liabilityAccount.getId(), "debit", amount, "credit", BigDecimal.ZERO),
                    Map.of("accountId", cashAccount.getId(), "debit", BigDecimal.ZERO, "credit", amount)
            );
        }
        String description = request.getType() == TransactionType.DEPOSIT ? "Savings deposit" : "Savings withdrawal";
        accountingService.postEntry(saccoId, txnDate, description, "SAVINGS_TRANSACTION", txn.getId(), lines);

        return toTransactionResponse(txn);
    }

    @Transactional(readOnly = true)
    public List<SavingsAccountResponse> listAccountsByMember(Long memberId) {
        return memberSavingsAccountRepository.findByMemberId(memberId).stream()
                .map(this::toAccountResponse)
                .collect(Collectors.toList());
    }

    public List<SavingsTransactionResponse> listTransactions(Long accountId, int limit) {
        return savingsTransactionRepository.findByMemberSavingsAccountIdOrderByTransactionDateDesc(
                accountId, org.springframework.data.domain.PageRequest.of(0, limit))
                .stream()
                .map(this::toTransactionResponse)
                .collect(Collectors.toList());
    }

    private SavingsProductResponse toProductResponse(SavingsProduct p) {
        return SavingsProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .category(p.getCategory())
                .interestRate(p.getInterestRate() != null ? p.getInterestRate() : BigDecimal.ZERO)
                .requiresMaturity(p.isRequiresMaturity())
                .build();
    }

    private SavingsTransactionResponse toTransactionResponse(SavingsTransaction t) {
        return SavingsTransactionResponse.builder()
                .id(t.getId())
                .memberSavingsAccountId(t.getMemberSavingsAccount().getId())
                .type(t.getType())
                .amount(t.getAmount())
                .transactionDate(t.getTransactionDate())
                .createdAt(t.getCreatedAt())
                .build();
    }

    private SavingsAccountResponse toAccountResponse(MemberSavingsAccount a) {
        String accountNo = a.getAccountNumber();
        if (accountNo == null || accountNo.isBlank()) {
            accountNo = "SAV-" + String.format("%06d", a.getId());
        }
        return SavingsAccountResponse.builder()
                .id(a.getId())
                .accountNumber(accountNo)
                .memberId(a.getMember().getId())
                .memberName(a.getMember().getFullName())
                .memberNumber(a.getMember().getMemberNumber())
                .savingsProductId(a.getSavingsProduct().getId())
                .productName(a.getSavingsProduct().getName())
                .productCategory(a.getSavingsProduct().getCategory())
                .balance(a.getBalance())
                .status(a.getStatus())
                .openedDate(a.getOpenedDate())
                .build();
    }

    /** Ensures this member savings account has a GL liability account (creates one if missing, e.g. for legacy data). */
    public void ensureLiabilityAccount(MemberSavingsAccount account) {
        if (account.getLiabilityAccount() != null) return;
        var member = account.getMember();
        var product = account.getSavingsProduct();
        String liabilityCode = "SL-" + member.getId() + "-" + product.getId();
        String liabilityName = "Member Savings - " + member.getMemberNumber() + " - " + product.getName();
        var liabilityAccount = accountingService.createAccount(
                member.getSacco().getId(), liabilityName, liabilityCode, AccountType.LIABILITY, null);
        account.setLiabilityAccount(liabilityAccount);
        memberSavingsAccountRepository.save(account);
    }
}
