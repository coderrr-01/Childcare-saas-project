package com.penguinpeak.childcare.authentication.security;

import com.penguinpeak.childcare.authentication.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final Duration accessTokenTtl;
    private final Duration refreshTokenTtl;

    public JwtService(
            @Value("${childcare.security.jwt.secret}") String secret,
            @Value("${childcare.security.jwt.access-token-ttl}") Duration accessTokenTtl,
            @Value("${childcare.security.jwt.refresh-token-ttl}") Duration refreshTokenTtl) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(encodeSecret(secret)));
        this.accessTokenTtl = accessTokenTtl;
        this.refreshTokenTtl = refreshTokenTtl;
    }

    public String createAccessToken(User user, Long organisationId, Long centreId) {
        Instant now = Instant.now();
        Set<String> permissionCodes = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(p -> p.getCode())
                .collect(Collectors.toUnmodifiableSet());
        var claimsBuilder = Jwts.claims()
                .subject(user.getEmail())
                .add("userId", user.getId())
                .add("roles", user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toUnmodifiableSet()))
                .add("authorities", permissionCodes);
        if (organisationId != null) {
            claimsBuilder.add("organisationId", organisationId);
        }
        if (centreId != null) {
            claimsBuilder.add("centreId", centreId);
        }
        return Jwts.builder()
                .claims(claimsBuilder.build())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(accessTokenTtl)))
                .id(java.util.UUID.randomUUID().toString())
                .signWith(signingKey)
                .compact();
    }

    public String createRefreshToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("type", "refresh")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(refreshTokenTtl)))
                .id(java.util.UUID.randomUUID().toString())
                .signWith(signingKey)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isRefreshToken(String token) {
        try {
            Claims claims = parseToken(token);
            return "refresh".equals(claims.get("type", String.class));
        } catch (JwtException e) {
            return false;
        }
    }

    public long getAccessTokenExpirySeconds() {
        return accessTokenTtl.getSeconds();
    }

    public Duration getRefreshTokenTtl() {
        return refreshTokenTtl;
    }

    public String hashToken(String token) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private String encodeSecret(String secret) {
        return java.util.Base64.getEncoder().encodeToString(secret.getBytes());
    }
}
