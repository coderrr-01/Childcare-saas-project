package com.penguinpeak.childcare.organisation.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalTime;
import java.util.List;

public record CreateCentreRequest(
        @NotBlank(message = "Name is required") @Size(max = 200) String name,
        @Email @Size(max = 255) String email, @Size(max = 30) String phone, @Size(max = 200) String addressStreet,
        @Size(max = 100) String addressSuburb, @Size(max = 50) String addressState,
        @Size(max = 10) String addressPostcode, @Size(max = 50) String addressCountry,
        @NotNull @Min(0) Integer capacity, @Size(max = 50) String timezone, @Size(max = 100) String licenseNumber,
        LocalTime openingTime, LocalTime closingTime,
        List<@Min(1) @Max(7) Integer> operatingDays) { }
