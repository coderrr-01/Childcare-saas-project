-- V009: Medication tables

-- Medication definitions
CREATE TABLE medications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    medication_type VARCHAR(30) NOT NULL CHECK (medication_type IN ('TABLET', 'CAPSULE', 'LIQUID', 'CREAM', 'INHALER', 'DROPS', 'INJECTION', 'OTHER')),
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(30) NOT NULL CHECK (frequency IN ('DAILY', 'TWICE_DAILY', 'THREE_TIMES_DAILY', 'WEEKLY', 'AS_NEEDED', 'EMERGENCY', 'MONTHLY')),
    start_date DATE NOT NULL,
    end_date DATE,
    prescribed_by VARCHAR(200),
    instructions TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'DISCONTINUED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medications_child ON medications(child_id);
CREATE INDEX idx_medications_centre ON medications(centre_id);
CREATE INDEX idx_medications_status ON medications(status);

-- Child medication schedule (scheduled times)
CREATE TABLE medication_schedules (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    medication_id BIGINT NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    scheduled_time TIME NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medication_schedules_med ON medication_schedules(medication_id);

-- Medication administrations (log of each administration)
CREATE TABLE medication_administrations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    medication_id BIGINT NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    administered_by BIGINT NOT NULL REFERENCES users(id),
    administered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    dosage_given VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ADMINISTERED' CHECK (status IN ('ADMINISTERED', 'MISSED', 'SKIPPED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_med_admin_child ON medication_administrations(child_id, administered_at DESC);
CREATE INDEX idx_med_admin_medication ON medication_administrations(medication_id);
CREATE INDEX idx_med_admin_centre ON medication_administrations(centre_id, administered_at DESC);
