package com.penguinpeak.childcare.organisation.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.penguinpeak.childcare.authentication.security.JwtService;
import com.penguinpeak.childcare.common.exception.GlobalExceptionHandler;
import com.penguinpeak.childcare.common.exception.ResourceNotFoundException;
import com.penguinpeak.childcare.common.web.RequestIdFilter;
import com.penguinpeak.childcare.organisation.dto.CentreResponse;
import com.penguinpeak.childcare.organisation.dto.OrganisationResponse;
import com.penguinpeak.childcare.organisation.dto.RoomResponse;
import com.penguinpeak.childcare.organisation.service.CentreService;
import com.penguinpeak.childcare.organisation.service.OrganisationService;
import com.penguinpeak.childcare.organisation.service.RoomService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = {OrganisationController.class, CentreController.class, RoomController.class})
@Import({GlobalExceptionHandler.class, RequestIdFilter.class})
class OrganisationModuleControllerTest {
    @Autowired private MockMvc mockMvc;
    @MockitoBean private OrganisationService organisationService;
    @MockitoBean private CentreService centreService;
    @MockitoBean private RoomService roomService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private UserDetailsService userDetailsService;
    @Test void createsOrganisationInStandardEnvelope() throws Exception {
        given(organisationService.create(any())).willReturn(new OrganisationResponse(1L, "Peak", null, null, null, null, null, null, null, null, null, "AU", "Australia/Sydney", true, null, null));
        mockMvc.perform(post("/api/v1/organisations").header("X-Request-ID", "organisation-1").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Peak\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.data.id").value(1)).andExpect(jsonPath("$.meta.requestId").value("organisation-1"));
    }
    @Test void validatesOrganisationRequest() throws Exception {
        mockMvc.perform(post("/api/v1/organisations").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest()).andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON)).andExpect(jsonPath("$.errors[0].field").value("name"));
    }
    @Test void mapsNotFoundToProblemDetail() throws Exception {
        given(organisationService.get(99L)).willThrow(new ResourceNotFoundException("Organisation", 99));
        mockMvc.perform(get("/api/v1/organisations/99")).andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));
    }
    @Test void createsCentreAndRoom() throws Exception {
        given(centreService.create(eq(1L), any())).willReturn(new CentreResponse(2L, 1L, "CBD", null, null, null, null, null, null, "AU", 30, "Australia/Sydney", null, null, null, null, null, null, null));
        given(roomService.create(eq(2L), any())).willReturn(new RoomResponse(3L, 1L, 2L, "Toddlers", 12, null, null, true, null, null));
        mockMvc.perform(post("/api/v1/organisations/1/centres").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"CBD\",\"capacity\":30}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.data.organisationId").value(1));
        mockMvc.perform(post("/api/v1/centres/2/rooms").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Toddlers\",\"capacity\":12}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.data.centreId").value(2));
    }
    @Test void validatesCentreAndRoomRequests() throws Exception {
        mockMvc.perform(post("/api/v1/organisations/1/centres").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"CBD\",\"capacity\":-1}"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/api/v1/centres/1/rooms").contentType(MediaType.APPLICATION_JSON).content("{\"capacity\":1}"))
                .andExpect(status().isBadRequest());
    }
}
