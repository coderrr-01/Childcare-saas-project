package com.penguinpeak.childcare.common.security;

import java.util.Set;

/** Authenticated principal projection to be populated by future security integration. */
public record CurrentUser(String userId, String organisationId, String centreId, Set<String> roles) {
    public CurrentUser {
        roles = roles == null ? Set.of() : Set.copyOf(roles);
    }
}
