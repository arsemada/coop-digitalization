package com.coop.member.controller;

import com.coop.common.response.ApiResponse;
import com.coop.member.dto.CreateMemberRequest;
import com.coop.member.dto.CreateMemberResponse;
import com.coop.member.dto.MemberResponse;
import com.coop.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SACCO_ADMIN', 'SACCO_EMPLOYEE', 'MEMBER')")
public class MemberController {

    private final MemberService memberService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SACCO_ADMIN', 'SACCO_EMPLOYEE')")
    public ApiResponse<CreateMemberResponse> create(@Valid @RequestBody CreateMemberRequest request) {
        return ApiResponse.success(memberService.create(request));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('MEMBER')")
    public ApiResponse<MemberResponse> getCurrentMember() {
        return ApiResponse.success(memberService.getCurrentMember());
    }

    @GetMapping("/{id}")
    public ApiResponse<MemberResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(memberService.getById(id));
    }

    @GetMapping
    public ApiResponse<List<MemberResponse>> listBySacco(@RequestParam Long saccoId) {
        return ApiResponse.success(memberService.listBySacco(saccoId));
    }
}
