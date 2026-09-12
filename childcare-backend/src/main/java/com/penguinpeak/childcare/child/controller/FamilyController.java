package com.penguinpeak.childcare.child.controller;

import com.penguinpeak.childcare.authentication.service.CurrentUserService;
import com.penguinpeak.childcare.child.dto.CreateFamilyMemberRequest;
import com.penguinpeak.childcare.child.dto.CreateFamilyRequest;
import com.penguinpeak.childcare.child.dto.FamilyMemberResponse;
import com.penguinpeak.childcare.child.dto.FamilyResponse;
import com.penguinpeak.childcare.child.dto.UpdateFamilyMemberRequest;
import com.penguinpeak.childcare.child.dto.UpdateFamilyRequest;
import com.penguinpeak.childcare.child.service.FamilyService;
import com.penguinpeak.childcare.common.api.ApiPageResponse;
import com.penguinpeak.childcare.common.api.ApiResponse;
import com.penguinpeak.childcare.common.security.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/v1/families")
public class FamilyController {

    private final FamilyService familyService;
    private final CurrentUserService currentUserService;

    @PostMapping
    @PreAuthorize("hasAuthority('families:write')")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FamilyResponse> create(@Valid @RequestBody CreateFamilyRequest request) {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        return ApiResponse.success(familyService.create(currentUser, request));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('families:read')")
    public ApiPageResponse<FamilyResponse> list(
            @RequestParam(required = false) Long centreId,
            @PageableDefault(size = 20) Pageable pageable) {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        return ApiPageResponse.from(familyService.list(currentUser, centreId, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('families:read')")
    public ApiResponse<FamilyResponse> get(@PathVariable @Positive Long id) {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        return ApiResponse.success(familyService.get(currentUser, id));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAuthority('families:write')")
    public ApiResponse<FamilyResponse> update(@PathVariable @Positive Long id,
                                               @Valid @RequestBody UpdateFamilyRequest request) {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        return ApiResponse.success(familyService.update(currentUser, id, request));
    }

    @GetMapping("/{familyId}/members")
    @PreAuthorize("hasAuthority('families:read')")
    public ApiResponse<List<FamilyMemberResponse>> listMembers(@PathVariable @Positive Long familyId) {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        FamilyResponse family = familyService.get(currentUser, familyId);
        return ApiResponse.success(family.members());
    }

    @PostMapping("/{familyId}/members")
    @PreAuthorize("hasAuthority('families:write')")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FamilyMemberResponse> addMember(
            @PathVariable @Positive Long familyId,
            @Valid @RequestBody CreateFamilyMemberRequest request) {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        return ApiResponse.success(familyService.addMember(currentUser, familyId, request));
    }

    @PatchMapping("/{familyId}/members/{memberId}")
    @PreAuthorize("hasAuthority('families:write')")
    public ApiResponse<FamilyMemberResponse> updateMember(
            @PathVariable @Positive Long familyId,
            @PathVariable @Positive Long memberId,
            @Valid @RequestBody UpdateFamilyMemberRequest request) {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        return ApiResponse.success(familyService.updateMember(currentUser, familyId, memberId, request));
    }
}
