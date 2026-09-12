package com.penguinpeak.childcare.child.repository;

import com.penguinpeak.childcare.child.entity.AuthorisedPickup;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthorisedPickupRepository extends JpaRepository<AuthorisedPickup, Long> {
    List<AuthorisedPickup> findByChildIdAndActiveTrueOrderByNameAsc(Long childId);
    List<AuthorisedPickup> findByChildIdOrderByNameAsc(Long childId);
    Optional<AuthorisedPickup> findByIdAndChildId(Long id, Long childId);
}
