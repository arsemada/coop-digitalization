package com.coop.institution.controller;

import com.coop.institution.dto.CreateInstitutionRequest;
import com.coop.institution.dto.InstitutionResponse;
import com.coop.institution.entity.InstitutionType;
import com.coop.institution.service.InstitutionService;
import com.coop.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institutions")
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionService institutionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<InstitutionResponse> create(@Valid @RequestBody CreateInstitutionRequest request) {
        return ApiResponse.success(institutionService.create(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<InstitutionResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(institutionService.getById(id));
    }

    @GetMapping
    public ApiResponse<List<InstitutionResponse>> list(
            @RequestParam(required = false) InstitutionType type) {
        if (type != null) {
            return ApiResponse.success(institutionService.listByType(type));
        }
        return ApiResponse.success(institutionService.listAll());
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<InstitutionResponse> approve(@PathVariable Long id) {
        return ApiResponse.success(institutionService.approve(id));
    }
}
