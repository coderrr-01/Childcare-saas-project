package com.penguinpeak.childcare.authentication.dto.request;
import jakarta.validation.constraints.*;
public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) { }
