package com.penguinpeak.childcare.organisation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateRoomRequest(@Size(max = 100) String name, @Min(0) Integer capacity,
                                @Min(0) Integer minAgeMonths, @Min(0) Integer maxAgeMonths, Boolean active) { }
