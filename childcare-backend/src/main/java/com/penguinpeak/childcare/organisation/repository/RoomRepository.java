package com.penguinpeak.childcare.organisation.repository;

import com.penguinpeak.childcare.organisation.entity.Room;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findById(Long id);
    Page<Room> findByCentreId(Long centreId, Pageable pageable);
}
