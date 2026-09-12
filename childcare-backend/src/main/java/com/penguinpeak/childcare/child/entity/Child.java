package com.penguinpeak.childcare.child.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "children")
@Getter @Setter @NoArgsConstructor
public class Child {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "organisation_id", nullable = false) private Long organisationId;
    @Column(name = "centre_id", nullable = false) private Long centreId;
    @Column(name = "room_id") private Long roomId;
    @Column(name = "first_name", nullable = false, length = 100) private String firstName;
    @Column(name = "last_name", nullable = false, length = 100) private String lastName;
    @Column(name = "date_of_birth", nullable = false) private LocalDate dateOfBirth;
    @Column(nullable = false, length = 20) private String gender = "unspecified";
    @Column(name = "enrolment_status", nullable = false, length = 30) private String enrolmentStatus = "WAITLISTED";
    @Column(name = "photo_url", columnDefinition = "text") private String photoUrl;
    @Column(length = 50) private String nationality;
    @Column(name = "cultural_notes", columnDefinition = "text") private String culturalNotes;
    @Column(name = "languages_spoken", length = 200) private String languagesSpoken;
    @Column(name = "is_active", nullable = false) private boolean active = true;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    @Column(name = "deleted_at") private Instant deletedAt;
}
