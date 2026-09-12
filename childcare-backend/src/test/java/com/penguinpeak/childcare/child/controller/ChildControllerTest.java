package com.penguinpeak.childcare.child.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.penguinpeak.childcare.authentication.service.CurrentUserService;
import com.penguinpeak.childcare.authentication.security.JwtService;
import com.penguinpeak.childcare.child.dto.ChildResponse;
import com.penguinpeak.childcare.child.service.ChildService;
import com.penguinpeak.childcare.common.exception.GlobalExceptionHandler;
import com.penguinpeak.childcare.common.security.CurrentUser;
import com.penguinpeak.childcare.common.web.RequestIdFilter;
import java.time.Instant;
import java.time.LocalDate;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = ChildController.class)
@Import({GlobalExceptionHandler.class, RequestIdFilter.class})
class ChildControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private ChildService childService;
    @MockitoBean private CurrentUserService currentUserService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private UserDetailsService userDetailsService;

    private CurrentUser currentUser = new CurrentUser(1L, 1L, 1L, Set.of("SUPER_ADMIN"));

    private ChildResponse childResponse() {
        return new ChildResponse(
                1L, 1L, 1L, 1L,
                "John", "Doe",
                LocalDate.of(2020, 1, 15),
                "MALE", "ACTIVE", null,
                "Australian", null, "English",
                true, List.of(),
                Instant.parse("2024-01-01T00:00:00Z"),
                Instant.parse("2024-01-01T00:00:00Z"));
    }

    @Test
    void listChildrenReturnsPaginatedData() throws Exception {
        when(currentUserService.getCurrentUser()).thenReturn(currentUser);
        ChildResponse response = childResponse();
        when(childService.list(eq(currentUser), eq(null), eq(null), eq(null), eq(null), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(response), org.springframework.data.domain.PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/children")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].firstName").value("John"))
                .andExpect(jsonPath("$.data[0].lastName").value("Doe"))
                .andExpect(jsonPath("$.meta.pagination.totalElements").value(1));
    }

    @Test
    void getChildByIdReturnsChild() throws Exception {
        when(currentUserService.getCurrentUser()).thenReturn(currentUser);
        ChildResponse response = childResponse();
        when(childService.get(currentUser, 1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/children/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.firstName").value("John"))
                .andExpect(jsonPath("$.data.lastName").value("Doe"));
    }

    @Test
    void createChildReturns201() throws Exception {
        when(currentUserService.getCurrentUser()).thenReturn(currentUser);
        ChildResponse response = childResponse();
        when(childService.create(eq(currentUser), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/children")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "centreId": 1,
                                    "firstName": "John",
                                    "lastName": "Doe",
                                    "dateOfBirth": "2020-01-15",
                                    "gender": "MALE",
                                    "enrolmentStatus": "ACTIVE"
                                }"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.firstName").value("John"))
                .andExpect(jsonPath("$.data.lastName").value("Doe"));
    }

    @Test
    void updateChildReturns200() throws Exception {
        when(currentUserService.getCurrentUser()).thenReturn(currentUser);
        ChildResponse response = childResponse();
        when(childService.update(eq(currentUser), eq(1L), any())).thenReturn(response);

        mockMvc.perform(patch("/api/v1/children/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "firstName": "Jane",
                                    "enrolmentStatus": "ACTIVE"
                                }"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.firstName").value("John"))
                .andExpect(jsonPath("$.data.lastName").value("Doe"));
    }

    @Test
    void deleteChildReturns204() throws Exception {
        when(currentUserService.getCurrentUser()).thenReturn(currentUser);
        doNothing().when(childService).delete(currentUser, 1L);

        mockMvc.perform(delete("/api/v1/children/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }

    @Test
    void assignFamilyReturns201() throws Exception {
        when(currentUserService.getCurrentUser()).thenReturn(currentUser);
        ChildResponse response = childResponse();
        when(childService.assignFamily(eq(currentUser), eq(1L), eq(10L), eq("parent"), anyBoolean()))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/children/1/families")
                        .param("familyId", "10")
                        .param("relationshipType", "parent")
                        .param("primaryGuardian", "false")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.firstName").value("John"));
    }
}
