package com.penguinpeak.childcare.child.dto;

import jakarta.validation.constraints.Size;

public record UpdateFamilyRequest(
        @Size(max = 50) String familyNumber,
        String notes,
        Boolean active
) {}
