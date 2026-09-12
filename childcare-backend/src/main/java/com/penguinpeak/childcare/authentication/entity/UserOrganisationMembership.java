package com.penguinpeak.childcare.authentication.entity;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity @Table(name = "user_organisations") @Getter @Setter @NoArgsConstructor
public class UserOrganisationMembership {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Column(name = "organisation_id", nullable = false) private Long organisationId;
    @Column(name = "is_default", nullable = false) private boolean defaultMembership;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
}
