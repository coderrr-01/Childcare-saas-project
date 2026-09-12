package com.penguinpeak.childcare.child.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateFamilyMemberRequest(
        Long userId,
        @NotBlank(message = "First name is required") @Size(max = 100) String firstName,
        @NotBlank(message = "Last name is required") @Size(max = 100) String lastName,
        @NotBlank(message = "Relationship is required") @Size(max = 50) String relationship,
        @Email @Size(max = 255) String email,
        @Size(max = 30) String phone,
        @Size(max = 30) String mobile,
        @Size(max = 100) String occupation,
        Boolean primary,
        Boolean emergencyContact,
        @Size(max = 200) String addressStreet,
        @Size(max = 100) String addressSuburb,
        @Size(max = 50) String addressState,
        @Size(max = 10) String addressPostcode,
        @Size(max = 50) String addressCountry
) {}
