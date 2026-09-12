package com.penguinpeak.childcare.child.repository;

import com.penguinpeak.childcare.child.entity.ChildFamilyRelationship;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChildFamilyRelationshipRepository extends JpaRepository<ChildFamilyRelationship, Long> {
    List<ChildFamilyRelationship> findByChildIdOrderByPrimaryGuardianDesc(Long childId);
    List<ChildFamilyRelationship> findByFamilyIdOrderByPrimaryGuardianDesc(Long familyId);
    Optional<ChildFamilyRelationship> findByChildIdAndFamilyId(Long childId, Long familyId);
    boolean existsByChildIdAndFamilyId(Long childId, Long familyId);
    void deleteByChildIdAndFamilyId(Long childId, Long familyId);
}
