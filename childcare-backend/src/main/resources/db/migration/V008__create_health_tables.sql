-- V008: Health tables

-- Allergies
CREATE TABLE allergies (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    allergen VARCHAR(200) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'MODERATE' CHECK (severity IN ('LOW', 'MODERATE', 'HIGH', 'SEVERE', 'CRITICAL')),
    reaction_description TEXT,
    action_plan TEXT,
    diagnosed_by VARCHAR(200),
    diagnosed_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_allergies_child ON allergies(child_id);
CREATE INDEX idx_allergies_centre ON allergies(centre_id);

-- Medical conditions
CREATE TABLE medical_conditions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    condition_name VARCHAR(200) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL DEFAULT 'MODERATE' CHECK (severity IN ('LOW', 'MODERATE', 'HIGH', 'SEVERE', 'CRITICAL')),
    diagnosed_by VARCHAR(200),
    diagnosed_date DATE,
    action_plan TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medical_conditions_child ON medical_conditions(child_id);
CREATE INDEX idx_medical_conditions_centre ON medical_conditions(centre_id);

-- Dietary requirements
CREATE TABLE dietary_requirements (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    requirement_type VARCHAR(50) NOT NULL CHECK (requirement_type IN ('ALLERGY', 'INTOLERANCE', 'PREFERENCE', 'RELIGIOUS', 'MEDICAL', 'OTHER')),
    description TEXT NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('LOW', 'MODERATE', 'HIGH', 'SEVERE')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dietary_child ON dietary_requirements(child_id);
CREATE INDEX idx_dietary_centre ON dietary_requirements(centre_id);

-- Immunisations
CREATE TABLE immunisations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(200) NOT NULL,
    date_administered DATE NOT NULL,
    batch_number VARCHAR(100),
    administered_by VARCHAR(200),
    next_due_date DATE,
    notes TEXT,
    document_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_immunisations_child ON immunisations(child_id);
CREATE INDEX idx_immunisations_centre ON immunisations(centre_id);

-- Health notes (general health observations)
CREATE TABLE health_notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    recorded_by BIGINT NOT NULL REFERENCES users(id),
    note_text TEXT NOT NULL,
    note_date DATE NOT NULL,
    is_important BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_health_notes_child ON health_notes(child_id);
CREATE INDEX idx_health_notes_centre ON health_notes(centre_id, note_date);
