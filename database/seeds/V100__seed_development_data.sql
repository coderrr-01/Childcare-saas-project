-- V021: Seed data for development
-- WARNING: Use development-only fictional data

-- Roles
INSERT INTO roles (name, description) VALUES
('SUPER_ADMIN', 'Platform administrator with full access'),
('ORG_ADMIN', 'Organisation administrator'),
('CENTRE_ADMIN', 'Centre director/administrator'),
('EDUCATOR', 'Early childhood educator'),
('PARENT', 'Parent or guardian');

-- Permissions
INSERT INTO permissions (code, resource, action) VALUES
('children:read', 'children', 'read'),
('children:write', 'children', 'write'),
('children:delete', 'children', 'delete'),
('families:read', 'families', 'read'),
('families:write', 'families', 'write'),
('families:delete', 'families', 'delete'),
('enrolments:read', 'enrolments', 'read'),
('enrolments:write', 'enrolments', 'write'),
('enrolments:delete', 'enrolments', 'delete'),
('attendance:read', 'attendance', 'read'),
('attendance:write', 'attendance', 'write'),
('dailyCare:read', 'dailyCare', 'read'),
('dailyCare:write', 'dailyCare', 'write'),
('health:read', 'health', 'read'),
('health:write', 'health', 'write'),
('medication:read', 'medication', 'read'),
('medication:write', 'medication', 'write'),
('incidents:read', 'incidents', 'read'),
('incidents:write', 'incidents', 'write'),
('incidents:delete', 'incidents', 'delete'),
('learning:read', 'learning', 'read'),
('learning:write', 'learning', 'write'),
('learning:delete', 'learning', 'delete'),
('media:read', 'media', 'read'),
('media:write', 'media', 'write'),
('media:delete', 'media', 'delete'),
('messages:read', 'messages', 'read'),
('messages:write', 'messages', 'write'),
('documents:read', 'documents', 'read'),
('documents:write', 'documents', 'write'),
('documents:delete', 'documents', 'delete'),
('consent:read', 'consent', 'read'),
('consent:write', 'consent', 'write'),
('billing:read', 'billing', 'read'),
('billing:write', 'billing', 'write'),
('reports:read', 'reports', 'read'),
('settings:read', 'settings', 'read'),
('settings:write', 'settings', 'write'),
('users:read', 'users', 'read'),
('users:write', 'users', 'write'),
('users:delete', 'users', 'delete'),
('centres:read', 'centres', 'read'),
('centres:write', 'centres', 'write');

-- Role ↔ Permission mappings
-- SUPER_ADMIN gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'SUPER_ADMIN';

-- ORG_ADMIN gets most permissions (no delete on children/incidents)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ORG_ADMIN'
AND p.code NOT LIKE '%:delete';

-- CENTRE_ADMIN gets similar to ORG_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'CENTRE_ADMIN'
AND p.code NOT LIKE '%:delete'
AND p.code NOT IN ('users:write', 'centres:write');

-- EDUCATOR gets limited permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'EDUCATOR'
AND p.code IN ('children:read', 'families:read', 'attendance:read', 'attendance:write',
               'dailyCare:read', 'dailyCare:write', 'health:read', 'medication:read',
               'medication:write', 'incidents:read', 'incidents:write', 'learning:read',
               'learning:write', 'media:read', 'media:write', 'messages:read', 'messages:write',
               'documents:read', 'consent:read');

-- PARENT gets read-only plus messaging and consent
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'PARENT'
AND p.code IN ('children:read', 'families:read', 'attendance:read', 'dailyCare:read',
               'health:read', 'medication:read', 'learning:read', 'media:read',
               'messages:read', 'messages:write', 'documents:read', 'consent:read',
               'consent:write', 'billing:read');

-- Organisation
INSERT INTO organisations (id, name, abn, email, phone, address_suburb, address_state, address_postcode, address_country, timezone)
VALUES (1, 'Little Explorers Early Learning', '12 345 678 901', 'admin@littleexplorers.com.au', '+61 2 9876 5432', 'Parramatta', 'NSW', '2150', 'AU', 'Australia/Sydney');

