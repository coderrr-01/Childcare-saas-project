package com.penguinpeak.childcare.child.dto;

import java.time.Instant;

public record ChildFamilyRelationshipResponse(
        Long id,
        Long childId,
        Long familyId,
        Long familyMemberId,
        String familyNumber,
        String relationshipType,
        boolean primaryGuardian,
        Instant createdAt
) {}
