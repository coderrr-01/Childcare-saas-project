-- V006: Attendance tables

-- Attendance records (one per child per day)
CREATE TABLE attendance_records (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'EXPECTED' CHECK (status IN ('EXPECTED', 'PRESENT', 'ABSENT', 'LATE', 'LEFT_EARLY')),
    check_in_at TIMESTAMPTZ,
    check_out_at TIMESTAMPTZ,
    checked_in_by BIGINT REFERENCES users(id),
    checked_out_by BIGINT REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_attendance_child_date ON attendance_records(child_id, attendance_date);
CREATE INDEX idx_attendance_centre_date ON attendance_records(centre_id, attendance_date);
CREATE INDEX idx_attendance_organisation ON attendance_records(organisation_id);
CREATE INDEX idx_attendance_room_date ON attendance_records(room_id, attendance_date);
CREATE INDEX idx_attendance_status ON attendance_records(status);

-- Attendance events (individual check-in/check-out events)
CREATE TABLE attendance_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    attendance_record_id BIGINT NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('CHECK_IN', 'CHECK_OUT', 'LATE_ARRIVAL', 'EARLY_DEPARTURE')),
    event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by BIGINT REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attendance_events_record ON attendance_events(attendance_record_id);
