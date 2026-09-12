package com.penguinpeak.childcare.child.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateFamilyRequest(
        @NotNull(message = "Centre ID is required") Long centreId,
        @NotBlank(message = "Family number is required") @Size(max = 50) String familyNumber,
        String notes
) {}
