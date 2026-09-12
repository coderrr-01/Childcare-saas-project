package com.penguinpeak.childcare.common.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.penguinpeak.childcare.common.api.ApiResponse;
import com.penguinpeak.childcare.common.exception.BusinessException;
import com.penguinpeak.childcare.common.exception.ConflictException;
import com.penguinpeak.childcare.common.exception.GlobalExceptionHandler;
import com.penguinpeak.childcare.common.exception.ResourceNotFoundException;
import com.penguinpeak.childcare.common.exception.UnauthorizedException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;
import com.penguinpeak.childcare.authentication.security.JwtService;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = FoundationWebTest.FoundationController.class)
@Import({GlobalExceptionHandler.class, RequestIdFilter.class, FoundationWebTest.FoundationController.class})
class FoundationWebTest {
    @MockitoBean private JwtService jwtService;
    @MockitoBean private UserDetailsService userDetailsService;
    @Autowired
    private MockMvc mockMvc;

    @Test
    void preservesValidRequestIdAndUsesItInSuccessMetadata() throws Exception {
        mockMvc.perform(get("/api/v1/test/ok").header("X-Request-ID", "abc-123"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Request-ID", "abc-123"))
                .andExpect(jsonPath("$.meta.requestId").value("abc-123"));
    }

    @Test
    void generatesRequestIdForMissingOrInvalidValuesAndCleansMdc() throws Exception {
        String generated = mockMvc.perform(get("/api/v1/test/ok"))
                .andExpect(status().isOk()).andReturn().getResponse().getHeader("X-Request-ID");
        assertThat(generated).matches("[0-9a-f-]{36}");
        String invalidReplacement = mockMvc.perform(get("/api/v1/test/ok").header("X-Request-ID", "bad value!"))
                .andExpect(status().isOk()).andReturn().getResponse().getHeader("X-Request-ID");
        assertThat(invalidReplacement).matches("[0-9a-f-]{36}").isNotEqualTo("bad value!");
        assertThat(MDC.get("X-Request-ID")).isNull();
    }

    @Test
    void returnsRfc9457ValidationAndKeepsRequestId() throws Exception {
        mockMvc.perform(post("/api/v1/test/validation").header("X-Request-ID", "validation-1")
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors[0].field").value("name"))
                .andExpect(jsonPath("$.requestId").value("validation-1"));
    }

    @Test
    void mapsApplicationExceptionsToTheirStatusCodes() throws Exception {
        assertProblem("not-found", 404, "RESOURCE_NOT_FOUND");
        assertProblem("business", 422, "BUSINESS_ERROR");
        assertProblem("conflict", 409, "CONFLICT");
        assertProblem("unauthorized", 401, "UNAUTHORIZED");
        assertProblem("forbidden", 403, "FORBIDDEN");
        assertProblem("boom", 500, "INTERNAL_SERVER_ERROR");
    }

    @Test
    void mapsMalformedJsonAndUnsupportedMethod() throws Exception {
        mockMvc.perform(post("/api/v1/test/validation").contentType(MediaType.APPLICATION_JSON).content("{"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("BAD_REQUEST"));
        mockMvc.perform(post("/api/v1/test/ok"))
                .andExpect(status().isMethodNotAllowed()).andExpect(jsonPath("$.code").value("METHOD_NOT_ALLOWED"));
        mockMvc.perform(post("/api/v1/test/validation").contentType(MediaType.TEXT_PLAIN).content("name"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.code").value("MEDIA_TYPE_NOT_SUPPORTED"));
        mockMvc.perform(get("/api/v1/test/does-not-exist"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    void serializesJavaTimeAsIso8601() throws Exception {
        mockMvc.perform(get("/api/v1/test/time"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.timestamp").value("2026-09-09T06:30:00Z"))
                .andExpect(jsonPath("$.data.date").value("2026-09-09"))
                .andExpect(jsonPath("$.data.time").value("06:30:00"));
    }

    private void assertProblem(String endpoint, int expectedStatus, String code) throws Exception {
        mockMvc.perform(get("/api/v1/test/" + endpoint).header("X-Request-ID", "test-request"))
                .andExpect(status().is(expectedStatus))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.code").value(code))
                .andExpect(jsonPath("$.requestId").value("test-request"));
    }

    @RestController
    @RequestMapping("/api/v1/test")
    static class FoundationController {
        @GetMapping("/ok")
        ApiResponse<Map<String, String>> ok() {
            return ApiResponse.success(Map.of("result", "ok"));
        }

        @PostMapping("/validation")
        ApiResponse<Map<String, String>> validation(@Valid @RequestBody TestRequest request) {
            return ApiResponse.success(Map.of("name", request.name()));
        }

        @GetMapping("/not-found") void notFound() { throw new ResourceNotFoundException("Test", "1"); }
        @GetMapping("/business") void business() { throw new BusinessException("rule"); }
        @GetMapping("/conflict") void conflict() { throw new ConflictException("conflict"); }
        @GetMapping("/unauthorized") void unauthorized() { throw new UnauthorizedException("missing"); }
        @GetMapping("/forbidden") void forbidden() { throw new ResponseStatusException(HttpStatus.FORBIDDEN); }
        @GetMapping("/boom") void boom() { throw new IllegalStateException("internal details"); }
        @GetMapping("/time") ApiResponse<TimePayload> time() {
            return ApiResponse.success(new TimePayload(Instant.parse("2026-09-09T06:30:00Z"),
                    LocalDate.of(2026, 9, 9), LocalTime.of(6, 30)));
        }
    }

    private record TestRequest(@NotBlank(message = "Name is required") String name) { }
    private record TimePayload(Instant timestamp, LocalDate date, LocalTime time) { }
}
