package com.coop.auth.service;

import com.coop.auth.dto.ChangePasswordRequest;
import com.coop.auth.dto.LoginRequest;
import com.coop.auth.dto.LoginResponse;
import com.coop.auth.dto.RegisterUserRequest;
import com.coop.common.exception.CustomException;
import com.coop.config.security.JwtService;
import com.coop.institution.entity.Institution;
import com.coop.institution.repository.InstitutionRepository;
import com.coop.user.entity.User;
import com.coop.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public LoginResponse login(LoginRequest request) {
        String username = request.getUsername() != null ? request.getUsername().trim() : "";
        String password = request.getPassword() != null ? request.getPassword().trim() : "";
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND.value()));
        String token = jwtService.generateToken(
                user.getUsername(),
                user.getRole().name(),
                user.getInstitution() != null ? user.getInstitution().getId() : null);
        String institutionName = user.getInstitution() != null ? user.getInstitution().getName() : null;
        return LoginResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole().name())
                .institutionId(user.getInstitution() != null ? user.getInstitution().getId() : null)
                .institutionName(institutionName)
                .mustChangePassword(user.isMustChangePassword())
                .build();
    }

    @Transactional
    public User register(RegisterUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new CustomException("Username already exists", HttpStatus.CONFLICT.value());
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        if (request.getInstitutionId() != null) {
            Institution inst = institutionRepository.findById(request.getInstitutionId())
                    .orElseThrow(() -> new CustomException("Institution not found", HttpStatus.NOT_FOUND.value()));
            user.setInstitution(inst);
        }
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND.value()));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new CustomException("Current password (OTP) is incorrect", HttpStatus.BAD_REQUEST.value());
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);
    }
}
