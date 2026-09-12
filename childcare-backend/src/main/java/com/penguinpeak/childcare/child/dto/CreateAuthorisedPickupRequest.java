package com.penguinpeak.childcare.child.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAuthorisedPickupRequest(
        @NotBlank(message = "Name is required") @Size(max = 200) String name,
        @NotBlank(message = "Relationship is required") @Size(max = 50) String relationship,
        @NotBlank(message = "Phone is required") @Size(max = 30) String phone,
        @Size(max = 30) String mobile,
        String photoUrl
) {}