-- Centre
INSERT INTO centres (id, organisation_id, name, email, phone, address_suburb, address_state, address_postcode, capacity, timezone, status, license_number, opening_time, closing_time)
VALUES (1, 1, 'Little Explorers Parramatta', 'parramatta@littleexplorers.com.au', '+61 2 9876 5433', 'Parramatta', 'NSW', '2150', 56, 'Australia/Sydney', 'ACTIVE', 'NSW-ELC-2024-001', '07:00', '18:00');

-- Rooms
INSERT INTO rooms (id, organisation_id, centre_id, name, capacity, min_age_months, max_age_months) VALUES
(1, 1, 1, 'Babies', 10, 0, 24),
(2, 1, 1, 'Toddlers', 14, 12, 36),
(3, 1, 1, 'Preschool', 20, 36, 48),
(4, 1, 1, 'Kindergarten', 12, 48, 60);

-- Users (passwords are all 'Password123!' bcrypt hashed)
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, is_active, email_verified) VALUES
(1, 'superadmin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System', 'Administrator', '+61 400 000 001', TRUE, TRUE),
(2, 'orgadmin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sarah', 'Mitchell', '+61 400 000 002', TRUE, TRUE),
(3, 'director@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'James', 'Thompson', '+61 400 000 003', TRUE, TRUE),
(4, 'educator@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Emily', 'Chen', '+61 400 000 004', TRUE, TRUE),
(5, 'parent@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Michael', 'Wilson', '+61 400 000 005', TRUE, TRUE);

-- User roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, (SELECT id FROM roles WHERE name = 'SUPER_ADMIN')),
(2, (SELECT id FROM roles WHERE name = 'ORG_ADMIN')),
(3, (SELECT id FROM roles WHERE name = 'CENTRE_ADMIN')),
(4, (SELECT id FROM roles WHERE name = 'EDUCATOR')),
(5, (SELECT id FROM roles WHERE name = 'PARENT'));

-- User-centre assignments
INSERT INTO user_centres (user_id, centre_id, is_default) VALUES
(2, 1, TRUE),
(3, 1, TRUE),
(4, 1, TRUE),
(5, 1, TRUE);

-- Consent types
INSERT INTO consent_types (name, description, requires_document, default_expiry_months) VALUES
('PHOTOGRAPHY', 'Consent to take and use photos of the child', FALSE, 12),
('MEDICAL', 'Consent for medical treatment in emergencies', TRUE, 12),
('EXCURSION', 'Consent for off-site excursions', FALSE, 6),
('SUNSCREEN', 'Consent to apply sunscreen', FALSE, 12),
('MEDICATION', 'Consent to administer medication', TRUE, 6);

-- Sample families
INSERT INTO families (id, organisation_id, centre_id, family_number, notes) VALUES
(1, 1, 1, 'FAM-001', NULL),
(2, 1, 1, 'FAM-002', NULL),
(3, 1, 1, 'FAM-003', 'Single parent family'),
(4, 1, 1, 'FAM-004', NULL),
(5, 1, 1, 'FAM-005', NULL);

-- Sample family members
INSERT INTO family_members (family_id, user_id, first_name, last_name, relationship, email, phone, mobile, is_primary, is_emergency_contact) VALUES
(1, 5, 'Michael', 'Wilson', 'Father', 'parent@example.com', '+61 2 9876 1001', '+61 400 100 001', TRUE, TRUE),
(1, NULL, 'Sarah', 'Wilson', 'Mother', 'sarah.wilson@example.com', '+61 2 9876 1002', '+61 400 100 002', FALSE, TRUE),
(2, NULL, 'Lisa', 'Smith', 'Mother', 'lisa.smith@example.com', '+61 2 9876 2001', '+61 400 200 001', TRUE, TRUE),
(2, NULL, 'James', 'Smith', 'Father', 'james.smith@example.com', '+61 2 9876 2002', '+61 400 200 002', FALSE, TRUE),
(3, NULL, 'Karen', 'Taylor', 'Mother', 'karen.taylor@example.com', '+61 2 9876 3001', '+61 400 300 001', TRUE, TRUE);

