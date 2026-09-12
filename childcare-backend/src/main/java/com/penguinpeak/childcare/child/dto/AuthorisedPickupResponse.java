package com.penguinpeak.childcare.child.dto;

import java.time.Instant;

public record AuthorisedPickupResponse(
        Long id,
        Long childId,
        String name,
        String relationship,
        String phone,
        String mobile,
        String photoUrl,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {}
