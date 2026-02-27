package com.coop.config.security;

import com.coop.user.entity.Role;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Getter
public class CustomUserDetails implements UserDetails {

    private final String username;
    private final String password;
    private final Role role;
    private final Long institutionId;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(String username, String password, Role role, Long institutionId) {
        this.username = username;
        this.password = password;
        this.role = role;
        this.institutionId = institutionId;
        this.authorities = role != null
                ? Stream.of(new SimpleGrantedAuthority("ROLE_" + role.name())).collect(Collectors.toList())
                : Collections.emptyList();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
