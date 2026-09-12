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
@Table(name = "family_members")
@Getter @Setter @NoArgsConstructor
public class FamilyMember {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "family_id", nullable = false) private Long familyId;
    @Column(name = "user_id") private Long userId;
    @Column(name = "first_name", nullable = false, length = 100) private String firstName;
    @Column(name = "last_name", nullable = false, length = 100) private String lastName;
    @Column(nullable = false, length = 50) private String relationship;
    @Column(length = 255) private String email;
    @Column(length = 30) private String phone;
    @Column(length = 30) private String mobile;
    @Column(length = 100) private String occupation;
    @Column(name = "is_primary", nullable = false) private boolean primary = false;
    @Column(name = "is_emergency_contact", nullable = false) private boolean emergencyContact = false;
    @Column(name = "address_street", length = 200) private String addressStreet;
    @Column(name = "address_suburb", length = 100) private String addressSuburb;
    @Column(name = "address_state", length = 50) private String addressState;
    @Column(name = "address_postcode", length = 10) private String addressPostcode;
    @Column(name = "address_country", length = 50) private String addressCountry = "AU";
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private Instant updatedAt;
}
