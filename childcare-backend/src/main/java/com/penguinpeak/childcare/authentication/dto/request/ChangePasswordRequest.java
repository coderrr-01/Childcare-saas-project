package com.penguinpeak.childcare.authentication.dto.request;
import jakarta.validation.constraints.*;
public record ChangePasswordRequest(@NotBlank String currentPassword, @NotBlank @Size(min=12,max=128) String newPassword) { }
