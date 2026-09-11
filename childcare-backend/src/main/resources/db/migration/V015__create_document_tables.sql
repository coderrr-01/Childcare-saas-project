-- V015: Document tables

-- Documents
CREATE TABLE documents (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    uploaded_by BIGINT NOT NULL REFERENCES users(id),
    name VARCHAR(300) NOT NULL,
    document_category VARCHAR(30) NOT NULL CHECK (document_category IN ('ENROLMENT', 'MEDICAL', 'CHILD', 'FAMILY', 'CENTRE', 'POLICY', 'CONSENT', 'OTHER')),
    file_name VARCHAR(300) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    tags TEXT[],
    expiry_date DATE,
    is_confidential BOOLEAN NOT NULL DEFAULT FALSE,
    child_id BIGINT REFERENCES children(id) ON DELETE SET NULL,
    family_id BIGINT REFERENCES families(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'DELETED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_centre ON documents(centre_id);
CREATE INDEX idx_documents_child ON documents(child_id) WHERE child_id IS NOT NULL;
CREATE INDEX idx_documents_family ON documents(family_id) WHERE family_id IS NOT NULL;
CREATE INDEX idx_documents_category ON documents(document_category);
CREATE INDEX idx_documents_organisation ON documents(organisation_id);

-- Document versions
CREATE TABLE document_versions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number INT NOT NULL DEFAULT 1,
    file_name VARCHAR(300) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by BIGINT NOT NULL REFERENCES users(id),
    change_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_document_versions ON document_versions(document_id, version_number DESC);

-- Document links (polymorphic linking)
CREATE TABLE document_links (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(document_id, entity_type, entity_id)
);

CREATE INDEX idx_document_links_entity ON document_links(entity_type, entity_id);
