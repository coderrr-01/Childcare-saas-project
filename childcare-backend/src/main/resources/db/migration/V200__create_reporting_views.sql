-- V020: Reporting views

-- Active children per centre
CREATE OR REPLACE VIEW v_active_children AS
SELECT
    c.id,
    c.first_name,
    c.last_name,
    c.date_of_birth,
    c.gender,
    c.centre_id,
    c.room_id,
    c.organisation_id,
    r.name AS room_name,
    EXTRACT(YEAR FROM age(c.date_of_birth)) AS age_years,
    EXTRACT(MONTH FROM age(c.date_of_birth)) AS age_months
FROM children c
LEFT JOIN rooms r ON c.room_id = r.id
WHERE c.is_active = TRUE
    AND c.deleted_at IS NULL;

-- Today's attendance summary per centre
CREATE OR REPLACE VIEW v_today_attendance_summary AS
SELECT
    ar.centre_id,
    ar.organisation_id,
    ar.attendance_date,
    COUNT(*) FILTER (WHERE ar.status = 'PRESENT') AS present_count,
    COUNT(*) FILTER (WHERE ar.status = 'LATE') AS late_count,
    COUNT(*) FILTER (WHERE ar.status = 'ABSENT') AS absent_count,
    COUNT(*) FILTER (WHERE ar.status = 'LEFT_EARLY') AS left_early_count,
    COUNT(*) FILTER (WHERE ar.status = 'EXPECTED') AS expected_count,
    COUNT(*) AS total_count
FROM attendance_records ar
WHERE ar.attendance_date = CURRENT_DATE
GROUP BY ar.centre_id, ar.organisation_id, ar.attendance_date;

-- Children with active allergies (quick safety view)
CREATE OR REPLACE VIEW v_children_allergy_alerts AS
SELECT
    c.id AS child_id,
    c.first_name,
    c.last_name,
    c.centre_id,
    a.allergen,
    a.severity,
    a.action_plan
FROM children c
JOIN allergies a ON c.id = a.child_id
WHERE a.is_active = TRUE
    AND c.is_active = TRUE
    AND c.deleted_at IS NULL
ORDER BY a.severity DESC;

-- Medications due today
CREATE OR REPLACE VIEW v_medications_due_today AS
SELECT
    m.id AS medication_id,
    m.child_id,
    m.name AS medication_name,
    m.dosage,
    m.frequency,
    m.instructions,
    c.first_name AS child_first_name,
    c.last_name AS child_last_name,
    c.centre_id,
    m.organisation_id
FROM medications m
JOIN children c ON m.child_id = c.id
WHERE m.status = 'ACTIVE'
    AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE);

-- Dashboard KPIs per centre
CREATE OR REPLACE VIEW v_centre_dashboard_kpis AS
SELECT
    c.id AS centre_id,
    c.organisation_id,
    c.name AS centre_name,
    (SELECT COUNT(*) FROM children ch WHERE ch.centre_id = c.id AND ch.is_active = TRUE AND ch.deleted_at IS NULL) AS total_children,
    (SELECT COUNT(*) FROM children ch WHERE ch.centre_id = c.id AND ch.enrolment_status = 'ENROLLED' AND ch.deleted_at IS NULL) AS enrolled_children,
    (SELECT COUNT(*) FROM waitlist_entries w WHERE w.centre_id = c.id AND w.status = 'ACTIVE') AS waitlist_count,
    (SELECT COUNT(*) FROM incidents i WHERE i.centre_id = c.id AND i.status NOT IN ('CLOSED', 'DRAFT')) AS open_incidents,
    (SELECT COUNT(*) FROM medication_administrations ma WHERE ma.centre_id = c.id AND ma.administered_at::date = CURRENT_DATE) AS medications_given_today
FROM centres c
WHERE c.status = 'ACTIVE' AND c.deleted_at IS NULL;
