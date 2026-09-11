-- V003: Organisation, Centre, Room tables

-- Organisations (top-level tenant)
CREATE TABLE organisations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    abn VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(30),
    website VARCHAR(500),
    logo_url TEXT,
    address_street VARCHAR(200),
    address_suburb VARCHAR(100),
    address_state VARCHAR(50),
    address_postcode VARCHAR(10),
    address_country VARCHAR(50) DEFAULT 'AU',
    timezone VARCHAR(50) DEFAULT 'Australia/Sydney',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Organisation settings (key-value)
CREATE TABLE organisation_settings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organisation_id, setting_key)
);

-- Centres
CREATE TABLE centres (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30),
    address_street VARCHAR(200),
    address_suburb VARCHAR(100),
    address_state VARCHAR(50),
    address_postcode VARCHAR(10),
    address_country VARCHAR(50) DEFAULT 'AU',
    capacity INT NOT NULL DEFAULT 0,
    timezone VARCHAR(50) DEFAULT 'Australia/Sydney',
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING')),
    license_number VARCHAR(100),
    opening_time TIME,
    closing_time TIME,
    operating_days INT[] DEFAULT '{1,2,3,4,5}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_centres_organisation ON centres(organisation_id) WHERE deleted_at IS NULL;

-- Centre settings (key-value)
CREATE TABLE centre_settings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(centre_id, setting_key)
);

-- Rooms
CREATE TABLE rooms (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 0,
    min_age_months INT,
    max_age_months INT,
    lead_educator_id BIGINT REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rooms_centre ON rooms(centre_id);
CREATE INDEX idx_rooms_organisation ON rooms(organisation_id);

-- Add foreign keys for user_organisations and user_centres
ALTER TABLE user_organisations ADD CONSTRAINT fk_user_org_organisation
    FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE CASCADE;

ALTER TABLE user_centres ADD CONSTRAINT fk_user_centre_centre
    FOREIGN KEY (centre_id) REFERENCES centres(id) ON DELETE CASCADE;

-- Update rooms lead_educator FK
-- (Already added inline above)
