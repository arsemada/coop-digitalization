package com.coop.member.service;

import com.coop.common.exception.CustomException;
import com.coop.config.security.SecurityUtils;
import com.coop.institution.entity.Institution;
import com.coop.institution.repository.InstitutionRepository;
import com.coop.member.dto.CreateMemberRequest;
import com.coop.member.dto.MemberResponse;
import com.coop.member.entity.Member;
import com.coop.member.entity.MemberStatus;
import com.coop.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final InstitutionRepository institutionRepository;

    @Transactional
    public MemberResponse create(CreateMemberRequest request) {
        if (!SecurityUtils.canAccessInstitution(request.getSaccoId())) {
            throw new CustomException("Access denied to this institution", 403);
        }
        Institution sacco = institutionRepository.findById(request.getSaccoId())
                .orElseThrow(() -> new CustomException("SACCO not found", HttpStatus.NOT_FOUND.value()));
        if (memberRepository.existsByMemberNumberAndSaccoId(request.getMemberNumber(), request.getSaccoId())) {
            throw new CustomException("Member number already exists in this SACCO", HttpStatus.CONFLICT.value());
        }
        Member member = new Member();
        member.setMemberNumber(request.getMemberNumber());
        member.setFullName(request.getFullName());
        member.setPhone(request.getPhone());
        member.setJoinDate(request.getJoinDate() != null ? request.getJoinDate() : java.time.LocalDate.now());
        member.setSacco(sacco);
        member.setRegion(request.getRegion());
        member.setWoreda(request.getWoreda());
        member.setKebele(request.getKebele());
        member.setHouseNumber(request.getHouseNumber());
        member.setStatus(MemberStatus.ACTIVE);
        member = memberRepository.save(member);
        return toResponse(member);
    }

    public MemberResponse getById(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new CustomException("Member not found", HttpStatus.NOT_FOUND.value()));
        return toResponse(member);
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
