package com.penguinpeak.childcare.common.tenant;

/** Tenant identifiers supplied by future authentication; neither value is inferred. */
public record TenantContext(String organisationId, String centreId) {
}
