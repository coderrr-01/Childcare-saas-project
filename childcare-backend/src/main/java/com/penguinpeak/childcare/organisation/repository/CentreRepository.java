package com.penguinpeak.childcare.organisation.repository;

import com.penguinpeak.childcare.organisation.entity.Centre;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CentreRepository extends JpaRepository<Centre, Long> {
    Optional<Centre> findByIdAndDeletedAtIsNull(Long id);
    Page<Centre> findByOrganisationIdAndDeletedAtIsNull(Long organisationId, Pageable pageable);
}
