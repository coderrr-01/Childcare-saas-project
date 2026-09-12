package com.penguinpeak.childcare.authentication.service;

import com.penguinpeak.childcare.authentication.dto.request.ChangePasswordRequest;
import com.penguinpeak.childcare.authentication.dto.request.LoginRequest;
import com.penguinpeak.childcare.authentication.dto.request.RefreshTokenRequest;
import com.penguinpeak.childcare.authentication.dto.response.LoginResponse;
import com.penguinpeak.childcare.authentication.dto.response.UserResponse;
import com.penguinpeak.childcare.authentication.entity.User;
import com.penguinpeak.childcare.authentication.entity.UserOrganisationMembership;
import com.penguinpeak.childcare.authentication.entity.UserSession;
import com.penguinpeak.childcare.authentication.exception.AuthenticationFailedException;
import com.penguinpeak.childcare.authentication.mapper.UserMapper;
import com.penguinpeak.childcare.authentication.repository.UserOrganisationMembershipRepository;
import com.penguinpeak.childcare.authentication.repository.UserRepository;
import com.penguinpeak.childcare.authentication.repository.UserSessionRepository;
import com.penguinpeak.childcare.authentication.security.JwtService;
import com.penguinpeak.childcare.common.exception.BusinessException;
import com.penguinpeak.childcare.common.security.CurrentUser;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthService.class);
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration LOCKOUT_DURATION = Duration.ofMinutes(15);

    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final UserOrganisationMembershipRepository organisationMembershipRepository;
    private final UserMapper userMapper;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional
    public LoginResponse login(LoginRequest request, String ipAddress, String userAgent) {
        String email = request.email().toLowerCase().trim();
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(AuthenticationFailedException::new);

        if (!user.isActive()) {
            auditService.logLogin(user.getId(), null, null, ipAddress, userAgent, false, "Account disabled");
            throw new AuthenticationFailedException();
        }

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(Instant.now())) {
            auditService.logLogin(user.getId(), null, null, ipAddress, userAgent, false, "Account locked");
            throw new AuthenticationFailedException();
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            handleFailedLogin(user, ipAddress, userAgent);
            throw new AuthenticationFailedException();
        }

        handleSuccessfulLogin(user, ipAddress, userAgent);

        Long organisationId = resolveDefaultOrganisationId(user.getId());
        Long centreId = null;

        String accessToken = jwtService.createAccessToken(user, organisationId, centreId);
        String refreshToken = jwtService.createRefreshToken(user);

        UserSession session = new UserSession();
        session.setUser(user);
        session.setTokenHash(jwtService.hashToken(refreshToken));
        session.setIpAddress(ipAddress);
        session.setUserAgent(userAgent);
        session.setExpiresAt(Instant.now().plus(jwtService.getRefreshTokenTtl()));
        userSessionRepository.save(session);

        UserResponse userResponse = userMapper.toResponse(user, organisationId, centreId);

        auditService.logLogin(user.getId(), organisationId, centreId, ipAddress, userAgent, true, null);

        return new LoginResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtService.getAccessTokenExpirySeconds(),
                userResponse);
    }

    @Transactional
    public LoginResponse refreshToken(RefreshTokenRequest request, String ipAddress, String userAgent) {
        String token = request.refreshToken();
        if (!jwtService.validateToken(token) || !jwtService.isRefreshToken(token)) {
            throw new AuthenticationFailedException();
        }

        String tokenHash = jwtService.hashToken(token);
        UserSession session = userSessionRepository.findByTokenHashAndRevokedAtIsNull(tokenHash)
                .orElseThrow(AuthenticationFailedException::new);

        if (session.getExpiresAt().isBefore(Instant.now())) {
            throw new AuthenticationFailedException();
        }

        User user = session.getUser();
        if (!user.isActive()) {
            throw new AuthenticationFailedException();
        }

        session.setRevokedAt(Instant.now());
        userSessionRepository.save(session);

        Long organisationId = resolveDefaultOrganisationId(user.getId());
        Long centreId = null;

        String newAccessToken = jwtService.createAccessToken(user, organisationId, centreId);
        String newRefreshToken = jwtService.createRefreshToken(user);

        UserSession newSession = new UserSession();
        newSession.setUser(user);
        newSession.setTokenHash(jwtService.hashToken(newRefreshToken));
        newSession.setIpAddress(ipAddress);
        newSession.setUserAgent(userAgent);
        newSession.setExpiresAt(Instant.now().plus(jwtService.getRefreshTokenTtl()));
        userSessionRepository.save(newSession);

        UserResponse userResponse = userMapper.toResponse(user, organisationId, centreId);

        return new LoginResponse(
                newAccessToken,
                newRefreshToken,
                "Bearer",
                jwtService.getAccessTokenExpirySeconds(),
                userResponse);
    }

    @Transactional
    public void logout(CurrentUser currentUser, String token, String ipAddress, String userAgent) {
        revokeAllSessions(currentUser.userId());
        auditService.logLogout(currentUser.userId(), currentUser.organisationId(), currentUser.centreId(),
                ipAddress, userAgent);
    }

    @Transactional
    public void revokeAllSessions(Long userId) {
        List<UserSession> sessions = userSessionRepository.findByUserIdAndRevokedAtIsNull(userId);
        Instant now = Instant.now();
        for (UserSession session : sessions) {
            session.setRevokedAt(now);
            userSessionRepository.save(session);
        }
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new com.penguinpeak.childcare.common.exception.ResourceNotFoundException("User", userId));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessException("Current password is incorrect.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setPasswordChangedAt(Instant.now());
        userRepository.save(user);

        revokeAllSessions(userId);
    }

    private void handleSuccessfulLogin(User user, String ipAddress, String userAgent) {
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);
    }

    private void handleFailedLogin(User user, String ipAddress, String userAgent) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            user.setLockedUntil(Instant.now().plus(LOCKOUT_DURATION));
            LOGGER.warn("User account locked after {} failed attempts: {}", attempts, user.getEmail());
        }
        userRepository.save(user);
        auditService.logLogin(user.getId(), null, null, ipAddress, userAgent, false,
                "Invalid password (attempt " + attempts + ")");
    }

    private Long resolveDefaultOrganisationId(Long userId) {
        List<UserOrganisationMembership> memberships =
                organisationMembershipRepository.findByUserIdOrderByDefaultMembershipDesc(userId);
        Optional<UserOrganisationMembership> defaultMembership = memberships.stream()
                .filter(UserOrganisationMembership::isDefaultMembership)
                .findFirst();
        if (defaultMembership.isPresent()) {
            return defaultMembership.get().getOrganisationId();
        }
        return memberships.isEmpty() ? null : memberships.getFirst().getOrganisationId();
    }
}
