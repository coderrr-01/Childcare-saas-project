package com.penguinpeak.childcare.common.web;

import com.penguinpeak.childcare.common.constants.HttpConstants;
import com.penguinpeak.childcare.common.tenant.TenantContextHolder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Correlates each HTTP request without accepting unbounded or unsafe header values. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {
    public static final String REQUEST_ID_ATTRIBUTE = RequestIdFilter.class.getName() + ".requestId";
    private static final Pattern VALID_REQUEST_ID = Pattern.compile("[A-Za-z0-9][A-Za-z0-9._-]{0,127}");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String requestId = validOrNew(request.getHeader(HttpConstants.REQUEST_ID_HEADER));
        request.setAttribute(REQUEST_ID_ATTRIBUTE, requestId);
        response.setHeader(HttpConstants.REQUEST_ID_HEADER, requestId);
        MDC.put(HttpConstants.REQUEST_ID_HEADER, requestId);
        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(HttpConstants.REQUEST_ID_HEADER);
            TenantContextHolder.clear();
        }
    }

    public static String currentRequestId() {
        return MDC.get(HttpConstants.REQUEST_ID_HEADER);
    }

    private static String validOrNew(String candidate) {
        return candidate != null && VALID_REQUEST_ID.matcher(candidate).matches() ? candidate : UUID.randomUUID().toString();
    }
}
