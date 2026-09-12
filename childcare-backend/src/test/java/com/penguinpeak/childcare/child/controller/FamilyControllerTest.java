package com.penguinpeak.childcare.child.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.penguinpeak.childcare.authentication.security.JwtService;
import com.penguinpeak.childcare.authentication.service.CurrentUserService;
import com.penguinpeak.childcare.child.dto.FamilyMemberResponse;
import com.penguinpeak.childcare.child.dto.FamilyResponse;
import com.penguinpeak.childcare.child.service.FamilyService;
import com.penguinpeak.childcare.common.exception.GlobalExceptionHandler;
import com.penguinpeak.childcare.common.security.CurrentUser;
import com.penguinpeak.childcare.common.web.RequestIdFilter;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = FamilyController.class)
@Import({GlobalExceptionHandler.class, RequestIdFilter.class})
class FamilyControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private FamilyService familyService;
    @MockitoBean private CurrentUserService currentUserService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private UserDetailsService userDetailsService;

    private final CurrentUser currentUser = new CurrentUser(1L, 1L, 1L, Set.of("SUPER_ADMIN"));
    private final Instant now = Instant.parse("2026-01-15T10:00:00Z");

    private void mockCurrentUser() {
        when(currentUserService.getCurrentUser()).thenReturn(currentUser);
    }

    private FamilyMemberResponse memberResponse() {
        return new FamilyMemberResponse(
                10L, 1L, 2L, "Jane", "Doe", "Mother",
                "jane@test.com", "0400000000", "0411111111", "Engineer",
                true, true, "123 Main St", "Sydney", "NSW", "2000",
                "Australia", now, now);
    }

    private FamilyResponse familyResponse() {
        return new FamilyResponse(
                1L, 1L, 1L, "FAM-001", "Test notes", true,
                List.of(memberResponse()), now, now);
    }

    @Test
    void listFamiliesReturns200() throws Exception {
        mockCurrentUser();
        FamilyResponse family = familyResponse();
        when(familyService.list(eq(currentUser), eq(1L), any()))
                .thenReturn(new PageImpl<>(List.of(family), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/families")
                        .param("centreId", "1")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].familyNumber").value("FAM-001"))
                .andExpect(jsonPath("$.data[0].active").value(true));
    }

    @Test
    void getFamilyReturns200() throws Exception {
        mockCurrentUser();
        when(familyService.get(eq(currentUser), eq(1L))).thenReturn(familyResponse());

        mockMvc.perform(get("/api/v1/families/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.familyNumber").value("FAM-001"))
                .andExpect(jsonPath("$.data.members[0].firstName").value("Jane"));
    }

    @Test
    void createFamilyReturns201() throws Exception {
        mockCurrentUser();
        when(familyService.create(eq(currentUser), any())).thenReturn(familyResponse());

        mockMvc.perform(post("/api/v1/families")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"centreId\":1,\"familyNumber\":\"FAM-001\",\"notes\":\"Test notes\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.familyNumber").value("FAM-001"))
                .andExpect(jsonPath("$.data.active").value(true));
    }

    @Test
    void updateFamilyReturns200() throws Exception {
        mockCurrentUser();
        FamilyResponse updated = new FamilyResponse(
                1L, 1L, 1L, "FAM-002", "Updated notes", true,
                List.of(), now, now);
        when(familyService.update(eq(currentUser), eq(1L), any())).thenReturn(updated);

        mockMvc.perform(patch("/api/v1/families/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"familyNumber\":\"FAM-002\",\"notes\":\"Updated notes\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.familyNumber").value("FAM-002"))
                .andExpect(jsonPath("$.data.notes").value("Updated notes"));
    }

    @Test
    void listMembersReturns200() throws Exception {
        mockCurrentUser();
        FamilyMemberResponse member = memberResponse();
        when(familyService.get(eq(currentUser), eq(1L)))
                .thenReturn(new FamilyResponse(
                        1L, 1L, 1L, "FAM-001", "Test notes", true,
                        List.of(member), now, now));

        mockMvc.perform(get("/api/v1/families/1/members"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].firstName").value("Jane"))
                .andExpect(jsonPath("$.data[0].lastName").value("Doe"))
                .andExpect(jsonPath("$.data[0].relationship").value("Mother"));
    }

    @Test
    void addMemberReturns201() throws Exception {
        mockCurrentUser();
        FamilyMemberResponse member = memberResponse();
        when(familyService.addMember(eq(currentUser), eq(1L), any())).thenReturn(member);

        mockMvc.perform(post("/api/v1/families/1/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstName\":\"Jane\",\"lastName\":\"Doe\",\"relationship\":\"Mother\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.firstName").value("Jane"))
                .andExpect(jsonPath("$.data.lastName").value("Doe"))
                .andExpect(jsonPath("$.data.relationship").value("Mother"));
    }

    @Test
    void updateMemberReturns200() throws Exception {
        mockCurrentUser();
        FamilyMemberResponse updated = new FamilyMemberResponse(
                10L, 1L, 2L, "Jane", "Smith", "Mother",
                "jane@test.com", "0400000000", "0411111111", "Engineer",
                true, true, "123 Main St", "Sydney", "NSW", "2000",
                "Australia", now, now);
        when(familyService.updateMember(eq(currentUser), eq(1L), eq(10L), any())).thenReturn(updated);

        mockMvc.perform(patch("/api/v1/families/1/members/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"lastName\":\"Smith\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.firstName").value("Jane"))
                .andExpect(jsonPath("$.data.lastName").value("Smith"));
    }
}
