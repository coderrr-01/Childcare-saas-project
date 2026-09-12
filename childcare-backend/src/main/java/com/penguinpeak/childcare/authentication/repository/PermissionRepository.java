package com.penguinpeak.childcare.authentication.repository;
import com.penguinpeak.childcare.authentication.entity.Permission; import java.util.List; import org.springframework.data.jpa.repository.JpaRepository;
public interface PermissionRepository extends JpaRepository<Permission, Long> { List<Permission> findAllByOrderByCodeAsc(); }
