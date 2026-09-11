-- V019: Additional indexes for performance
-- These complement the inline indexes already created

-- Children lookup patterns
CREATE INDEX idx_children_enrolment_status_room ON children(enrolment_status, room_id) WHERE deleted_at IS NULL;

-- Attendance composite for reporting
CREATE INDEX idx_attendance_centre_status_date ON attendance_records(centre_id, status, attendance_date);

-- Daily care composite queries
CREATE INDEX idx_meals_educator_date ON meal_records(educator_id, record_date);
CREATE INDEX idx_sleep_educator_date ON sleep_records(educator_id, record_date);

-- Medication next due (for dashboard queries)
CREATE INDEX idx_medications_next_due ON medications(status, end_date) WHERE status = 'ACTIVE';

-- Enrolment date range queries
CREATE INDEX idx_enrolments_date_range ON enrolments(start_date, end_date) WHERE status = 'ACTIVE';

-- Waitlist priority queue
CREATE INDEX idx_waitlist_active_priority ON waitlist_entries(centre_id, priority, added_at) WHERE status = 'ACTIVE';

-- Notification batch queries
CREATE INDEX idx_notifications_batch ON notifications(notification_type, created_at DESC);

-- Message search
CREATE INDEX idx_messages_content_gin ON messages USING gin(content gin_trgm_ops);

-- Invoice overdue detection
CREATE INDEX idx_invoices_overdue ON invoices(due_date, status) WHERE status IN ('PENDING', 'OVERDUE');
