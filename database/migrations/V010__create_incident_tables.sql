-- V010: Incident tables

-- Incidents
CREATE TABLE incidents (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    reported_by BIGINT NOT NULL REFERENCES users(id),
    incident_date DATE NOT NULL,
    incident_time TIME,
    location VARCHAR(200) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'MINOR' CHECK (severity IN ('MINOR', 'MODERATE', 'MAJOR', 'SEVERE', 'CRITICAL')),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'REPORTED', 'PARENT_NOTIFIED', 'ACKNOWLEDGED', 'FOLLOW_UP', 'CLOSED')),
    description TEXT NOT NULL,
    action_taken TEXT,
    injury_description TEXT,
    first_aid_given BOOLEAN NOT NULL DEFAULT FALSE,
    first_aid_details TEXT,
    parent_notified BOOLEAN NOT NULL DEFAULT FALSE,
    parent_notified_at TIMESTAMPTZ,
    parent_notified_by BIGINT REFERENCES users(id),
    follow_up_required BOOLEAN NOT NULL DEFAULT FALSE,
    follow_up_notes TEXT,
    follow_up_completed_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    closed_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incidents_centre ON incidents(centre_id);
CREATE INDEX idx_incidents_child ON incidents(child_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_date ON incidents(incident_date DESC);
CREATE INDEX idx_incidents_organisation ON incidents(organisation_id);

-- Incident witnesses
CREATE TABLE incident_witnesses (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    incident_id BIGINT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    role VARCHAR(50),
    statement TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incident_witnesses_incident ON incident_witnesses(incident_id);

-- Incident actions (tracking individual actions taken)
CREATE TABLE incident_actions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    incident_id BIGINT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    action_description TEXT NOT NULL,
    taken_by BIGINT NOT NULL REFERENCES users(id),
    taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incident_actions_incident ON incident_actions(incident_id);

-- Incident status history (audit trail for workflow)
CREATE TABLE incident_status_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    incident_id BIGINT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by BIGINT NOT NULL REFERENCES users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT
);

CREATE INDEX idx_incident_status_history ON incident_status_history(incident_id, changed_at);
