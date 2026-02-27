package com.coop.institution.service;

import com.coop.common.exception.CustomException;
import com.coop.institution.dto.CreateInstitutionRequest;
import com.coop.institution.dto.InstitutionResponse;
import com.coop.institution.entity.Institution;
import com.coop.institution.entity.InstitutionStatus;
import com.coop.institution.repository.InstitutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InstitutionService {

    private final InstitutionRepository institutionRepository;

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
        inst.setStatus(InstitutionStatus.PENDING_APPROVAL);
        inst = institutionRepository.save(inst);
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
    public InstitutionResponse approve(Long id) {
        Institution inst = institutionRepository.findById(id)
                .orElseThrow(() -> new CustomException("Institution not found", HttpStatus.NOT_FOUND.value()));
        inst.setStatus(InstitutionStatus.ACTIVE);
        inst = institutionRepository.save(inst);
        return toResponse(inst);
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
                .build();
    }
}
