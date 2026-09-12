package com.penguinpeak.childcare.child.repository;

import com.penguinpeak.childcare.child.entity.Family;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FamilyRepository extends JpaRepository<Family, Long> {
    Optional<Family> findByIdAndDeletedAtIsNull(Long id);
    Page<Family> findByOrganisationIdAndCentreIdAndDeletedAtIsNull(Long organisationId, Long centreId, Pageable pageable);
    Page<Family> findByOrganisationIdAndDeletedAtIsNull(Long organisationId, Pageable pageable);
    boolean existsByOrganisationIdAndCentreIdAndIdAndDeletedAtIsNull(Long organisationId, Long centreId, Long id);
    boolean existsByOrganisationIdAndFamilyNumberAndDeletedAtIsNull(Long organisationId, String familyNumber);
}
