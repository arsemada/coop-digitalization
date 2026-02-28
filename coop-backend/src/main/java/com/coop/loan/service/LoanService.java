package com.coop.loan.service;

import com.coop.common.exception.CustomException;
import com.coop.config.security.SecurityUtils;
import com.coop.institution.repository.InstitutionRepository;
import com.coop.loan.dto.*;
import com.coop.loan.entity.*;
import com.coop.loan.repository.LoanRepaymentRepository;
import com.coop.loan.repository.LoanRepository;
import com.coop.loan.repository.LoanScheduleRepository;
import com.coop.member.repository.MemberRepository;
import com.coop.savings.repository.MemberSavingsAccountRepository;
import com.coop.user.entity.User;
import com.coop.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final LoanScheduleRepository loanScheduleRepository;
    private final LoanRepaymentRepository loanRepaymentRepository;
    private final MemberRepository memberRepository;
    private final InstitutionRepository institutionRepository;
    private final MemberSavingsAccountRepository memberSavingsAccountRepository;
    private final UserRepository userRepository;

    @Transactional
    public LoanResponse apply(LoanApplicationRequest request) {
        Long memberId = request.getMemberId();
        Long saccoId = request.getSaccoId();
        if (SecurityUtils.getCurrentRole() == com.coop.user.entity.Role.MEMBER) {
            var memberOpt = memberRepository.findByMemberNumber(SecurityUtils.getCurrentUser().getUsername());
            if (memberOpt.isEmpty()) throw new CustomException("Member record not found", HttpStatus.NOT_FOUND.value());
            memberId = memberOpt.get().getId();
            saccoId = SecurityUtils.getCurrentInstitutionId();
            request.setMemberId(memberId);
            request.setSaccoId(saccoId);
        }
        if (memberId == null || saccoId == null || !SecurityUtils.canAccessInstitution(saccoId)) {
            throw new CustomException("Access denied", HttpStatus.FORBIDDEN.value());
        }
        var member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException("Member not found", HttpStatus.NOT_FOUND.value()));
        var sacco = institutionRepository.findById(saccoId)
                .orElseThrow(() -> new CustomException("SACCO not found", HttpStatus.NOT_FOUND.value()));
        var collateralAccount = request.getMemberSavingsAccountId() != null
                ? memberSavingsAccountRepository.findById(request.getMemberSavingsAccountId())
                        .orElseThrow(() -> new CustomException("Savings account not found", HttpStatus.NOT_FOUND.value()))
                : null;
        if (collateralAccount != null && !collateralAccount.getMember().getId().equals(member.getId())) {
            throw new CustomException("Savings account does not belong to this member", HttpStatus.BAD_REQUEST.value());
        }
        Loan loan = new Loan();
        loan.setMember(member);
        loan.setSacco(sacco);
        loan.setPrincipalAmount(request.getPrincipalAmount());
        BigDecimal rate = request.getInterestRate();
        if (SecurityUtils.getCurrentRole() == com.coop.user.entity.Role.MEMBER && sacco.getDefaultLoanInterestRate() != null) {
            rate = sacco.getDefaultLoanInterestRate();
        }
        loan.setInterestRate(rate != null ? rate : java.math.BigDecimal.valueOf(12));
        loan.setTermInMonths(request.getTermInMonths());
        loan.setLoanReason(request.getLoanReason());
        loan.setCollateralSavingsAccount(collateralAccount);
        loan.setStatus(LoanStatus.PENDING_APPROVAL);
        loan = loanRepository.save(loan);
        return toResponse(loan, null);
    }

    @Transactional
    public LoanResponse approve(Long loanId, LoanApprovalRequest request) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new CustomException("Loan not found", HttpStatus.NOT_FOUND.value()));
        if (loan.getStatus() != LoanStatus.PENDING_APPROVAL) {
            throw new CustomException("Loan is not pending approval", HttpStatus.BAD_REQUEST.value());
        }
        if (request.isApproved()) {
            loan.setStatus(LoanStatus.APPROVED);
            loan = loanRepository.save(loan);
        } else {
            loan.setStatus(LoanStatus.REJECTED);
            loan = loanRepository.save(loan);
        }
        return toResponse(loan, loanScheduleRepository.findByLoanIdOrderByInstallmentNumber(loanId));
    }

    @Transactional
    public LoanResponse disburse(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new CustomException("Loan not found", HttpStatus.NOT_FOUND.value()));
        if (loan.getStatus() != LoanStatus.APPROVED) {
            throw new CustomException("Loan must be approved before disbursement", HttpStatus.BAD_REQUEST.value());
        }
        loan.setStatus(LoanStatus.DISBURSED);
        loan.setDisbursementDate(LocalDate.now());
        loan = loanRepository.save(loan);
        // Generate schedule (simple flat interest)
        BigDecimal principal = loan.getPrincipalAmount();
        BigDecimal monthlyRate = loan.getInterestRate().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP).divide(BigDecimal.valueOf(12), 6, RoundingMode.HALF_UP);
        BigDecimal totalInterest = principal.multiply(monthlyRate).multiply(BigDecimal.valueOf(loan.getTermInMonths()));
        BigDecimal totalDue = principal.add(totalInterest);
        BigDecimal installmentAmount = totalDue.divide(BigDecimal.valueOf(loan.getTermInMonths()), 2, RoundingMode.HALF_UP);
        BigDecimal principalPerMonth = principal.divide(BigDecimal.valueOf(loan.getTermInMonths()), 2, RoundingMode.HALF_UP);
        BigDecimal interestPerMonth = totalInterest.divide(BigDecimal.valueOf(loan.getTermInMonths()), 2, RoundingMode.HALF_UP);
        LocalDate due = loan.getDisbursementDate().plusMonths(1);
        for (int i = 1; i <= loan.getTermInMonths(); i++) {
            LoanSchedule schedule = new LoanSchedule();
            schedule.setLoan(loan);
            schedule.setInstallmentNumber(i);
            schedule.setDueDate(due.plusMonths(i - 1));
            schedule.setPrincipalDue(principalPerMonth);
            schedule.setInterestDue(interestPerMonth);
            schedule.setTotalDue(installmentAmount);
            loanScheduleRepository.save(schedule);
        }
        loan.setStatus(LoanStatus.REPAYING);
        loanRepository.save(loan);
        return getById(loanId);
    }

    @Transactional
    public LoanRepaymentResponse recordRepayment(LoanRepaymentRequest request) {
        Loan loan = loanRepository.findById(request.getLoanId())
                .orElseThrow(() -> new CustomException("Loan not found", HttpStatus.NOT_FOUND.value()));
        if (SecurityUtils.getCurrentRole() == com.coop.user.entity.Role.MEMBER) {
            var memberOpt = memberRepository.findByMemberNumber(SecurityUtils.getCurrentUser().getUsername());
            if (memberOpt.isEmpty() || !loan.getMember().getId().equals(memberOpt.get().getId())) {
                throw new CustomException("Access denied. You can only record repayments for your own loans.", HttpStatus.FORBIDDEN.value());
            }
        }
        if (loan.getStatus() != LoanStatus.REPAYING && loan.getStatus() != LoanStatus.DISBURSED) {
            throw new CustomException("Loan is not in repayment", HttpStatus.BAD_REQUEST.value());
        }
        BigDecimal amount = request.getAmountPaid();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CustomException("Amount must be positive", HttpStatus.BAD_REQUEST.value());
        }
        LocalDate paymentDate = request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now();
        Integer targetInstallment = request.getInstallmentNumber();
        List<LoanSchedule> unpaid = loanScheduleRepository.findByLoanIdOrderByInstallmentNumber(loan.getId()).stream()
                .filter(s -> !s.isPaid())
                .filter(s -> targetInstallment == null || s.getInstallmentNumber() == targetInstallment)
                .collect(Collectors.toList());
        if (targetInstallment != null && unpaid.isEmpty()) {
            throw new CustomException("Installment " + targetInstallment + " is not found or already paid", HttpStatus.BAD_REQUEST.value());
        }
        // Apply payment per installment: interest first, then principal (standard loan accounting)
        BigDecimal principalComponent = BigDecimal.ZERO;
        BigDecimal interestComponent = BigDecimal.ZERO;
        BigDecimal remaining = amount;
        for (LoanSchedule s : unpaid) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;
            BigDecimal principalDue = s.getPrincipalDue() != null ? s.getPrincipalDue() : BigDecimal.ZERO;
            BigDecimal interestDue = s.getInterestDue() != null ? s.getInterestDue() : BigDecimal.ZERO;
            BigDecimal toInterest = BigDecimal.ZERO;
            BigDecimal toPrincipal = BigDecimal.ZERO;
            // 1. Pay interest first for this installment
            if (interestDue.compareTo(BigDecimal.ZERO) > 0 && remaining.compareTo(BigDecimal.ZERO) > 0) {
                toInterest = interestDue.min(remaining);
                remaining = remaining.subtract(toInterest);
                interestComponent = interestComponent.add(toInterest);
            }
            // 2. Pay principal for this installment
            if (principalDue.compareTo(BigDecimal.ZERO) > 0 && remaining.compareTo(BigDecimal.ZERO) > 0) {
                toPrincipal = principalDue.min(remaining);
                remaining = remaining.subtract(toPrincipal);
                principalComponent = principalComponent.add(toPrincipal);
            }
            // 3. Mark installment paid only when both interest and principal are fully covered
            boolean interestFullyPaid = toInterest.compareTo(interestDue) >= 0 || interestDue.compareTo(BigDecimal.ZERO) == 0;
            boolean principalFullyPaid = toPrincipal.compareTo(principalDue) >= 0 || principalDue.compareTo(BigDecimal.ZERO) == 0;
            if (interestFullyPaid && principalFullyPaid) {
                s.setPaid(true);
                loanScheduleRepository.save(s);
            }
        }
        LoanRepayment repayment = new LoanRepayment();
        repayment.setLoan(loan);
        repayment.setAmountPaid(amount);
        repayment.setPrincipalComponent(principalComponent);
        repayment.setInterestComponent(interestComponent);
        repayment.setPaymentDate(paymentDate);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByUsername(username).ifPresent(repayment::setRecordedBy);
        repayment = loanRepaymentRepository.save(repayment);
        BigDecimal totalPrincipalPaid = loanRepaymentRepository.sumPrincipalComponentByLoanId(loan.getId());
        if (totalPrincipalPaid.compareTo(loan.getPrincipalAmount()) >= 0) {
            loan.setStatus(LoanStatus.CLOSED);
            loanRepository.save(loan);
        }
        return toRepaymentResponse(repayment);
    }

    public List<LoanRepaymentResponse> listRepaymentsBySacco(Long saccoId) {
        if (!SecurityUtils.canAccessInstitution(saccoId)) {
            throw new CustomException("Access denied to this institution", HttpStatus.FORBIDDEN.value());
        }
        return loanRepaymentRepository.findByLoan_Sacco_IdOrderByPaymentDateDesc(saccoId).stream()
                .map(this::toRepaymentResponse)
                .collect(Collectors.toList());
    }

    private LoanRepaymentResponse toRepaymentResponse(LoanRepayment r) {
        Loan loan = r.getLoan();
        return LoanRepaymentResponse.builder()
                .id(r.getId())
                .loanId(loan.getId())
                .memberName(loan.getMember().getFullName())
                .memberNumber(loan.getMember().getMemberNumber())
                .amountPaid(r.getAmountPaid())
                .principalComponent(r.getPrincipalComponent())
                .interestComponent(r.getInterestComponent())
                .paymentDate(r.getPaymentDate())
                .recordedBy(r.getRecordedBy() != null ? r.getRecordedBy().getUsername() : null)
                .createdAt(r.getCreatedAt())
                .build();
    }

    public LoanResponse getById(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new CustomException("Loan not found", HttpStatus.NOT_FOUND.value()));
        List<LoanSchedule> schedule = loanScheduleRepository.findByLoanIdOrderByInstallmentNumber(loanId);
        return toResponse(loan, schedule);
    }

    public List<LoanResponse> listByMember(Long memberId) {
        if (SecurityUtils.getCurrentRole() == com.coop.user.entity.Role.MEMBER) {
            var memberOpt = memberRepository.findByMemberNumber(SecurityUtils.getCurrentUser().getUsername());
            if (memberOpt.isEmpty() || !memberOpt.get().getId().equals(memberId)) {
                throw new CustomException("Access denied", HttpStatus.FORBIDDEN.value());
            }
        } else if (!SecurityUtils.canAccessInstitution(
                memberRepository.findById(memberId).map(m -> m.getSacco().getId()).orElse(null))) {
            throw new CustomException("Access denied", HttpStatus.FORBIDDEN.value());
        }
        return loanRepository.findByMemberId(memberId).stream()
                .map(l -> toResponse(l, loanScheduleRepository.findByLoanIdOrderByInstallmentNumber(l.getId())))
                .collect(Collectors.toList());
    }

    public List<LoanResponse> listBySacco(Long saccoId) {
        return loanRepository.findBySaccoId(saccoId).stream()
                .map(l -> toResponse(l, loanScheduleRepository.findByLoanIdOrderByInstallmentNumber(l.getId())))
                .collect(Collectors.toList());
    }

    private BigDecimal deriveOutstandingBalance(Long loanId, BigDecimal principalAmount) {
        BigDecimal totalPrincipalPaid = loanRepaymentRepository.sumPrincipalComponentByLoanId(loanId);
        return principalAmount.subtract(totalPrincipalPaid != null ? totalPrincipalPaid : BigDecimal.ZERO).max(BigDecimal.ZERO);
    }

    private LoanResponse toResponse(Loan loan, List<LoanSchedule> scheduleList) {
        List<LoanScheduleItemResponse> scheduleItems = new ArrayList<>();
        if (scheduleList != null) {
            scheduleItems = scheduleList.stream().map(s -> LoanScheduleItemResponse.builder()
                    .id(s.getId())
                    .installmentNumber(s.getInstallmentNumber())
                    .dueDate(s.getDueDate())
                    .principalDue(s.getPrincipalDue())
                    .interestDue(s.getInterestDue())
                    .totalDue(s.getTotalDue())
                    .paid(s.isPaid())
                    .build()).collect(Collectors.toList());
        }
        return LoanResponse.builder()
                .id(loan.getId())
                .memberId(loan.getMember().getId())
                .memberName(loan.getMember().getFullName())
                .memberNumber(loan.getMember().getMemberNumber())
                .saccoId(loan.getSacco().getId())
                .principalAmount(loan.getPrincipalAmount())
                .interestRate(loan.getInterestRate())
                .termInMonths(loan.getTermInMonths())
                .loanReason(loan.getLoanReason())
                .collateralSavingsAccountId(loan.getCollateralSavingsAccount() != null ? loan.getCollateralSavingsAccount().getId() : null)
                .collateralAccountName(loan.getCollateralSavingsAccount() != null ? loan.getCollateralSavingsAccount().getSavingsProduct().getName() : null)
                .status(loan.getStatus())
                .disbursementDate(loan.getDisbursementDate())
                .outstandingBalance((loan.getStatus() == LoanStatus.REPAYING || loan.getStatus() == LoanStatus.DISBURSED)
                        ? deriveOutstandingBalance(loan.getId(), loan.getPrincipalAmount()) : null)
                .createdAt(loan.getCreatedAt())
                .schedule(scheduleItems)
                .build();
    }
}
