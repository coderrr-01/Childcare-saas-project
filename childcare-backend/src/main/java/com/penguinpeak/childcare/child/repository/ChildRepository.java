package com.penguinpeak.childcare.child.repository;

import com.penguinpeak.childcare.child.entity.Child;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ChildRepository extends JpaRepository<Child, Long>, JpaSpecificationExecutor<Child> {
    Optional<Child> findByIdAndDeletedAtIsNull(Long id);
    Page<Child> findByOrganisationIdAndCentreIdAndDeletedAtIsNull(Long organisationId, Long centreId, Pageable pageable);
    Page<Child> findByOrganisationIdAndDeletedAtIsNull(Long organisationId, Pageable pageable);
    long countByOrganisationIdAndCentreIdAndDeletedAtIsNull(Long organisationId, Long centreId);
    boolean existsByOrganisationIdAndCentreIdAndIdAndDeletedAtIsNull(Long organisationId, Long centreId, Long id);
}
