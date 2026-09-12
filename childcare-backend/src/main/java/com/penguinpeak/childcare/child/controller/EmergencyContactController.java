package com.penguinpeak.childcare.child.controller;

import com.penguinpeak.childcare.authentication.service.CurrentUserService;
import com.penguinpeak.childcare.child.dto.CreateEmergencyContactRequest;
import com.penguinpeak.childcare.child.dto.EmergencyContactResponse;
import com.penguinpeak.childcare.child.dto.UpdateEmergencyContactRequest;
import com.penguinpeak.childcare.child.service.EmergencyContactService;
import com.penguinpeak.childcare.common.api.ApiResponse;
import com.penguinpeak.childcare.common.security.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/v1/children/{childId}/emergency-contacts")
public class EmergencyContactController {

    private final EmergencyContactService service;
    private final CurrentUserService currentUserService;

    @GetMapping
    @PreAuthorize("hasAuthority('children:read')")
    public ApiResponse<List<EmergencyContactResponse>> list(@PathVariable @Positive Long childId) {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        return ApiResponse.success(service.list(currentUser, childId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('children:write')")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<EmergencyContactResponse> create(
            @PathVariable @Positive Long childId,
            @Valid @RequestBody CreateEmergencyContactRequest request) {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        return ApiResponse.success(service.create(currentUser, childId, request));
    }
}

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/v1/emergency-contacts")
class EmergencyContactDirectController {

    private final EmergencyContactService service;
    private final CurrentUserService currentUserService;

    @PatchMapping("/{id}")
    @PreAuthorize("hasAuthority('children:write')")
    public ApiResponse<EmergencyContactResponse> update(
            @PathVariable @Positive Long id,
            @Valid @RequestBody UpdateEmergencyContactRequest request) {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        return ApiResponse.success(service.update(currentUser, id, request));
    }
}
