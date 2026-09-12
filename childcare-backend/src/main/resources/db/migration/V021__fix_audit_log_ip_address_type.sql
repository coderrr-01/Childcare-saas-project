-- V021: Change audit_logs.ip_address from inet to text for Hibernate compatibility
-- The inet type is PostgreSQL-specific and causes schema validation issues with JPA String mapping.
-- text is semantically equivalent for storing IP address strings.

ALTER TABLE audit_logs ALTER COLUMN ip_address TYPE text;
