package com.penguinpeak.childcare.child.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "authorised_pickups")
@Getter @Setter @NoArgsConstructor
public class AuthorisedPickup {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "child_id", nullable = false) private Long childId;
    @Column(nullable = false, length = 200) private String name;
    @Column(nullable = false, length = 50) private String relationship;
    @Column(nullable = false, length = 30) private String phone;
    @Column(length = 30) private String mobile;
    @Column(name = "photo_url", columnDefinition = "text") private String photoUrl;
    @Column(name = "is_active", nullable = false) private boolean active = true;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private Instant updatedAt;
}
