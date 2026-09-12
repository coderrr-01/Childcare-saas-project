package com.penguinpeak.childcare.authentication.entity;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity @Table(name = "user_sessions") @Getter @Setter @NoArgsConstructor
public class UserSession {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Column(name = "session_token", nullable = false, unique = true, length = 500) private String tokenHash;
    @Column(name = "ip_address") private String ipAddress;
    @Column(name = "user_agent", columnDefinition = "text") private String userAgent;
    @Column(name = "expires_at", nullable = false) private Instant expiresAt;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "revoked_at") private Instant revokedAt;
}
