package com.penguinpeak.childcare.authentication.service;

import com.penguinpeak.childcare.authentication.entity.AuditLog;
import com.penguinpeak.childcare.authentication.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuditService.class);
    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(Long userId, Long organisationId, Long centreId,
                    String action, String entityType, Long entityId,
                    String description, String ipAddress, String userAgent) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setUserId(userId);
            auditLog.setOrganisationId(organisationId);
            auditLog.setCentreId(centreId);
            auditLog.setAction(action);
            auditLog.setEntityType(entityType);
            auditLog.setEntityId(entityId);
            auditLog.setDescription(description);
            auditLog.setIpAddress(ipAddress);
            auditLog.setUserAgent(userAgent);
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            LOGGER.warn("Failed to write audit log: {}", e.getMessage());
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logLogin(Long userId, Long organisationId, Long centreId,
                         String ipAddress, String userAgent, boolean success, String failureReason) {
        String description = success ? "Login successful" : "Login failed: " + failureReason;
        log(userId, organisationId, centreId, "LOGIN", "USER", userId, description, ipAddress, userAgent);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logLogout(Long userId, Long organisationId, Long centreId,
                          String ipAddress, String userAgent) {
        log(userId, organisationId, centreId, "LOGOUT", "USER", userId, "Logout", ipAddress, userAgent);
    }
}
