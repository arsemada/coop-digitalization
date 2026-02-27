package com.coop.config.security;

import com.coop.user.entity.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static CustomUserDetails getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            return (CustomUserDetails) auth.getPrincipal();
        }
        return null;
    }

    public static Long getCurrentInstitutionId() {
        CustomUserDetails user = getCurrentUser();
        return user != null ? user.getInstitutionId() : null;
    }

    public static Role getCurrentRole() {
        CustomUserDetails user = getCurrentUser();
        return user != null ? user.getRole() : null;
    }

    public static boolean hasRole(Role role) {
        Role current = getCurrentRole();
        return current != null && current == role;
    }

    public static boolean hasAnyRole(Role... roles) {
        Role current = getCurrentRole();
        if (current == null) return false;
        for (Role r : roles) {
            if (current == r) return true;
        }
        return false;
    }

    /** SUPER_ADMIN can access any institution; others only their own. */
    public static boolean canAccessInstitution(Long institutionId) {
        CustomUserDetails user = getCurrentUser();
        if (user == null) return false;
        if (user.getRole() == Role.SUPER_ADMIN) return true;
        return institutionId != null && institutionId.equals(user.getInstitutionId());
    }
}
