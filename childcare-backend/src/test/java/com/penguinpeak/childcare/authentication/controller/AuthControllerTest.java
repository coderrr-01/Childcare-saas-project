package com.penguinpeak.childcare.authentication.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.penguinpeak.childcare.authentication.dto.response.LoginResponse;
import com.penguinpeak.childcare.authentication.dto.response.UserResponse;
import com.penguinpeak.childcare.authentication.entity.User;
import com.penguinpeak.childcare.authentication.service.AuthService;
import com.penguinpeak.childcare.authentication.service.CurrentUserService;
import com.penguinpeak.childcare.authentication.security.JwtService;
import com.penguinpeak.childcare.common.exception.GlobalExceptionHandler;
import com.penguinpeak.childcare.common.security.CurrentUser;
import com.penguinpeak.childcare.common.web.RequestIdFilter;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = AuthController.class)
@Import({GlobalExceptionHandler.class, RequestIdFilter.class})
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private AuthService authService;
    @MockitoBean private CurrentUserService currentUserService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private UserDetailsService userDetailsService;

    @Test
    void loginReturnsTokenPair() throws Exception {
        UserResponse userResponse = new UserResponse(
                1L, "user@test.com", "Test", "User", null, null,
                true, false, Set.of("EDUCATOR"), 1L, null, null, null, null);
        LoginResponse loginResponse = new LoginResponse(
                "access-token", "refresh-token", "Bearer", 900, userResponse);

        when(authService.login(any(), any(), any())).thenReturn(loginResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"user@test.com\",\"password\":\"password12345678\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("access-token"))
                .andExpect(jsonPath("$.data.refreshToken").value("refresh-token"))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.user.email").value("user@test.com"));
    }

    @Test
    void loginReturns401ForInvalidCredentials() throws Exception {
        when(authService.login(any(), any(), any()))
                .thenThrow(new com.penguinpeak.childcare.authentication.exception.AuthenticationFailedException());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"user@test.com\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refreshTokenReturnsNewTokens() throws Exception {
        UserResponse userResponse = new UserResponse(
                1L, "user@test.com", "Test", "User", null, null,
                true, false, Set.of(), null, null, null, null, null);
        LoginResponse loginResponse = new LoginResponse(
                "new-access", "new-refresh", "Bearer", 900, userResponse);

        when(authService.refreshToken(any(), any(), any())).thenReturn(loginResponse);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"old-refresh-token\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("new-access"));
    }

    @Test
    void refreshTokenReturns401ForInvalidToken() throws Exception {
        when(authService.refreshToken(any(), any(), any()))
                .thenThrow(new com.penguinpeak.childcare.authentication.exception.AuthenticationFailedException());

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"invalid\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginValidatesRequiredFields() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void refreshValidatesRequiredFields() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
