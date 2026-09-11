package com.penguinpeak.childcare.common.audit;

/** Context shape for the future audit module; this class does not persist audit events. */
public record AuditContext(
        String actorId,
        String organisationId,
        String centreId,
        String action,
        String requestId) {
}
