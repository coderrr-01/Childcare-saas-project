-- V018: Audit log table

-- Audit logs
CREATE TABLE audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT REFERENCES organisations(id) ON DELETE SET NULL,
    centre_id BIGINT REFERENCES centres(id) ON DELETE SET NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(30) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'VIEW', 'APPROVE', 'DECLINE')),
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Primary query pattern: by organisation + time, by entity, by user
CREATE INDEX idx_audit_logs_organisation ON audit_logs(organisation_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_centre ON audit_logs(centre_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
