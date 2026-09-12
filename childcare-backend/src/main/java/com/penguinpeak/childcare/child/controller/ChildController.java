package com.penguinpeak.childcare.child.controller;

import com.penguinpeak.childcare.authentication.service.CurrentUserService;
import com.penguinpeak.childcare.child.dto.ChildResponse;
import com.penguinpeak.childcare.child.dto.CreateChildRequest;
import com.penguinpeak.childcare.child.dto.UpdateChildRequest;
import com.penguinpeak.childcare.child.service.ChildService;
import com.penguinpeak.childcare.common.api.ApiPageResponse;
import com.penguinpeak.childcare.common.api.ApiResponse;
import com.penguinpeak.childcare.common.security.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/api/v1/children")
public class ChildController {

    private final ChildService childService;
    private final CurrentUserService currentUserService;

    @PostMapping
    @PreAuthorize("hasAuthority('children:write')")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ChildResponse> create(@Valid @RequestBody CreateChildRequest request) {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        return ApiResponse.success(childService.create(currentUser, request));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('children:read')")
    public ApiPageResponse<ChildResponse> list(
            @RequestParam(required = false) Long centreId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String enrolmentStatus,
            @RequestParam(required = false) String gender,
            @PageableDefault(size = 20) Pageable pageable) {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        return ApiPageResponse.from(childService.list(currentUser, centreId, search, enrolmentStatus, gender, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('children:read')")
    public ApiResponse<ChildResponse> get(@PathVariable @Positive Long id) {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        return ApiResponse.success(childService.get(currentUser, id));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAuthority('children:write')")
    public ApiResponse<ChildResponse> update(@PathVariable @Positive Long id,
                                              @Valid @RequestBody UpdateChildRequest request) {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        return ApiResponse.success(childService.update(currentUser, id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('children:delete')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable @Positive Long id) {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        childService.delete(currentUser, id);
    }

    @PostMapping("/{childId}/families")
    @PreAuthorize("hasAuthority('children:write')")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ChildResponse> assignFamily(
            @PathVariable @Positive Long childId,
            @RequestParam @Positive Long familyId,
            @RequestParam(required = false, defaultValue = "parent") String relationshipType,
            @RequestParam(required = false, defaultValue = "false") boolean primaryGuardian) {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        return ApiResponse.success(childService.assignFamily(currentUser, childId, familyId, relationshipType, primaryGuardian));
    }
}
