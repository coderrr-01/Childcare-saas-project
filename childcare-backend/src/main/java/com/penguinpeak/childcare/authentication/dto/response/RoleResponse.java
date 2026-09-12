package com.penguinpeak.childcare.authentication.dto.response;
import java.util.Set;
public record RoleResponse(Long id, String name, String description, Set<String> permissions) { }
