package com.coop.user.service;

import com.coop.common.exception.CustomException;
import com.coop.institution.repository.InstitutionRepository;
import com.coop.user.dto.CreateUserRequest;
import com.coop.user.dto.UserResponse;
import com.coop.user.entity.User;
import com.coop.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new CustomException("Username already exists", HttpStatus.CONFLICT.value());
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        if (request.getInstitutionId() != null) {
            user.setInstitution(institutionRepository.findById(request.getInstitutionId())
                    .orElseThrow(() -> new CustomException("Institution not found", HttpStatus.NOT_FOUND.value())));
        }
        user = userRepository.save(user);
        return toResponse(user);
    }

    public UserResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND.value()));
        return toResponse(user);
    }

    public List<UserResponse> listByInstitution(Long institutionId) {
        return userRepository.findAll().stream()
                .filter(u -> u.getInstitution() != null && u.getInstitution().getId().equals(institutionId))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .institutionId(user.getInstitution() != null ? user.getInstitution().getId() : null)
                .institutionName(user.getInstitution() != null ? user.getInstitution().getName() : null)
                .active(user.isActive())
                .build();
    }
}
