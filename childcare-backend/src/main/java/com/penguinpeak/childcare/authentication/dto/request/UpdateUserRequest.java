package com.penguinpeak.childcare.authentication.dto.request;
import jakarta.validation.constraints.*;
public record UpdateUserRequest(@Size(min=1,max=100) String firstName, @Size(min=1,max=100) String lastName, @Size(max=30) String phone, String avatarUrl) { }
