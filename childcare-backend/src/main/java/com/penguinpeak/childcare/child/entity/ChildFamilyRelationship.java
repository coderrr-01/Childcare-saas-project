package com.penguinpeak.childcare.child.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "child_family_relationships", uniqueConstraints = @UniqueConstraint(columnNames = {"child_id", "family_id"}))
@Getter @Setter @NoArgsConstructor
public class ChildFamilyRelationship {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "child_id", nullable = false) private Long childId;
    @Column(name = "family_id", nullable = false) private Long familyId;
    @Column(name = "family_member_id") private Long familyMemberId;
    @Column(name = "relationship_type", nullable = false, length = 50) private String relationshipType = "parent";
    @Column(name = "is_primary_guardian", nullable = false) private boolean primaryGuardian = false;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
}
