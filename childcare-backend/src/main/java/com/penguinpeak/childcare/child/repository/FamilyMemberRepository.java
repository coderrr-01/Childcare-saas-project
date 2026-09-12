package com.penguinpeak.childcare.child.repository;

import com.penguinpeak.childcare.child.entity.FamilyMember;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {
    List<FamilyMember> findByFamilyIdOrderByPrimaryDescLastNameAscFirstNameAsc(Long familyId);
    Optional<FamilyMember> findByIdAndFamilyId(Long id, Long familyId);
    boolean existsByFamilyIdAndId(Long familyId, Long id);
}
