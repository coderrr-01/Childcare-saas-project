package com.penguinpeak.childcare.authentication.security;

import com.penguinpeak.childcare.common.constants.HttpConstants;
import com.penguinpeak.childcare.common.exception.ApiErrorCode;
import com.penguinpeak.childcare.common.web.RequestIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
@Component
public class AuthenticationEntryPointImpl implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        String requestId = RequestIdFilter.currentRequestId() != null ? RequestIdFilter.currentRequestId() : "";
        String body = """
                {
                    "type": "%s",
                    "title": "Unauthenticated",
                    "status": 401,
                    "detail": "Authentication is required.",
                    "code": "%s",
                    "instance": "%s",
                    "requestId": "%s"
                }""".formatted(
                HttpConstants.PROBLEM_BASE_URI + "unauthenticated",
                ApiErrorCode.UNAUTHORIZED.name(),
                request.getRequestURI(),
                requestId);
        response.getWriter().write(body);
    }
}
