package com.penguinpeak.childcare.child.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateChildRequest(
        @NotNull(message = "Centre ID is required") Long centreId,
        Long roomId,
        @NotBlank(message = "First name is required") @Size(max = 100) String firstName,
        @NotBlank(message = "Last name is required") @Size(max = 100) String lastName,
        @NotNull(message = "Date of birth is required") LocalDate dateOfBirth,
        @Size(max = 20) String gender,
        @Size(max = 30) String enrolmentStatus,
        String photoUrl,
        @Size(max = 50) String nationality,
        String culturalNotes,
        @Size(max = 200) String languagesSpoken
) {}
