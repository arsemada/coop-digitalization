package com.coop.institution.service;

import com.coop.common.exception.CustomException;
import com.coop.config.security.SecurityUtils;
import com.coop.email.EmailService;
import com.coop.institution.dto.ApproveInstitutionResponse;
import com.coop.institution.dto.CreateInstitutionRequest;
import com.coop.institution.dto.UpdateInstitutionRequest;
import com.coop.institution.dto.InstitutionResponse;
import com.coop.institution.entity.Institution;
import com.coop.institution.entity.InstitutionStatus;
import com.coop.institution.entity.InstitutionType;
import com.coop.institution.repository.InstitutionRepository;
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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InstitutionService {

    private static final String OTP_CHARS = "0123456789";
    private static final int OTP_LENGTH = 6;

    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional
    public InstitutionResponse create(CreateInstitutionRequest request) {
        if (request.getRegistrationNumber() != null &&
                institutionRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new CustomException("Registration number already exists", HttpStatus.CONFLICT.value());
        }
        Institution inst = new Institution();
        inst.setName(request.getName());
        inst.setType(request.getType());
        inst.setRegistrationNumber(request.getRegistrationNumber());
        inst.setRegion(request.getRegion());
        inst.setWoreda(request.getWoreda());
        inst.setKebele(request.getKebele());
        inst.setHouseNumber(request.getHouseNumber());
        inst.setApplicantUsername(request.getApplicantUsername() != null ? request.getApplicantUsername().trim() : null);
        inst.setApplicantEmail(request.getApplicantEmail());
        inst.setApplicantPhone(request.getApplicantPhone());
        inst.setDefaultLoanInterestRate(request.getDefaultLoanInterestRate() != null ? request.getDefaultLoanInterestRate() : BigDecimal.valueOf(12));
        inst.setStatus(InstitutionStatus.PENDING_APPROVAL);
        inst = institutionRepository.save(inst);
        return toResponse(inst);
    }

    public InstitutionResponse getCurrentUserInstitution() {
        Long institutionId = SecurityUtils.getCurrentInstitutionId();
        if (institutionId == null) return null;
        return institutionRepository.findById(institutionId).map(this::toResponse).orElse(null);
    }

    @Transactional
    public InstitutionResponse updateDefaultLoanInterestRate(Long id, UpdateInstitutionRequest request) {
        boolean canEdit = SecurityUtils.canAccessInstitution(id)
                || SecurityUtils.hasAnyRole(Role.UNION_ADMIN, Role.SUPER_ADMIN);
        if (!canEdit) {
            throw new CustomException("Access denied to this institution", HttpStatus.FORBIDDEN.value());
        }
        Institution inst = institutionRepository.findById(id)
                .orElseThrow(() -> new CustomException("Institution not found", HttpStatus.NOT_FOUND.value()));
        if (request.getDefaultLoanInterestRate() != null && request.getDefaultLoanInterestRate().compareTo(BigDecimal.ZERO) >= 0) {
            inst.setDefaultLoanInterestRate(request.getDefaultLoanInterestRate());
            inst = institutionRepository.save(inst);
        }
        return toResponse(inst);
    }

    public InstitutionResponse getById(Long id) {
        Institution inst = institutionRepository.findById(id)
                .orElseThrow(() -> new CustomException("Institution not found", HttpStatus.NOT_FOUND.value()));
        return toResponse(inst);
    }

    public List<InstitutionResponse> listAll() {
        return institutionRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<InstitutionResponse> listByType(com.coop.institution.entity.InstitutionType type) {
        return institutionRepository.findByType(type).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ApproveInstitutionResponse approve(Long id) {
        Institution inst = institutionRepository.findById(id)
                .orElseThrow(() -> new CustomException("Institution not found", HttpStatus.NOT_FOUND.value()));
        inst.setStatus(InstitutionStatus.ACTIVE);
        inst = institutionRepository.save(inst);

        String username = null;
        String otp = null;
        if (inst.getApplicantUsername() != null && !inst.getApplicantUsername().isBlank()) {
            if (userRepository.existsByUsername(inst.getApplicantUsername())) {
                throw new CustomException("User " + inst.getApplicantUsername() + " already exists", HttpStatus.CONFLICT.value());
            }
            otp = generateOtp();
            Role role = inst.getType() == InstitutionType.SACCO ? Role.SACCO_ADMIN : Role.UNION_ADMIN;
            User user = new User();
            user.setUsername(inst.getApplicantUsername());
            user.setPassword(passwordEncoder.encode(otp));
            user.setRole(role);
            user.setInstitution(inst);
            user.setActive(true);
            user.setMustChangePassword(true);
            userRepository.save(user);
            username = inst.getApplicantUsername();
            if (inst.getApplicantEmail() != null && !inst.getApplicantEmail().isBlank()) {
                emailService.sendOtp(inst.getApplicantEmail(), username, otp, inst.getName());
            }
        }

        return ApproveInstitutionResponse.builder()
                .institution(toResponse(inst))
                .username(username)
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

    private InstitutionResponse toResponse(Institution inst) {
        return InstitutionResponse.builder()
                .id(inst.getId())
                .name(inst.getName())
                .type(inst.getType())
                .registrationNumber(inst.getRegistrationNumber())
                .region(inst.getRegion())
                .woreda(inst.getWoreda())
                .kebele(inst.getKebele())
                .houseNumber(inst.getHouseNumber())
                .status(inst.getStatus())
                .createdAt(inst.getCreatedAt())
                .applicantUsername(inst.getApplicantUsername())
                .applicantEmail(inst.getApplicantEmail())
                .applicantPhone(inst.getApplicantPhone())
                .defaultLoanInterestRate(inst.getDefaultLoanInterestRate() != null ? inst.getDefaultLoanInterestRate() : BigDecimal.valueOf(12))
                .build();
    }
}
