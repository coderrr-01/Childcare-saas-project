package com.penguinpeak.childcare.authentication.security;

import com.penguinpeak.childcare.common.constants.HttpConstants;
import com.penguinpeak.childcare.common.exception.ApiErrorCode;
import com.penguinpeak.childcare.common.web.RequestIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

@Component
public class AccessDeniedHandlerImpl implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        String requestId = RequestIdFilter.currentRequestId() != null ? RequestIdFilter.currentRequestId() : "";
        String body = """
                {
                    "type": "%s",
                    "title": "Forbidden",
                    "status": 403,
                    "detail": "You do not have permission to access this resource.",
                    "code": "%s",
                    "instance": "%s",
                    "requestId": "%s"
                }""".formatted(
                HttpConstants.PROBLEM_BASE_URI + "forbidden",
                ApiErrorCode.FORBIDDEN.name(),
                request.getRequestURI(),
                requestId);
        response.getWriter().write(body);
    }
}
