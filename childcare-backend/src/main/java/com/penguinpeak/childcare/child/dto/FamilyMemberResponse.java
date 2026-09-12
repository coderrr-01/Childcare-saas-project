package com.penguinpeak.childcare.child.dto;

import java.time.Instant;

public record FamilyMemberResponse(
        Long id,
        Long familyId,
        Long userId,
        String firstName,
        String lastName,
        String relationship,
        String email,
        String phone,
        String mobile,
        String occupation,
        boolean primary,
        boolean emergencyContact,
        String addressStreet,
        String addressSuburb,
        String addressState,
        String addressPostcode,
        String addressCountry,
        Instant createdAt,
        Instant updatedAt
) {}
