package com.penguinpeak.childcare.authentication.dto.request;
import jakarta.validation.constraints.*;
import java.util.Set;
public record CreateUserRequest(@NotBlank @Email String email, @NotBlank @Size(min=12,max=128) String password,
    @NotBlank @Size(max=100) String firstName, @NotBlank @Size(max=100) String lastName, @Size(max=30) String phone,
    Long organisationId, Long centreId, @NotEmpty Set<@NotBlank String> roles) { }
