package com.penguinpeak.childcare.child.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateEmergencyContactRequest(
        @Size(max = 200) String name,
        @Size(max = 50) String relationship,
        @Size(max = 30) String phone,
        @Size(max = 30) String mobile,
        @Email @Size(max = 255) String email,
        @Min(1) Integer priority
) {}
