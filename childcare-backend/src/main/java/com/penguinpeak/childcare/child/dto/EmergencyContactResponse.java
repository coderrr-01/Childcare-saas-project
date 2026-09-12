package com.penguinpeak.childcare.child.dto;

import java.time.Instant;

public record EmergencyContactResponse(
        Long id,
        Long childId,
        String name,
        String relationship,
        String phone,
        String mobile,
        String email,
        int priority,
        Instant createdAt,
        Instant updatedAt
) {}
