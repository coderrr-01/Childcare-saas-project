-- Canonical system roles and permissions required by the authentication module.
-- Idempotent inserts preserve environments that already received the development seed data.
INSERT INTO roles (name, description, is_system) VALUES
    ('SUPER_ADMIN', 'Platform administrator with full access', TRUE),
    ('ORG_ADMIN', 'Organisation administrator', TRUE),
    ('CENTRE_ADMIN', 'Centre administrator', TRUE),
    ('EDUCATOR', 'Early childhood educator', TRUE),
    ('PARENT', 'Parent or guardian', TRUE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (code, resource, action, description) VALUES
    ('users:read', 'users', 'read', 'View users within an authorised scope'),
    ('users:write', 'users', 'write', 'Create and update users within an authorised scope'),
    ('users:status', 'users', 'status', 'Change user active status within an authorised scope'),
    ('roles:read', 'roles', 'read', 'View role definitions'),
    ('permissions:read', 'permissions', 'read', 'View permission definitions')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN ('users:read', 'users:write', 'users:status', 'roles:read', 'permissions:read')
WHERE r.name = 'ORG_ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code = 'users:read'
WHERE r.name = 'CENTRE_ADMIN'
ON CONFLICT DO NOTHING;
