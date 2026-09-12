package com.penguinpeak.childcare.authentication.dto.request;
import jakarta.validation.constraints.NotNull;
public record UpdateUserStatusRequest(@NotNull Boolean active) { }
