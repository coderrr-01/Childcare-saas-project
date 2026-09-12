package com.penguinpeak.childcare.child.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateChildFamilyRelationshipRequest(
        @NotNull(message = "Family ID is required") Long familyId,
        Long familyMemberId,
        @NotBlank(message = "Relationship type is required") @Size(max = 50) String relationshipType,
        Boolean primaryGuardian
) {}
