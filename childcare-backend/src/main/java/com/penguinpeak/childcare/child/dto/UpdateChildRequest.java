package com.penguinpeak.childcare.child.dto;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UpdateChildRequest(
        Long roomId,
        @Size(max = 100) String firstName,
        @Size(max = 100) String lastName,
        LocalDate dateOfBirth,
        @Size(max = 20) String gender,
        @Size(max = 30) String enrolmentStatus,
        String photoUrl,
        @Size(max = 50) String nationality,
        String culturalNotes,
        @Size(max = 200) String languagesSpoken,
        Boolean active
) {}
