package com.penguinpeak.childcare.child.dto;

import java.time.Instant;
import java.util.List;

public record FamilyResponse(
        Long id,
        Long organisationId,
        Long centreId,
        String familyNumber,
        String notes,
        boolean active,
        List<FamilyMemberResponse> members,
        Instant createdAt,
        Instant updatedAt
) {}
