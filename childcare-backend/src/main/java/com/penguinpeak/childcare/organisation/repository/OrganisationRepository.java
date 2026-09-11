package com.penguinpeak.childcare.organisation.repository;

import com.penguinpeak.childcare.organisation.entity.Organisation;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganisationRepository extends JpaRepository<Organisation, Long> {
    Optional<Organisation> findByIdAndDeletedAtIsNull(Long id);
    Page<Organisation> findByDeletedAtIsNull(Pageable pageable);
}
