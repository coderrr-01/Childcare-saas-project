-- V005: Enrolment & Waitlist tables

-- Enrolments
CREATE TABLE enrolments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    family_id BIGINT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    hours_per_week NUMERIC(5,1) NOT NULL DEFAULT 0,
    daily_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
    subsidy_percentage NUMERIC(5,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_enrolments_centre ON enrolments(centre_id);
CREATE INDEX idx_enrolments_child ON enrolments(child_id);
CREATE INDEX idx_enrolments_family ON enrolments(family_id);
CREATE INDEX idx_enrolments_status ON enrolments(status);
CREATE INDEX idx_enrolments_organisation ON enrolments(organisation_id);

-- Enrolment schedule (requested days)
CREATE TABLE enrolment_schedules (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    enrolment_id BIGINT NOT NULL REFERENCES enrolments(id) ON DELETE CASCADE UNIQUE,
    monday BOOLEAN NOT NULL DEFAULT FALSE,
    tuesday BOOLEAN NOT NULL DEFAULT FALSE,
    wednesday BOOLEAN NOT NULL DEFAULT FALSE,
    thursday BOOLEAN NOT NULL DEFAULT FALSE,
    friday BOOLEAN NOT NULL DEFAULT FALSE,
    saturday BOOLEAN NOT NULL DEFAULT FALSE,
    sunday BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Waitlist entries
CREATE TABLE waitlist_entries (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    family_id BIGINT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    preferred_room_id BIGINT REFERENCES rooms(id) ON DELETE SET NULL,
    preferred_start_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'OFFERED', 'ENROLLED', 'EXPIRED', 'CANCELLED')),
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    notes TEXT,
    offered_at TIMESTAMPTZ,
    offer_expires_at TIMESTAMPTZ,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_waitlist_centre ON waitlist_entries(centre_id);
CREATE INDEX idx_waitlist_status ON waitlist_entries(status);
CREATE INDEX idx_waitlist_priority ON waitlist_entries(priority);
CREATE INDEX idx_waitlist_organisation ON waitlist_entries(organisation_id);
