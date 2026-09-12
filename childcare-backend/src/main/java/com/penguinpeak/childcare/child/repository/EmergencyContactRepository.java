package com.penguinpeak.childcare.child.repository;

import com.penguinpeak.childcare.child.entity.EmergencyContact;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {
    List<EmergencyContact> findByChildIdOrderByPriorityAsc(Long childId);
    Optional<EmergencyContact> findByIdAndChildId(Long id, Long childId);
}
