package com.penguinpeak.childcare.authentication.security;

import com.penguinpeak.childcare.common.security.SecurityConstants;
import com.penguinpeak.childcare.common.tenant.TenantContext;
import com.penguinpeak.childcare.common.tenant.TenantContextHolder;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader(SecurityConstants.BEARER_TOKEN_PREFIX.equals("Bearer ")
                ? "Authorization" : "Authorization");
        if (header != null && header.startsWith(SecurityConstants.BEARER_TOKEN_PREFIX)) {
            String token = header.substring(SecurityConstants.BEARER_TOKEN_PREFIX.length());
            try {
                if (jwtService.validateToken(token) && !jwtService.isRefreshToken(token)) {
                    Claims claims = jwtService.parseToken(token);
                    String email = claims.getSubject();
                    if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                        Long userId = claims.get("userId", Long.class);
                        Long organisationId = claims.get("organisationId", Long.class);
                        Long centreId = claims.get("centreId", Long.class);
                        java.util.List<?> rolesList = claims.get("roles", java.util.List.class);
                        Set<String> roles = rolesList != null
                                ? rolesList.stream().map(Object::toString).collect(Collectors.toUnmodifiableSet())
                                : Set.of();
                        com.penguinpeak.childcare.common.security.CurrentUser currentUser =
                                new com.penguinpeak.childcare.common.security.CurrentUser(
                                        userId, organisationId, centreId, roles);
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(currentUser, null, userDetails.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        TenantContextHolder.setContext(new TenantContext(
                                organisationId != null ? String.valueOf(organisationId) : null,
                                centreId != null ? String.valueOf(centreId) : null));
                    }
                }
            } catch (Exception e) {
                LOGGER.debug("JWT authentication failed: {}", e.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }
}
