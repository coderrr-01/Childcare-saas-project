package com.penguinpeak.childcare.authentication.repository;

import com.penguinpeak.childcare.authentication.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