-- Sample children
INSERT INTO children (id, organisation_id, centre_id, room_id, first_name, last_name, date_of_birth, gender, enrolment_status) VALUES
(1, 1, 1, 1, 'Emma', 'Wilson', '2025-03-15', 'female', 'ENROLLED'),
(2, 1, 1, 1, 'Noah', 'Smith', '2025-06-20', 'male', 'ENROLLED'),
(3, 1, 1, 2, 'Olivia', 'Brown', '2024-08-10', 'female', 'ENROLLED'),
(4, 1, 1, 2, 'Jack', 'Taylor', '2024-05-22', 'male', 'ENROLLED'),
(5, 1, 1, 3, 'Sophia', 'Clark', '2023-01-15', 'female', 'ENROLLED');

-- Child ↔ Family relationships
INSERT INTO child_family_relationships (child_id, family_id, family_member_id, relationship_type, is_primary_guardian) VALUES
(1, 1, 1, 'parent', TRUE),
(1, 1, 2, 'parent', FALSE),
(2, 2, 3, 'parent', TRUE),
(3, 2, 3, 'parent', TRUE),
(4, 3, 5, 'parent', TRUE),
(5, 3, 5, 'parent', TRUE);

-- Sample allergies
INSERT INTO allergies (organisation_id, centre_id, child_id, allergen, severity, reaction_description) VALUES
(1, 1, 1, 'Dairy', 'HIGH', 'Hives and swelling'),
(1, 1, 3, 'Peanuts', 'CRITICAL', 'Anaphylaxis risk'),
(1, 1, 3, 'Eggs', 'MODERATE', 'Skin rash');

-- Sample medical conditions
INSERT INTO medical_conditions (organisation_id, centre_id, child_id, condition_name, severity, action_plan) VALUES
(1, 1, 4, 'Asthma', 'MODERATE', 'Use Ventolin inhaler as needed. Keep blue inhaler in room.');

-- Sample medications
INSERT INTO medications (id, organisation_id, centre_id, child_id, name, medication_type, dosage, frequency, start_date, instructions, status) VALUES
(1, 1, 1, 4, 'Salbutamol (Ventolin)', 'INHALER', '2 puffs', 'AS_NEEDED', '2026-01-01', 'Administer 2 puffs via spacer when showing signs of wheezing.', 'ACTIVE'),
(2, 1, 1, 3, 'Epinephrine (EpiPen)', 'INJECTION', '0.15mg', 'EMERGENCY', '2026-01-01', 'Administer in case of anaphylaxis. Call 000 immediately after.', 'ACTIVE');

-- Sample enrolments
INSERT INTO enrolments (organisation_id, centre_id, child_id, family_id, room_id, start_date, status, hours_per_week, daily_rate, subsidy_percentage) VALUES
(1, 1, 1, 1, 1, '2026-01-15', 'ACTIVE', 50, 155.00, 85),
(1, 1, 2, 2, 1, '2026-02-01', 'ACTIVE', 50, 155.00, 90),
(1, 1, 3, 2, 2, '2026-01-15', 'ACTIVE', 50, 150.00, 85),
(1, 1, 4, 3, 2, '2026-03-01', 'ACTIVE', 40, 150.00, 85),
(1, 1, 5, 3, 3, '2026-01-15', 'ACTIVE', 50, 145.00, 90);

