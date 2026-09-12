package com.penguinpeak.childcare.authentication.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.penguinpeak.childcare.authentication.dto.request.ChangePasswordRequest;
import com.penguinpeak.childcare.authentication.dto.request.LoginRequest;
import com.penguinpeak.childcare.authentication.dto.request.RefreshTokenRequest;
import com.penguinpeak.childcare.authentication.dto.response.LoginResponse;
import com.penguinpeak.childcare.authentication.entity.Role;
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
import com.penguinpeak.childcare.common.exception.ResourceNotFoundException;
import com.penguinpeak.childcare.common.security.CurrentUser;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private UserSessionRepository userSessionRepository;
    @Mock private UserOrganisationMembershipRepository organisationMembershipRepository;
    @Mock private UserMapper userMapper;
    @Mock private JwtService jwtService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuditService auditService;

    @InjectMocks private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");
        user.setPasswordHash("$2a$10$hashedpassword");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setActive(true);
        user.setFailedLoginAttempts(0);

        Role role = new Role();
        role.setId(1L);
        role.setName("EDUCATOR");
        role.setPermissions(new java.util.HashSet<>());
        user.setRoles(Set.of(role));
    }

    @Test
    void loginSuccess() {
        LoginRequest request = new LoginRequest("user@test.com", "password123");
        when(userRepository.findByEmailAndDeletedAtIsNull("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", user.getPasswordHash())).thenReturn(true);
        when(jwtService.createAccessToken(any(), nullable(Long.class), nullable(Long.class))).thenReturn("access-token");
        when(jwtService.createRefreshToken(any())).thenReturn("refresh-token");
        when(jwtService.hashToken("refresh-token")).thenReturn("hash");
        when(jwtService.getRefreshTokenTtl()).thenReturn(java.time.Duration.ofDays(30));
        when(jwtService.getAccessTokenExpirySeconds()).thenReturn(900L);
        when(organisationMembershipRepository.findByUserIdOrderByDefaultMembershipDesc(1L)).thenReturn(List.of());
        when(userMapper.toResponse(any(), nullable(Long.class), nullable(Long.class))).thenReturn(
                new com.penguinpeak.childcare.authentication.dto.response.UserResponse(
                        1L, "user@test.com", "Test", "User", null, null, true, false, Set.of("EDUCATOR"), null, null, null, null, null));

        LoginResponse response = authService.login(request, "127.0.0.1", "TestAgent");

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");
        assertThat(response.tokenType()).isEqualTo("Bearer");
        verify(userSessionRepository).save(any(UserSession.class));
    }

    @Test
    void loginFailsWithInvalidCredentials() {
        LoginRequest request = new LoginRequest("user@test.com", "wrongpassword");
        when(userRepository.findByEmailAndDeletedAtIsNull("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", user.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request, "127.0.0.1", "TestAgent"))
                .isInstanceOf(AuthenticationFailedException.class);
    }

    @Test
    void loginFailsForNonExistentUser() {
        LoginRequest request = new LoginRequest("nobody@test.com", "password");
        when(userRepository.findByEmailAndDeletedAtIsNull("nobody@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request, "127.0.0.1", "TestAgent"))
                .isInstanceOf(AuthenticationFailedException.class);
    }

    @Test
    void loginFailsForInactiveUser() {
        user.setActive(false);
        LoginRequest request = new LoginRequest("user@test.com", "password123");
        when(userRepository.findByEmailAndDeletedAtIsNull("user@test.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(request, "127.0.0.1", "TestAgent"))
                .isInstanceOf(AuthenticationFailedException.class);
    }

    @Test
    void loginFailsForLockedAccount() {
        user.setLockedUntil(Instant.now().plusSeconds(600));
        LoginRequest request = new LoginRequest("user@test.com", "password123");
        when(userRepository.findByEmailAndDeletedAtIsNull("user@test.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(request, "127.0.0.1", "TestAgent"))
                .isInstanceOf(AuthenticationFailedException.class);
    }

    @Test
    void failedLoginIncrementsAttempts() {
        LoginRequest request = new LoginRequest("user@test.com", "wrong");
        when(userRepository.findByEmailAndDeletedAtIsNull("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", user.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request, "127.0.0.1", "TestAgent"))
                .isInstanceOf(AuthenticationFailedException.class);

        verify(userRepository).save(user);
        assertThat(user.getFailedLoginAttempts()).isEqualTo(1);
    }

    @Test
    void accountLocksAfterFiveFailedAttempts() {
        user.setFailedLoginAttempts(4);
        LoginRequest request = new LoginRequest("user@test.com", "wrong");
        when(userRepository.findByEmailAndDeletedAtIsNull("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", user.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request, "127.0.0.1", "TestAgent"))
                .isInstanceOf(AuthenticationFailedException.class);

        assertThat(user.getFailedLoginAttempts()).isEqualTo(5);
        assertThat(user.getLockedUntil()).isNotNull();
    }

    @Test
    void refreshTokenSuccess() {
        RefreshTokenRequest request = new RefreshTokenRequest("valid-refresh-token");
        UserSession session = new UserSession();
        session.setId(1L);
        session.setUser(user);
        session.setExpiresAt(Instant.now().plusSeconds(3600));

        when(jwtService.validateToken("valid-refresh-token")).thenReturn(true);
        when(jwtService.isRefreshToken("valid-refresh-token")).thenReturn(true);
        when(jwtService.hashToken("valid-refresh-token")).thenReturn("hash");
        when(userSessionRepository.findByTokenHashAndRevokedAtIsNull("hash")).thenReturn(Optional.of(session));
        when(jwtService.createAccessToken(any(), nullable(Long.class), nullable(Long.class))).thenReturn("new-access");
        when(jwtService.createRefreshToken(any())).thenReturn("new-refresh");
        when(jwtService.hashToken("new-refresh")).thenReturn("new-hash");
        when(jwtService.getRefreshTokenTtl()).thenReturn(java.time.Duration.ofDays(30));
        when(jwtService.getAccessTokenExpirySeconds()).thenReturn(900L);
        when(organisationMembershipRepository.findByUserIdOrderByDefaultMembershipDesc(1L)).thenReturn(List.of());
        when(userMapper.toResponse(any(), nullable(Long.class), nullable(Long.class))).thenReturn(
                new com.penguinpeak.childcare.authentication.dto.response.UserResponse(
                        1L, "user@test.com", "Test", "User", null, null, true, false, Set.of(), null, null, null, null, null));

        LoginResponse response = authService.refreshToken(request, "127.0.0.1", "TestAgent");

        assertThat(response.accessToken()).isEqualTo("new-access");
        assertThat(response.refreshToken()).isEqualTo("new-refresh");
        assertThat(session.getRevokedAt()).isNotNull();
    }

    @Test
    void refreshTokenFailsWithInvalidToken() {
        RefreshTokenRequest request = new RefreshTokenRequest("invalid-token");
        when(jwtService.validateToken("invalid-token")).thenReturn(false);

        assertThatThrownBy(() -> authService.refreshToken(request, "127.0.0.1", "TestAgent"))
                .isInstanceOf(AuthenticationFailedException.class);
    }

    @Test
    void changePasswordSuccess() {
        when(userRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldPassword12345", user.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.encode("newPassword12345")).thenReturn("$2a$10$newhash");
        when(userSessionRepository.findByUserIdAndRevokedAtIsNull(1L)).thenReturn(List.of());

        ChangePasswordRequest request = new ChangePasswordRequest("oldPassword12345", "newPassword12345");
        authService.changePassword(1L, request);

        assertThat(user.getPasswordHash()).isEqualTo("$2a$10$newhash");
        verify(userRepository).save(user);
    }

    @Test
    void changePasswordFailsWithWrongCurrentPassword() {
        when(userRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", user.getPasswordHash())).thenReturn(false);

        ChangePasswordRequest request = new ChangePasswordRequest("wrongPassword", "newPassword12345");
        assertThatThrownBy(() -> authService.changePassword(1L, request))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void changePasswordFailsForNonExistentUser() {
        when(userRepository.findByIdAndDeletedAtIsNull(99L)).thenReturn(Optional.empty());

        ChangePasswordRequest request = new ChangePasswordRequest("old", "newPassword12345");
        assertThatThrownBy(() -> authService.changePassword(99L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void logoutRevokesAllSessions() {
        CurrentUser currentUser = new CurrentUser(1L, 1L, null, Set.of("EDUCATOR"));
        UserSession s1 = new UserSession();
        s1.setId(1L);
        UserSession s2 = new UserSession();
        s2.setId(2L);
        when(userSessionRepository.findByUserIdAndRevokedAtIsNull(1L)).thenReturn(List.of(s1, s2));

        authService.logout(currentUser, "the-token", "127.0.0.1", "TestAgent");

        assertThat(s1.getRevokedAt()).isNotNull();
        assertThat(s2.getRevokedAt()).isNotNull();
    }

    @Test
    void logoutWithoutTokenStillRevokesAllSessions() {
        CurrentUser currentUser = new CurrentUser(1L, 1L, null, Set.of("EDUCATOR"));

        authService.logout(currentUser, null, "127.0.0.1", "TestAgent");

        verify(userSessionRepository).findByUserIdAndRevokedAtIsNull(1L);
        verify(auditService).logLogout(1L, 1L, null, "127.0.0.1", "TestAgent");
    }

    @Test
    void revokeAllSessionsMarksAllRevoked() {
        UserSession s1 = new UserSession();
        s1.setId(1L);
        UserSession s2 = new UserSession();
        s2.setId(2L);
        when(userSessionRepository.findByUserIdAndRevokedAtIsNull(1L)).thenReturn(List.of(s1, s2));

        authService.revokeAllSessions(1L);

        assertThat(s1.getRevokedAt()).isNotNull();
        assertThat(s2.getRevokedAt()).isNotNull();
        verify(userSessionRepository, org.mockito.Mockito.times(2)).save(any(UserSession.class));
    }
}
