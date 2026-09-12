package com.penguinpeak.childcare.authentication.repository;
import com.penguinpeak.childcare.authentication.entity.Role; import java.util.*; import org.springframework.data.jpa.repository.*;
public interface RoleRepository extends JpaRepository<Role, Long> { Optional<Role> findByName(String name); @EntityGraph(attributePaths = "permissions") List<Role> findAllByOrderByNameAsc(); }
