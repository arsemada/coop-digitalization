package com.coop.config.security;

import com.coop.user.entity.User;
import com.coop.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        if (!user.isActive()) {
            throw new UsernameNotFoundException("User is inactive");
        }
        Long institutionId = user.getInstitution() != null ? user.getInstitution().getId() : null;
        return new CustomUserDetails(
                user.getUsername(),
                user.getPassword(),
                user.getRole(),
                institutionId
        );
    }
}
