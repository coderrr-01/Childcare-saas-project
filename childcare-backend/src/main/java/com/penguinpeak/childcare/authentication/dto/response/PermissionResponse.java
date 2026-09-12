package com.penguinpeak.childcare.authentication.dto.response;
public record PermissionResponse(Long id, String code, String resource, String action, String description) { }
