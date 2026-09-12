package com.penguinpeak.childcare.authentication.controller;

import com.penguinpeak.childcare.authentication.dto.request.LoginRequest;
import com.penguinpeak.childcare.authentication.dto.request.RefreshTokenRequest;
import com.penguinpeak.childcare.authentication.dto.response.LoginResponse;
import com.penguinpeak.childcare.authentication.dto.response.UserResponse;
import com.penguinpeak.childcare.authentication.service.AuthService;
import com.penguinpeak.childcare.authentication.service.CurrentUserService;
import com.penguinpeak.childcare.common.api.ApiResponse;
import com.penguinpeak.childcare.common.security.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final CurrentUserService currentUserService;

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request,
                                            HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader(HttpHeaders.USER_AGENT);
        return ApiResponse.success(authService.login(request, ipAddress, userAgent));
    }

    @PostMapping("/refresh")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<LoginResponse> refresh(@Valid @RequestBody RefreshTokenRequest request,
                                              HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader(HttpHeaders.USER_AGENT);
        return ApiResponse.success(authService.refreshToken(request, ipAddress, userAgent));
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest httpRequest) {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        String token = extractBearerToken(httpRequest);
        String ipAddress = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader(HttpHeaders.USER_AGENT);
        authService.logout(currentUser, token, ipAddress, userAgent);
    }

    @GetMapping("/me")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<UserResponse> me() {
        CurrentUser currentUser = currentUserService.getCurrentUser();
        var user = currentUserService.getCurrentUserEntity();
        Set<String> roles = user.getRoles().stream()
                .map(r -> r.getName())
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
        UserResponse response = new UserResponse(
                user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(),
                user.getPhone(), user.getAvatarUrl(), user.isActive(), user.isEmailVerified(),
                roles, currentUser.organisationId(), currentUser.centreId(),
                user.getLastLoginAt(), user.getCreatedAt(), user.getUpdatedAt());
        return ApiResponse.success(response);
    }

    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
