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
    private final UserRepository userRepository;

    @Transactional
    public LoanResponse apply(LoanApplicationRequest request) {
        if (!SecurityUtils.canAccessInstitution(request.getSaccoId())) {
            throw new CustomException("Access denied to this institution", 403);
        }
        var member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new CustomException("Member not found", HttpStatus.NOT_FOUND.value()));
        var sacco = institutionRepository.findById(request.getSaccoId())
                .orElseThrow(() -> new CustomException("SACCO not found", HttpStatus.NOT_FOUND.value()));
        Loan loan = new Loan();
        loan.setMember(member);
        loan.setSacco(sacco);
        loan.setPrincipalAmount(request.getPrincipalAmount());
        loan.setInterestRate(request.getInterestRate());
        loan.setTermInMonths(request.getTermInMonths());
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
        loan.setOutstandingBalance(loan.getPrincipalAmount());
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
    public LoanRepayment recordRepayment(LoanRepaymentRequest request) {
        Loan loan = loanRepository.findById(request.getLoanId())
                .orElseThrow(() -> new CustomException("Loan not found", HttpStatus.NOT_FOUND.value()));
        if (loan.getStatus() != LoanStatus.REPAYING && loan.getStatus() != LoanStatus.DISBURSED) {
            throw new CustomException("Loan is not in repayment", HttpStatus.BAD_REQUEST.value());
        }
        BigDecimal amount = request.getAmountPaid();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CustomException("Amount must be positive", HttpStatus.BAD_REQUEST.value());
        }
        LocalDate paymentDate = request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now();
        List<LoanSchedule> unpaid = loanScheduleRepository.findByLoanIdOrderByInstallmentNumber(loan.getId()).stream()
                .filter(s -> !s.isPaid())
                .collect(Collectors.toList());
        BigDecimal principalComponent = BigDecimal.ZERO;
        BigDecimal interestComponent = BigDecimal.ZERO;
        BigDecimal remaining = amount;
        for (LoanSchedule s : unpaid) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;
            BigDecimal toPrincipal = s.getPrincipalDue().min(remaining);
            remaining = remaining.subtract(toPrincipal);
            principalComponent = principalComponent.add(toPrincipal);
            if (remaining.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal toInterest = s.getInterestDue().min(remaining);
                remaining = remaining.subtract(toInterest);
                interestComponent = interestComponent.add(toInterest);
            }
            if (toPrincipal.compareTo(s.getPrincipalDue()) >= 0) {
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
        loan.setOutstandingBalance(loan.getOutstandingBalance().subtract(principalComponent));
        if (loan.getOutstandingBalance().compareTo(BigDecimal.ZERO) <= 0) {
            loan.setStatus(LoanStatus.CLOSED);
        }
        loanRepository.save(loan);
        return repayment;
    }

    public LoanResponse getById(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new CustomException("Loan not found", HttpStatus.NOT_FOUND.value()));
        List<LoanSchedule> schedule = loanScheduleRepository.findByLoanIdOrderByInstallmentNumber(loanId);
        return toResponse(loan, schedule);
    }

    public List<LoanResponse> listByMember(Long memberId) {
        return loanRepository.findByMemberId(memberId).stream()
                .map(l -> toResponse(l, loanScheduleRepository.findByLoanIdOrderByInstallmentNumber(l.getId())))
                .collect(Collectors.toList());
    }

    public List<LoanResponse> listBySacco(Long saccoId) {
        return loanRepository.findBySaccoId(saccoId).stream()
                .map(l -> toResponse(l, loanScheduleRepository.findByLoanIdOrderByInstallmentNumber(l.getId())))
                .collect(Collectors.toList());
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
                .status(loan.getStatus())
                .disbursementDate(loan.getDisbursementDate())
                .outstandingBalance(loan.getOutstandingBalance())
                .createdAt(loan.getCreatedAt())
                .schedule(scheduleItems)
                .build();
    }
}
