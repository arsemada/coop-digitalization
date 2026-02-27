package com.coop.user.controller;

import com.coop.common.response.ApiResponse;
import com.coop.user.dto.CreateUserRequest;
import com.coop.user.dto.UserResponse;
import com.coop.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'UNION_ADMIN', 'SACCO_ADMIN')")
public class UserController {

    private final UserService userService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        return ApiResponse.success(userService.create(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(userService.getById(id));
    }

    @GetMapping
    public ApiResponse<List<UserResponse>> listByInstitution(@RequestParam Long institutionId) {
        return ApiResponse.success(userService.listByInstitution(institutionId));
    }
}
