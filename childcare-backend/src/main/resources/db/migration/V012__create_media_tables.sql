-- V012: Media tables

-- Media files (metadata only, actual files stored in S3/object storage)
CREATE TABLE media_files (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    uploaded_by BIGINT NOT NULL REFERENCES users(id),
    file_name VARCHAR(300) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('PHOTO', 'VIDEO', 'DOCUMENT', 'AUDIO')),
    thumbnail_storage_key VARCHAR(500),
    width INT,
    height INT,
    duration_seconds NUMERIC(8,2),
    alt_text TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_files_centre ON media_files(centre_id);
CREATE INDEX idx_media_files_organisation ON media_files(organisation_id);
CREATE INDEX idx_media_files_type ON media_files(media_type);

-- Media links (polymorphic: links media to children, stories, incidents, etc.)
CREATE TABLE media_links (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    media_file_id BIGINT NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(media_file_id, entity_type, entity_id)
);

CREATE INDEX idx_media_links_entity ON media_links(entity_type, entity_id);
