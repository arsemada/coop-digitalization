package com.coop.config;

import com.coop.user.entity.Role;
import com.coop.user.entity.User;
import com.coop.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DefaultSuperAdminRunner implements CommandLineRunner {

    private static final String DEFAULT_USERNAME = "superadmin";
    private static final String DEFAULT_PASSWORD = "admin123";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByUsername(DEFAULT_USERNAME)) {
            log.debug("Default SUPER_ADMIN already exists");
            return;
        }
        User admin = new User();
        admin.setUsername(DEFAULT_USERNAME);
        admin.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
        admin.setRole(Role.SUPER_ADMIN);
        admin.setActive(true);
        userRepository.save(admin);
        log.info("Default SUPER_ADMIN created: username={} (password: {}). Change password in production!", DEFAULT_USERNAME, DEFAULT_PASSWORD);
    }
}
