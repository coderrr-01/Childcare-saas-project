package com.penguinpeak.childcare.organisation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateRoomRequest(@NotBlank(message = "Name is required") @Size(max = 100) String name,
                                @NotNull @Min(0) Integer capacity, @Min(0) Integer minAgeMonths,
                                @Min(0) Integer maxAgeMonths) { }
