package com.penguinpeak.childcare.child.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record ChildResponse(
        Long id,
        Long organisationId,
        Long centreId,
        Long roomId,
        String firstName,
        String lastName,
        LocalDate dateOfBirth,
        String gender,
        String enrolmentStatus,
        String photoUrl,
        String nationality,
        String culturalNotes,
        String languagesSpoken,
        boolean active,
        List<FamilySummary> families,
        Instant createdAt,
        Instant updatedAt
) {
    public record FamilySummary(Long familyId, String familyNumber, String relationshipType, boolean primaryGuardian) {}
}
