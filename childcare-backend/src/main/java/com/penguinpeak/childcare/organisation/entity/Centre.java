package com.penguinpeak.childcare.organisation.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "centres")
@Getter @Setter @NoArgsConstructor
public class Centre {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "organisation_id", nullable = false)
    private Organisation organisation;
    @Column(nullable = false, length = 200) private String name;
    @Column(length = 255) private String email;
    @Column(length = 30) private String phone;
    @Column(name = "address_street", length = 200) private String addressStreet;
    @Column(name = "address_suburb", length = 100) private String addressSuburb;
    @Column(name = "address_state", length = 50) private String addressState;
    @Column(name = "address_postcode", length = 10) private String addressPostcode;
    @Column(name = "address_country", length = 50) private String addressCountry = "AU";
    @Column(nullable = false) private int capacity;
    @Column(length = 50) private String timezone = "Australia/Sydney";
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private CentreStatus status = CentreStatus.ACTIVE;
    @Column(name = "license_number", length = 100) private String licenseNumber;
    @Column(name = "opening_time") private LocalTime openingTime;
    @Column(name = "closing_time") private LocalTime closingTime;
    @JdbcTypeCode(SqlTypes.ARRAY) @Column(name = "operating_days", columnDefinition = "integer[]") private Integer[] operatingDays = {1, 2, 3, 4, 5};
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    @Column(name = "deleted_at") private Instant deletedAt;
}