-- Sample attendance records (today)
INSERT INTO attendance_records (organisation_id, centre_id, child_id, room_id, attendance_date, status, check_in_at, checked_in_by) VALUES
(1, 1, 1, 1, CURRENT_DATE, 'PRESENT', NOW() - INTERVAL '7 hours', 4),
(1, 1, 2, 1, CURRENT_DATE, 'LATE', NOW() - INTERVAL '5 hours', 4),
(1, 1, 3, 2, CURRENT_DATE, 'PRESENT', NOW() - INTERVAL '7 hours', 4),
(1, 1, 4, 2, CURRENT_DATE, 'ABSENT', NULL, NULL),
(1, 1, 5, 3, CURRENT_DATE, 'PRESENT', NOW() - INTERVAL '6 hours', 4);

-- Sample messages conversation
INSERT INTO conversations (centre_id, subject, conversation_type, child_id, last_message_preview, last_message_at) VALUES
(1, 'Emma''s Dairy Allergy Update', 'DIRECT', 1, 'Thank you for the update, we''ll ensure the new plan is followed.', NOW() - INTERVAL '2 hours');

INSERT INTO conversation_participants (conversation_id, user_id) VALUES
(1, 4),
(1, 5);

INSERT INTO messages (conversation_id, sender_id, content, status, created_at) VALUES
(1, 4, 'Hi Michael, just wanted to let you know that Emma had a small reaction to dairy today. We''ve updated her care plan.', 'READ', NOW() - INTERVAL '1 day'),
(1, 5, 'Thank you for letting us know. Was it a severe reaction?', 'READ', NOW() - INTERVAL '23 hours'),
(1, 4, 'No, it was mild - just some hives on her arms. We applied cream and monitored her. She was fine within 30 minutes.', 'READ', NOW() - INTERVAL '22 hours'),
(1, 5, 'Thank you for the update, we''ll ensure the new plan is followed.', 'SENT', NOW() - INTERVAL '2 hours');

-- Sample notifications
INSERT INTO notifications (user_id, organisation_id, centre_id, notification_type, title, message, priority, child_id, created_at) VALUES
(4, 1, 1, 'ATTENDANCE', 'Late Arrival', 'Noah Smith arrived late at 9:15 AM', 'LOW', 2, NOW() - INTERVAL '6 hours'),
(4, 1, 1, 'MEDICATION', 'Medication Due', 'Salbutamol inhaler due for Jack Taylor', 'HIGH', 4, NOW() - INTERVAL '1 hour'),
(3, 1, 1, 'INCIDENT', 'New Incident Reported', 'A minor incident has been reported for Jack Taylor', 'MEDIUM', 4, NOW() - INTERVAL '3 hours');

-- Sample billing
INSERT INTO billing_accounts (organisation_id, centre_id, family_id, account_number, status, balance) VALUES
(1, 1, 1, 'BA-001', 'ACTIVE', 0),
(1, 1, 2, 'BA-002', 'ACTIVE', 0),
(1, 1, 3, 'BA-003', 'ACTIVE', 500.00);

INSERT INTO invoices (organisation_id, centre_id, billing_account_id, family_id, invoice_number, status, issue_date, due_date, subtotal, gst, total, amount_paid, amount_owing) VALUES
(1, 1, 1, 1, 'INV-2026-001', 'PAID', '2026-09-01', '2026-09-15', 2909.09, 290.91, 3200.00, 3200.00, 0),
(1, 1, 2, 2, 'INV-2026-002', 'PENDING', '2026-09-01', '2026-09-15', 2818.18, 281.82, 3100.00, 0, 3100.00),
(1, 1, 3, 3, 'INV-2026-003', 'OVERDUE', '2026-08-01', '2026-08-15', 2545.45, 254.55, 2800.00, 500.00, 2300.00);

INSERT INTO invoice_line_items (invoice_id, child_id, description, quantity, unit_price, amount) VALUES
(1, 1, 'Daily care - Emma Wilson (20 days)', 20, 155.00, 3100.00),
(2, 2, 'Daily care - Noah Smith (20 days)', 20, 155.00, 3100.00),
(3, 4, 'Daily care - Jack Taylor (20 days)', 20, 140.00, 2800.00);
