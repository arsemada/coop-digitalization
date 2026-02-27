package com.coop.savings.service;

import com.coop.common.exception.CustomException;
import com.coop.config.security.SecurityUtils;
import com.coop.institution.repository.InstitutionRepository;
import com.coop.member.repository.MemberRepository;
import com.coop.savings.dto.*;
import com.coop.savings.entity.*;
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

    @Transactional
    public SavingsProduct createProduct(CreateSavingsProductRequest request) {
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
        return savingsProductRepository.save(product);
    }

    public List<SavingsProduct> listProductsBySacco(Long saccoId) {
        return savingsProductRepository.findBySaccoId(saccoId);
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
        return toAccountResponse(account);
    }

    @Transactional
    public SavingsTransaction recordTransaction(SavingsTransactionRequest request) {
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
        return txn;
    }

    public List<SavingsAccountResponse> listAccountsByMember(Long memberId) {
        return memberSavingsAccountRepository.findByMemberId(memberId).stream()
                .map(this::toAccountResponse)
                .collect(Collectors.toList());
    }

    public List<SavingsTransaction> listTransactions(Long accountId, int limit) {
        return savingsTransactionRepository.findByMemberSavingsAccountIdOrderByTransactionDateDesc(
                accountId, org.springframework.data.domain.PageRequest.of(0, limit));
    }

    private SavingsAccountResponse toAccountResponse(MemberSavingsAccount a) {
        return SavingsAccountResponse.builder()
                .id(a.getId())
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
}
