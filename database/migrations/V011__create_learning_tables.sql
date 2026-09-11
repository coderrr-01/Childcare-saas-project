-- V011: Learning Stories tables

-- Learning stories
CREATE TABLE learning_stories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organisation_id BIGINT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    centre_id BIGINT NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    child_id BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    educator_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(300) NOT NULL,
    story TEXT NOT NULL,
    observations TEXT,
    reflection TEXT,
    next_steps TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    published_at TIMESTAMPTZ,
    parent_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learning_stories_centre ON learning_stories(centre_id);
CREATE INDEX idx_learning_stories_child ON learning_stories(child_id);
CREATE INDEX idx_learning_stories_educator ON learning_stories(educator_id);
CREATE INDEX idx_learning_stories_status ON learning_stories(status);
CREATE INDEX idx_learning_stories_organisation ON learning_stories(organisation_id);

-- Learning story media attachments
CREATE TABLE learning_story_media (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    learning_story_id BIGINT NOT NULL REFERENCES learning_stories(id) ON DELETE CASCADE,
    media_file_id BIGINT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learning_story_media ON learning_story_media(learning_story_id);

-- Learning story EYLF outcomes
CREATE TABLE learning_story_outcomes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    learning_story_id BIGINT NOT NULL REFERENCES learning_stories(id) ON DELETE CASCADE,
    outcome_code VARCHAR(50) NOT NULL,
    outcome_description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learning_story_outcomes ON learning_story_outcomes(learning_story_id);
