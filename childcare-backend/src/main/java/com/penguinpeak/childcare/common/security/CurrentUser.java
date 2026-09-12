package com.penguinpeak.childcare.common.security;

import java.util.Set;

/** Authenticated principal projection populated by the JWT authentication filter. */
public record CurrentUser(Long userId, Long organisationId, Long centreId, Set<String> roles) {
    public CurrentUser {
        roles = roles == null ? Set.of() : Set.copyOf(roles);
    }
}
