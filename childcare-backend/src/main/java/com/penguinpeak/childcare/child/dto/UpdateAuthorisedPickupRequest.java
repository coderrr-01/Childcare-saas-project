package com.penguinpeak.childcare.child.dto;

import jakarta.validation.constraints.Size;

public record UpdateAuthorisedPickupRequest(
        @Size(max = 200) String name,
        @Size(max = 50) String relationship,
        @Size(max = 30) String phone,
        @Size(max = 30) String mobile,
        String photoUrl,
        Boolean active
) {}
