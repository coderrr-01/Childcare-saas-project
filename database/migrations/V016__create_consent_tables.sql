-- V016: Consent tables

-- Consent types (reference data)
CREATE TABLE consent_types (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    requires_document BOOLEAN NOT NULL DEFAULT FALSE,
    default_expiry_months INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Consent requests
CREATE TABLE consent_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    family_id BIGINT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    consent_type_id BIGINT NOT NULL REFERENCES consent_types(id),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DECLINED', 'EXPIRED')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    document_id BIGINT REFERENCES documents(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consent_requests_child ON consent_requests(child_id);
CREATE INDEX idx_consent_requests_family ON consent_requests(family_id);
CREATE INDEX idx_consent_requests_status ON consent_requests(status);
CREATE INDEX idx_consent_requests_centre ON consent_requests(centre_id);

-- Consent responses (history of responses)
CREATE TABLE consent_responses (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    consent_request_id BIGINT NOT NULL REFERENCES consent_requests(id) ON DELETE CASCADE,
    responded_by BIGINT NOT NULL REFERENCES users(id),
    response VARCHAR(20) NOT NULL CHECK (response IN ('APPROVED', 'DECLINED')),
    response_text TEXT,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consent_responses_request ON consent_responses(consent_request_id);
