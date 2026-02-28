package com.coop.member.service;

import com.coop.common.exception.CustomException;
import com.coop.email.EmailService;
import com.coop.config.security.SecurityUtils;
import com.coop.institution.entity.Institution;
import com.coop.institution.entity.InstitutionStatus;
import com.coop.institution.entity.InstitutionType;
import com.coop.institution.repository.InstitutionRepository;
import com.coop.member.dto.CreateMemberRequest;
import com.coop.member.dto.CreateMemberResponse;
import com.coop.member.dto.MemberResponse;
import com.coop.member.entity.Member;
import com.coop.member.entity.MemberStatus;
import com.coop.member.repository.MemberRepository;
import com.coop.savings.entity.MemberSavingsAccount;
import com.coop.savings.entity.SavingsCategory;
import com.coop.savings.entity.SavingsProduct;
import com.coop.savings.repository.MemberSavingsAccountRepository;
import com.coop.savings.repository.SavingsProductRepository;
import com.coop.user.entity.Role;
import com.coop.user.entity.User;
import com.coop.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberService {

    private static final String OTP_CHARS = "0123456789";
    private static final int OTP_LENGTH = 6;

    private final MemberRepository memberRepository;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SavingsProductRepository savingsProductRepository;
    private final MemberSavingsAccountRepository memberSavingsAccountRepository;
    private final EmailService emailService;

    @Transactional
    public CreateMemberResponse create(CreateMemberRequest request) {
        Long saccoId = request.getSaccoId();
        if (saccoId == null && SecurityUtils.hasAnyRole(Role.SACCO_ADMIN, Role.SACCO_EMPLOYEE)) {
            saccoId = SecurityUtils.getCurrentInstitutionId();
            if (saccoId != null) {
                request.setSaccoId(saccoId);
            }
        }
        if (saccoId == null || !SecurityUtils.canAccessInstitution(saccoId)) {
            throw new CustomException("Access denied. Create members only for your SACCO.", HttpStatus.FORBIDDEN.value());
        }
        Institution sacco = institutionRepository.findById(saccoId)
                .orElseThrow(() -> new CustomException("SACCO not found", HttpStatus.NOT_FOUND.value()));
        if (sacco.getType() != InstitutionType.SACCO) {
            throw new CustomException("Members can only be created for SACCO institutions", HttpStatus.BAD_REQUEST.value());
        }
        if (sacco.getStatus() != InstitutionStatus.ACTIVE) {
            throw new CustomException("SACCO must be active to create members", HttpStatus.BAD_REQUEST.value());
        }
        String memberNumber = request.getMemberNumber();
        if (memberNumber == null || memberNumber.isBlank()) {
            memberNumber = generateMemberNumber(sacco.getId());
        }
        if (memberRepository.existsByMemberNumberAndSaccoId(memberNumber, saccoId)) {
            throw new CustomException("Member number already exists in this SACCO", HttpStatus.CONFLICT.value());
        }
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null;
        if (email != null && !email.isBlank() && memberRepository.existsBySaccoIdAndEmail(saccoId, email)) {
            throw new CustomException("Member with this email already exists in this SACCO", HttpStatus.CONFLICT.value());
        }
        Member member = new Member();
        member.setMemberNumber(memberNumber);
        member.setFullName(request.getFullName());
        member.setEmail(email != null && !email.isBlank() ? email : null);
        member.setPhone(request.getPhone());
        member.setJoinDate(request.getJoinDate() != null ? request.getJoinDate() : java.time.LocalDate.now());
        member.setSacco(sacco);
        member.setRegion(request.getRegion());
        member.setWoreda(request.getWoreda());
        member.setKebele(request.getKebele());
        member.setHouseNumber(request.getHouseNumber());
        member.setStatus(MemberStatus.ACTIVE);
        member = memberRepository.save(member);

        String otp = generateOtp();
        User user = new User();
        user.setUsername(memberNumber);
        user.setPassword(passwordEncoder.encode(otp));
        user.setRole(Role.MEMBER);
        user.setInstitution(sacco);
        user.setActive(true);
        user.setMustChangePassword(true);
        userRepository.save(user);

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            emailService.sendOtp(request.getEmail(), memberNumber, otp, sacco.getName());
        }

        if (request.getSavingsCategories() != null && !request.getSavingsCategories().isEmpty()) {
            for (SavingsCategory cat : request.getSavingsCategories()) {
                SavingsProduct product = savingsProductRepository.findBySaccoIdAndCategory(sacco.getId(), cat)
                        .orElseGet(() -> {
                            SavingsProduct p = new SavingsProduct();
                            p.setSacco(sacco);
                            p.setName(cat.name());
                            p.setCategory(cat);
                            p.setInterestRate(BigDecimal.ZERO);
                            p.setRequiresMaturity(false);
                            return savingsProductRepository.save(p);
                        });
                if (memberSavingsAccountRepository.findByMemberIdAndSavingsProductId(member.getId(), product.getId()).isEmpty()) {
                    MemberSavingsAccount account = new MemberSavingsAccount();
                    account.setMember(member);
                    account.setSavingsProduct(product);
                    account.setOpenedDate(LocalDate.now());
                    account = memberSavingsAccountRepository.save(account);
                    account.setAccountNumber("SAV-" + String.format("%06d", account.getId()));
                    memberSavingsAccountRepository.save(account);
                }
            }
        }

        return CreateMemberResponse.builder()
                .member(toResponse(member))
                .username(memberNumber)
                .otp(otp)
                .build();
    }

    private String generateOtp() {
        SecureRandom r = new SecureRandom();
        StringBuilder sb = new StringBuilder(OTP_LENGTH);
        for (int i = 0; i < OTP_LENGTH; i++) {
            sb.append(OTP_CHARS.charAt(r.nextInt(OTP_CHARS.length())));
        }
        return sb.toString();
    }

    /** Generates a unique member number (SACCO account): SACCO-{saccoId}-{sequence}-{suffix} e.g. SACCO-1-000001-A3F2 */
    private String generateMemberNumber(Long saccoId) {
        long count = memberRepository.findBySaccoId(saccoId).size();
        String seq = String.format("%06d", count + 1);
        String suffix = Integer.toHexString((int) (System.nanoTime() & 0xFFFF)).toUpperCase();
        return "SACCO-" + saccoId + "-" + seq + "-" + suffix;
    }

    public MemberResponse getByUsername(String username) {
        var member = memberRepository.findByMemberNumber(username)
                .orElseThrow(() -> new CustomException("Member not found", HttpStatus.NOT_FOUND.value()));
        if (!SecurityUtils.canAccessInstitution(member.getSacco().getId())) {
            throw new CustomException("Access denied", HttpStatus.FORBIDDEN.value());
        }
        return toResponse(member);
    }

    public MemberResponse getById(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new CustomException("Member not found", HttpStatus.NOT_FOUND.value()));
        return toResponse(member);
    }

    public MemberResponse getCurrentMember() {
        var user = SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != Role.MEMBER) return null;
        return memberRepository.findByMemberNumber(user.getUsername())
                .map(this::toResponse)
                .orElse(null);
    }

    public List<MemberResponse> listBySacco(Long saccoId) {
        if (!SecurityUtils.canAccessInstitution(saccoId)) {
            throw new CustomException("Access denied to this institution", 403);
        }
        return memberRepository.findBySaccoId(saccoId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    private MemberResponse toResponse(Member m) {
        return MemberResponse.builder()
                .id(m.getId())
                .memberNumber(m.getMemberNumber())
                .fullName(m.getFullName())
                .phone(m.getPhone())
                .email(m.getEmail())
                .joinDate(m.getJoinDate())
                .saccoId(m.getSacco().getId())
                .saccoName(m.getSacco().getName())
                .region(m.getRegion())
                .woreda(m.getWoreda())
                .kebele(m.getKebele())
                .houseNumber(m.getHouseNumber())
                .status(m.getStatus())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
