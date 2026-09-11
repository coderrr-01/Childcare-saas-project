package com.penguinpeak.childcare.organisation.entity;

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
@Table(name = "organisations")
@Getter @Setter @NoArgsConstructor
public class Organisation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 200) private String name;
    @Column(length = 20) private String abn;
    @Column(length = 255) private String email;
    @Column(length = 30) private String phone;
    @Column(name = "website", length = 500) private String website;
    @Column(name = "logo_url", columnDefinition = "text") private String logoUrl;
    @Column(name = "address_street", length = 200) private String addressStreet;
    @Column(name = "address_suburb", length = 100) private String addressSuburb;
    @Column(name = "address_state", length = 50) private String addressState;
    @Column(name = "address_postcode", length = 10) private String addressPostcode;
    @Column(name = "address_country", length = 50) private String addressCountry = "AU";
    @Column(length = 50) private String timezone = "Australia/Sydney";
    @Column(name = "is_active", nullable = false) private boolean active = true;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    @Column(name = "deleted_at") private Instant deletedAt;
}
