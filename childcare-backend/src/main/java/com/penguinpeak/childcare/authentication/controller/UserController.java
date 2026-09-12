package com.penguinpeak.childcare.authentication.controller;

import com.penguinpeak.childcare.authentication.dto.request.ChangePasswordRequest;
import com.penguinpeak.childcare.authentication.dto.request.CreateUserRequest;
import com.penguinpeak.childcare.authentication.dto.request.UpdateProfileRequest;
import com.penguinpeak.childcare.authentication.dto.request.UpdateUserRequest;
import com.penguinpeak.childcare.authentication.dto.request.UpdateUserStatusRequest;
import com.penguinpeak.childcare.authentication.dto.response.UserResponse;
import com.penguinpeak.childcare.authentication.service.AuthService;
import com.penguinpeak.childcare.authentication.service.CurrentUserService;
import com.penguinpeak.childcare.authentication.service.UserService;
import com.penguinpeak.childcare.common.api.ApiPageResponse;
import com.penguinpeak.childcare.common.api.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final AuthService authService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @PreAuthorize("hasAuthority('users:read')")
    public ApiPageResponse<UserResponse> list(@PageableDefault(size = 20) Pageable pageable) {
        return ApiPageResponse.from(userService.list(pageable));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('users:write')")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        return ApiResponse.success(userService.create(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('users:read')")
    public ApiResponse<UserResponse> get(@PathVariable @Positive Long id) {
        return ApiResponse.success(userService.get(id));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAuthority('users:write')")
    public ApiResponse<UserResponse> update(@PathVariable @Positive Long id,
                                            @Valid @RequestBody UpdateUserRequest request) {
        return ApiResponse.success(userService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('users:status')")
    public ApiResponse<UserResponse> updateStatus(@PathVariable @Positive Long id,
                                                  @Valid @RequestBody UpdateUserStatusRequest request) {
        return ApiResponse.success(userService.updateStatus(id, request));
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> getMyProfile() {
        Long userId = currentUserService.getCurrentUserId();
        return ApiResponse.success(userService.get(userId));
    }

    @PatchMapping("/me")
    public ApiResponse<UserResponse> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Long userId = currentUserService.getCurrentUserId();
        return ApiResponse.success(userService.updateProfile(userId, request));
    }

    @PostMapping("/me/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Long userId = currentUserService.getCurrentUserId();
        authService.changePassword(userId, request);
    }
}
