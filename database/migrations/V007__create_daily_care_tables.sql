-- V007: Daily Care tables

-- Meal records
CREATE TABLE meal_records (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    educator_id BIGINT NOT NULL REFERENCES users(id),
    record_date DATE NOT NULL,
    meal_type VARCHAR(30) NOT NULL CHECK (meal_type IN ('BREAKFAST', 'MORNING_TEA', 'LUNCH', 'AFTERNOON_TEA', 'DINNER', 'SNACK')),
    food_description TEXT NOT NULL,
    amount_eaten VARCHAR(30) CHECK (amount_eaten IN ('ALL', 'MOST', 'SOME', 'LITTLE', 'NONE')),
    notes TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meals_child_date ON meal_records(child_id, record_date);
CREATE INDEX idx_meals_centre_date ON meal_records(centre_id, record_date);

-- Sleep records
CREATE TABLE sleep_records (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    educator_id BIGINT NOT NULL REFERENCES users(id),
    record_date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    sleep_quality VARCHAR(30) CHECK (sleep_quality IN ('EXCELLENT', 'GOOD', 'FAIR', 'POOR')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sleep_child_date ON sleep_records(child_id, record_date);
CREATE INDEX idx_sleep_centre_date ON sleep_records(centre_id, record_date);

-- Nappy records
CREATE TABLE nappy_records (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    educator_id BIGINT NOT NULL REFERENCES users(id),
    record_date DATE NOT NULL,
    nappy_type VARCHAR(20) NOT NULL CHECK (nappy_type IN ('WET', 'SOILED', 'BOTH', 'DRY')),
    notes TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nappy_child_date ON nappy_records(child_id, record_date);
CREATE INDEX idx_nappy_centre_date ON nappy_records(centre_id, record_date);

-- Toileting records
CREATE TABLE toileting_records (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    educator_id BIGINT NOT NULL REFERENCES users(id),
    record_date DATE NOT NULL,
    toileting_type VARCHAR(20) NOT NULL CHECK (toileting_type IN ('WEES', 'POOS', 'BOTH', 'DRY')),
    notes TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_toileting_child_date ON toileting_records(child_id, record_date);
CREATE INDEX idx_toileting_centre_date ON toileting_records(centre_id, record_date);

-- Water intake records
CREATE TABLE water_records (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    educator_id BIGINT NOT NULL REFERENCES users(id),
    record_date DATE NOT NULL,
    amount_ml INT,
    notes TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_water_child_date ON water_records(child_id, record_date);

-- Activity records (general daily activities and notes)
CREATE TABLE activity_records (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    child_id BIGINT REFERENCES children(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    educator_id BIGINT NOT NULL REFERENCES users(id),
    record_date DATE NOT NULL,
    activity_type VARCHAR(30) NOT NULL CHECK (activity_type IN ('ACTIVITY', 'NOTE', 'OBSERVATION', 'MILESTONE')),
    title VARCHAR(200),
    description TEXT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_child_date ON activity_records(child_id, record_date);
CREATE INDEX idx_activities_centre_date ON activity_records(centre_id, record_date);
CREATE INDEX idx_activities_room_date ON activity_records(room_id, record_date);
