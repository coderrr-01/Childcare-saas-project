-- V004: Child & Family tables

-- Families
CREATE TABLE families (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    family_number VARCHAR(50) NOT NULL,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_families_organisation ON families(organisation_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_families_centre ON families(centre_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_families_number ON families(family_number, organisation_id) WHERE deleted_at IS NULL;

-- Family members (parents/guardians)
CREATE TABLE family_members (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    family_id BIGINT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30),
    mobile VARCHAR(30),
    occupation VARCHAR(100),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    is_emergency_contact BOOLEAN NOT NULL DEFAULT FALSE,
    address_street VARCHAR(200),
    address_suburb VARCHAR(100),
    address_state VARCHAR(50),
    address_postcode VARCHAR(10),
    address_country VARCHAR(50) DEFAULT 'AU',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_family_members_family ON family_members(family_id);
CREATE INDEX idx_family_members_user ON family_members(user_id) WHERE user_id IS NOT NULL;

-- Children
CREATE TABLE children (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    room_id BIGINT REFERENCES rooms(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL DEFAULT 'unspecified' CHECK (gender IN ('male', 'female', 'other', 'unspecified')),
    enrolment_status VARCHAR(30) NOT NULL DEFAULT 'WAITLISTED' CHECK (enrolment_status IN ('ENROLLED', 'WAITLISTED', 'WITHDRAWN', 'TRANSFERRED')),
    photo_url TEXT,
    nationality VARCHAR(50),
    cultural_notes TEXT,
    languages_spoken VARCHAR(200),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_children_centre ON children(centre_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_children_room ON children(room_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_children_organisation ON children(organisation_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_children_status ON children(enrolment_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_children_dob ON children(date_of_birth) WHERE deleted_at IS NULL;

-- Child ↔ Family relationships (many-to-many)
CREATE TABLE child_family_relationships (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    family_id BIGINT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    family_member_id BIGINT REFERENCES family_members(id) ON DELETE SET NULL,
    relationship_type VARCHAR(50) NOT NULL DEFAULT 'parent',
    is_primary_guardian BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(child_id, family_id)
);

CREATE INDEX idx_child_family_child ON child_family_relationships(child_id);
CREATE INDEX idx_child_family_family ON child_family_relationships(family_id);

-- Emergency contacts per child
CREATE TABLE emergency_contacts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    mobile VARCHAR(30),
    email VARCHAR(255),
    priority INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_emergency_contacts_child ON emergency_contacts(child_id);

-- Authorised pickups per child
CREATE TABLE authorised_pickups (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    mobile VARCHAR(30),
    photo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_authorised_pickups_child ON authorised_pickups(child_id);
