-- V001: Create PostgreSQL extensions
-- Run first: enables required PostgreSQL features

-- UUID generation (used for external-facing IDs if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cryptographic functions (for password hashing verification)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Full-text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
