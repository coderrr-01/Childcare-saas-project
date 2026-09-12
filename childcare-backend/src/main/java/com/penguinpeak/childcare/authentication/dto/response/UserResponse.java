package com.penguinpeak.childcare.authentication.dto.response;
import java.time.Instant; import java.util.Set;
public record UserResponse(Long id, String email, String firstName, String lastName, String phone, String avatarUrl,
    boolean active, boolean emailVerified, Set<String> roles, Long organisationId, Long centreId, Instant lastLoginAt, Instant createdAt, Instant updatedAt) { }
