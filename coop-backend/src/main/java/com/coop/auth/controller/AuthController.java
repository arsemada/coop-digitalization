package com.coop.auth.controller;

import com.coop.auth.dto.LoginRequest;
import com.coop.auth.dto.LoginResponse;
import com.coop.auth.dto.RegisterUserRequest;
import com.coop.auth.service.AuthService;
import com.coop.common.response.ApiResponse;
import com.coop.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<String> register(@Valid @RequestBody RegisterUserRequest request) {
        User user = authService.register(request);
        return ApiResponse.success("User registered successfully", user.getUsername());
    }
}
