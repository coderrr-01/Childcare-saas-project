package com.penguinpeak.childcare.authentication.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.penguinpeak.childcare.authentication.entity.Role;
import com.penguinpeak.childcare.authentication.entity.User;
import io.jsonwebtoken.Claims;
import java.time.Duration;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(
                "test-secret-key-that-is-long-enough-for-hmac-sha-256-algorithm-please",
                Duration.ofMinutes(15),
                Duration.ofDays(30));
    }

    @Test
    void createsValidAccessToken() {
        User user = createUser("user@test.com");
        String token = jwtService.createAccessToken(user, 1L, null);

        assertThat(token).isNotBlank();
        Claims claims = jwtService.parseToken(token);
        assertThat(claims.getSubject()).isEqualTo("user@test.com");
        assertThat(claims.get("userId", Long.class)).isEqualTo(100L);
        assertThat(claims.get("organisationId", Long.class)).isEqualTo(1L);
    }

    @Test
    void createsValidRefreshToken() {
        User user = createUser("user@test.com");
        String token = jwtService.createRefreshToken(user);

        assertThat(token).isNotBlank();
        assertThat(jwtService.validateToken(token)).isTrue();
        assertThat(jwtService.isRefreshToken(token)).isTrue();
    }

    @Test
    void accessTokenIsNotRefreshToken() {
        User user = createUser("user@test.com");
        String accessToken = jwtService.createAccessToken(user, null, null);

        assertThat(jwtService.isRefreshToken(accessToken)).isFalse();
    }

    @Test
    void validatesTokenSuccessfully() {
        User user = createUser("user@test.com");
        String token = jwtService.createAccessToken(user, null, null);

        assertThat(jwtService.validateToken(token)).isTrue();
    }

    @Test
    void rejectsInvalidToken() {
        assertThat(jwtService.validateToken("invalid.token.here")).isFalse();
    }

    @Test
    void includesRolesInAccessToken() {
        User user = createUser("user@test.com");
        String token = jwtService.createAccessToken(user, null, null);
        Claims claims = jwtService.parseToken(token);

        java.util.List<?> roles = claims.get("roles", java.util.List.class);
        assertThat(roles).isNotEmpty();
        assertThat(roles.toString()).contains("EDUCATOR");
    }

    @Test
    void includesCentreIdInAccessToken() {
        User user = createUser("user@test.com");
        String token = jwtService.createAccessToken(user, 1L, 2L);
        Claims claims = jwtService.parseToken(token);

        assertThat(claims.get("organisationId", Long.class)).isEqualTo(1L);
        assertThat(claims.get("centreId", Long.class)).isEqualTo(2L);
    }

    @Test
    void handlesNullOrganisationAndCentre() {
        User user = createUser("user@test.com");
        String token = jwtService.createAccessToken(user, null, null);
        Claims claims = jwtService.parseToken(token);

        assertThat(claims.get("organisationId")).isNull();
        assertThat(claims.get("centreId")).isNull();
    }

    @Test
    void hashesTokenConsistently() {
        String token = "some-token-value";
        String hash1 = jwtService.hashToken(token);
        String hash2 = jwtService.hashToken(token);

        assertThat(hash1).isEqualTo(hash2);
    }

    @Test
    void returnsAccessTokenExpirySeconds() {
        assertThat(jwtService.getAccessTokenExpirySeconds()).isEqualTo(900);
    }

    private User createUser(String email) {
        User user = new User();
        user.setId(100L);
        user.setEmail(email);
        user.setPasswordHash("$2a$10$hashedpassword");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setActive(true);

        Role role = new Role();
        role.setId(1L);
        role.setName("EDUCATOR");
        role.setPermissions(new java.util.HashSet<>());

        com.penguinpeak.childcare.authentication.entity.Permission perm =
                new com.penguinpeak.childcare.authentication.entity.Permission();
        perm.setId(1L);
        perm.setCode("users:read");
        perm.setResource("users");
        perm.setAction("read");
        role.getPermissions().add(perm);

        user.setRoles(Set.of(role));
        return user;
    }
}
