package com.coop.savings.service;

import com.coop.common.exception.CustomException;
import com.coop.config.security.SecurityUtils;
import com.coop.accounting.service.AccountingService;
import com.coop.savings.dto.CreateTransferRequestRequest;
import com.coop.savings.dto.TransferRequestResponse;
import com.coop.savings.entity.MemberSavingsAccount;
import com.coop.savings.entity.TransferRequest;
import com.coop.savings.entity.TransferRequestStatus;
import com.coop.savings.repository.MemberSavingsAccountRepository;
import com.coop.savings.repository.TransferRequestRepository;
import com.coop.member.repository.MemberRepository;
import com.coop.user.entity.Role;
import com.coop.user.entity.User;
import com.coop.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransferRequestService {

    private final TransferRequestRepository transferRequestRepository;
    private final MemberSavingsAccountRepository memberSavingsAccountRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final AccountingService accountingService;
    private final SavingsService savingsService;

    /** Member submits a transfer request (pending SACCO approval). */
    @Transactional
    public TransferRequestResponse createRequest(CreateTransferRequestRequest request) {
        MemberSavingsAccount source = memberSavingsAccountRepository.findById(request.getSourceMemberSavingsAccountId())
                .orElseThrow(() -> new CustomException("Source account not found", HttpStatus.NOT_FOUND.value()));
        if (!"ACTIVE".equals(source.getStatus())) {
            throw new CustomException("Source account is not active", HttpStatus.BAD_REQUEST.value());
        }
        String destNumber = request.getDestinationAccountNumber() != null ? request.getDestinationAccountNumber().trim().toUpperCase() : "";
        if (destNumber.isEmpty()) {
            throw new CustomException("Destination account number is required", HttpStatus.BAD_REQUEST.value());
        }
        String sourceNumber = source.getAccountNumber() != null ? source.getAccountNumber() : "SAV-" + String.format("%06d", source.getId());
        if (destNumber.equalsIgnoreCase(sourceNumber)) {
            throw new CustomException("Cannot transfer to the same account", HttpStatus.BAD_REQUEST.value());
        }
        BigDecimal amount = request.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CustomException("Amount must be positive", HttpStatus.BAD_REQUEST.value());
        }
        if (source.getBalance().compareTo(amount) < 0) {
            throw new CustomException("Insufficient balance", HttpStatus.BAD_REQUEST.value());
        }
        // Member can only request from their own account
        if (SecurityUtils.getCurrentRole() == Role.MEMBER) {
            if (!source.getMember().getMemberNumber().equals(SecurityUtils.getCurrentUser().getUsername())) {
                throw new CustomException("You can only create transfer requests from your own account", 403);
            }
        } else {
            if (!SecurityUtils.canAccessInstitution(source.getMember().getSacco().getId())) {
                throw new CustomException("Access denied", 403);
            }
        }

        TransferRequest tr = new TransferRequest();
        tr.setSourceAccount(source);
        tr.setDestinationAccountNumber(destNumber);
        tr.setAmount(amount);
        tr.setStatus(TransferRequestStatus.PENDING);
        tr = transferRequestRepository.save(tr);
        return toResponse(tr);
    }

    /** List requests for the current member (their own requests). */
    public List<TransferRequestResponse> listByMember(Long memberId) {
        var current = SecurityUtils.getCurrentUser();
        if (current == null) throw new CustomException("Unauthorized", 401);
        if (current.getRole() == Role.MEMBER) {
            var member = memberRepository.findByMemberNumber(current.getUsername())
                    .orElseThrow(() -> new CustomException("Member not found", HttpStatus.NOT_FOUND.value()));
            if (!member.getId().equals(memberId)) {
                throw new CustomException("You can only view your own transfer requests", 403);
            }
        } else {
            var member = memberRepository.findById(memberId)
                    .orElseThrow(() -> new CustomException("Member not found", HttpStatus.NOT_FOUND.value()));
            if (!SecurityUtils.canAccessInstitution(member.getSacco().getId())) {
                throw new CustomException("Access denied", 403);
            }
        }
        return transferRequestRepository.findBySourceAccountMemberIdOrderByCreatedAtDesc(memberId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** List requests for SACCO (admin view). Optional status filter. */
    public List<TransferRequestResponse> listBySacco(Long saccoId, TransferRequestStatus status) {
        if (!SecurityUtils.canAccessInstitution(saccoId)) {
            throw new CustomException("Access denied to this institution", 403);
        }
        List<TransferRequest> list = status != null
                ? transferRequestRepository.findBySourceAccountMemberSaccoIdAndStatusOrderByCreatedAtDesc(saccoId, status)
                : transferRequestRepository.findBySourceAccountMemberSaccoIdOrderByCreatedAtDesc(saccoId);
        return list.stream().map(tr -> toResponseWithDestinationLookup(tr)).collect(Collectors.toList());
    }

    /** Transfer history for a member: both sent and received (after approval). */
    public List<TransferRequestResponse> listHistoryByMember(Long memberId) {
        var current = SecurityUtils.getCurrentUser();
        if (current == null) throw new CustomException("Unauthorized", 401);
        if (current.getRole() == Role.MEMBER) {
            var member = memberRepository.findByMemberNumber(current.getUsername())
                    .orElseThrow(() -> new CustomException("Member not found", HttpStatus.NOT_FOUND.value()));
            if (!member.getId().equals(memberId)) {
                throw new CustomException("You can only view your own transfer history", 403);
            }
        } else {
            var member = memberRepository.findById(memberId)
                    .orElseThrow(() -> new CustomException("Member not found", HttpStatus.NOT_FOUND.value()));
            if (!SecurityUtils.canAccessInstitution(member.getSacco().getId())) {
                throw new CustomException("Access denied", 403);
            }
        }
        List<TransferRequest> list = transferRequestRepository.findBySourceAccountMemberIdOrDestinationAccountMemberIdOrderByCreatedAtDesc(memberId, memberId);
        return list.stream()
                .map(tr -> toResponseWithDirection(tr, memberId))
                .collect(Collectors.toList());
    }

    private TransferRequestResponse toResponseWithDestinationLookup(TransferRequest tr) {
        MemberSavingsAccount dest = tr.getDestinationAccount();
        if (dest == null && tr.getDestinationAccountNumber() != null) {
            var opt = memberSavingsAccountRepository.findByAccountNumber(tr.getDestinationAccountNumber());
            if (opt.isPresent()) {
                var d = opt.get();
                if (d.getMember().getSacco().getId().equals(tr.getSourceAccount().getMember().getSacco().getId())) {
                    dest = d;
                }
            }
        }
        return toResponse(tr, dest);
    }

    private TransferRequestResponse toResponseWithDirection(TransferRequest tr, Long forMemberId) {
        TransferRequestResponse r = toResponse(tr, tr.getDestinationAccount());
        boolean isSender = tr.getSourceAccount().getMember().getId().equals(forMemberId);
        r.setDirection(isSender ? "SENT" : "RECEIVED");
        return r;
    }

    @Transactional
    public TransferRequestResponse approve(Long requestId) {
        TransferRequest tr = transferRequestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException("Transfer request not found", HttpStatus.NOT_FOUND.value()));
        if (tr.getStatus() != TransferRequestStatus.PENDING) {
            throw new CustomException("Request is no longer pending", HttpStatus.BAD_REQUEST.value());
        }
        MemberSavingsAccount source = tr.getSourceAccount();
        if (!SecurityUtils.canAccessInstitution(source.getMember().getSacco().getId())) {
            throw new CustomException("Access denied", 403);
        }

        MemberSavingsAccount dest = memberSavingsAccountRepository.findByAccountNumber(tr.getDestinationAccountNumber())
                .orElseThrow(() -> new CustomException("Destination account not found: " + tr.getDestinationAccountNumber(), HttpStatus.BAD_REQUEST.value()));
        if (!dest.getMember().getSacco().getId().equals(source.getMember().getSacco().getId())) {
            throw new CustomException("Destination account must be in the same SACCO", HttpStatus.BAD_REQUEST.value());
        }
        if (dest.getId().equals(source.getId())) {
            throw new CustomException("Source and destination are the same account", HttpStatus.BAD_REQUEST.value());
        }
        if (!"ACTIVE".equals(dest.getStatus())) {
            throw new CustomException("Destination account is not active", HttpStatus.BAD_REQUEST.value());
        }

        BigDecimal amount = tr.getAmount();
        if (source.getBalance().compareTo(amount) < 0) {
            throw new CustomException("Insufficient balance in source account", HttpStatus.BAD_REQUEST.value());
        }

        source.setBalance(source.getBalance().subtract(amount));
        dest.setBalance(dest.getBalance().add(amount));
        memberSavingsAccountRepository.save(source);
        memberSavingsAccountRepository.save(dest);

        savingsService.ensureLiabilityAccount(source);
        savingsService.ensureLiabilityAccount(dest);
        var sourceLiability = source.getLiabilityAccount();
        var destLiability = dest.getLiabilityAccount();
        Long saccoId = source.getMember().getSacco().getId();
        var lines = List.of(
                Map.<String, Object>of("accountId", sourceLiability.getId(), "debit", amount, "credit", BigDecimal.ZERO),
                Map.<String, Object>of("accountId", destLiability.getId(), "debit", BigDecimal.ZERO, "credit", amount)
        );
        accountingService.postEntry(saccoId, java.time.LocalDate.now(),
                "Transfer to " + dest.getMember().getMemberNumber(), "TRANSFER_REQUEST", tr.getId(), lines);

        tr.setStatus(TransferRequestStatus.APPROVED);
        tr.setProcessedAt(Instant.now());
        tr.setDestinationAccount(dest);
        userRepository.findByUsername(SecurityContextHolder.getContext().getAuthentication().getName()).ifPresent(tr::setProcessedBy);
        transferRequestRepository.save(tr);

        return toResponse(tr, dest);
    }

    @Transactional
    public TransferRequestResponse reject(Long requestId, String reason) {
        TransferRequest tr = transferRequestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException("Transfer request not found", HttpStatus.NOT_FOUND.value()));
        if (tr.getStatus() != TransferRequestStatus.PENDING) {
            throw new CustomException("Request is no longer pending", HttpStatus.BAD_REQUEST.value());
        }
        if (!SecurityUtils.canAccessInstitution(tr.getSourceAccount().getMember().getSacco().getId())) {
            throw new CustomException("Access denied", 403);
        }
        tr.setStatus(TransferRequestStatus.REJECTED);
        tr.setProcessedAt(Instant.now());
        tr.setRejectionReason(reason != null ? reason.trim() : null);
        userRepository.findByUsername(SecurityContextHolder.getContext().getAuthentication().getName()).ifPresent(tr::setProcessedBy);
        transferRequestRepository.save(tr);
        return toResponse(tr);
    }

    private TransferRequestResponse toResponse(TransferRequest tr) {
        return toResponse(tr, null);
    }

    private TransferRequestResponse toResponse(TransferRequest tr, MemberSavingsAccount destAccount) {
        var source = tr.getSourceAccount();
        String sourceAccNo = source.getAccountNumber() != null ? source.getAccountNumber() : "SAV-" + String.format("%06d", source.getId());
        var builder = TransferRequestResponse.builder()
                .id(tr.getId())
                .sourceAccountId(source.getId())
                .sourceAccountNumber(sourceAccNo)
                .sourceMemberName(source.getMember().getFullName())
                .sourceMemberNumber(source.getMember().getMemberNumber())
                .destinationAccountNumber(tr.getDestinationAccountNumber())
                .amount(tr.getAmount())
                .status(tr.getStatus())
                .createdAt(tr.getCreatedAt())
                .processedAt(tr.getProcessedAt())
                .rejectionReason(tr.getRejectionReason());
        if (tr.getProcessedBy() != null) {
            builder.processedByUsername(tr.getProcessedBy().getUsername());
        }
        if (destAccount != null) {
            builder.destinationMemberName(destAccount.getMember().getFullName());
        }
        return builder.build();
    }
}
