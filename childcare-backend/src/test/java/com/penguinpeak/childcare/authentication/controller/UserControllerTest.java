package com.penguinpeak.childcare.authentication.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.penguinpeak.childcare.authentication.dto.request.ChangePasswordRequest;
import com.penguinpeak.childcare.authentication.dto.response.UserResponse;
import com.penguinpeak.childcare.authentication.service.AuthService;
import com.penguinpeak.childcare.authentication.service.CurrentUserService;
import com.penguinpeak.childcare.authentication.service.UserService;
import com.penguinpeak.childcare.authentication.security.JwtService;
import com.penguinpeak.childcare.common.exception.GlobalExceptionHandler;
import com.penguinpeak.childcare.common.security.CurrentUser;
import com.penguinpeak.childcare.common.web.RequestIdFilter;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = UserController.class)
@Import({GlobalExceptionHandler.class, RequestIdFilter.class})
class UserControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private UserService userService;
    @MockitoBean private AuthService authService;
    @MockitoBean private CurrentUserService currentUserService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private UserDetailsService userDetailsService;

    private UserResponse buildResponse(Long id) {
        return new UserResponse(id, "user@test.com", "Test", "User", null, null,
                true, false, Set.of("EDUCATOR"), 1L, null, null, null, null);
    }

    @Test
    @WithMockUser(authorities = "users:read")
    void listUsersReturnsPage() throws Exception {
        when(userService.list(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(buildResponse(1L), buildResponse(2L))));

        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[1].id").value(2));
    }

    @Test
    @WithMockUser(authorities = "users:read")
    void getUserReturnsProfile() throws Exception {
        when(userService.get(1L)).thenReturn(buildResponse(1L));

        mockMvc.perform(get("/api/v1/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.email").value("user@test.com"));
    }

    @Test
    @WithMockUser(authorities = "users:read")
    void getUserReturns404ForMissingUser() throws Exception {
        when(userService.get(99L)).thenThrow(
                new com.penguinpeak.childcare.common.exception.ResourceNotFoundException("User", 99));

        mockMvc.perform(get("/api/v1/users/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = "users:write")
    void createUserReturns201() throws Exception {
        when(userService.create(any())).thenReturn(buildResponse(1L));

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "new@test.com",
                                    "password": "Str0ngP@ssw0rd!",
                                    "firstName": "Test",
                                    "lastName": "User",
                                    "roles": ["EDUCATOR"]
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @WithMockUser(authorities = "users:write")
    void createUserValidatesRequest() throws Exception {
        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = "users:write")
    void updateUserReturns200() throws Exception {
        when(userService.update(anyLong(), any())).thenReturn(buildResponse(1L));

        mockMvc.perform(patch("/api/v1/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstName\": \"Jane\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @WithMockUser(authorities = "users:write")
    void updateUserValidatesFieldLengths() throws Exception {
        mockMvc.perform(patch("/api/v1/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstName\": \"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = "users:status")
    void updateUserStatusReturns200() throws Exception {
        when(userService.updateStatus(anyLong(), any())).thenReturn(buildResponse(1L));

        mockMvc.perform(patch("/api/v1/users/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\": false}"))
                .andExpect(status().isOk());
    }
}
