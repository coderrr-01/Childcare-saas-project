-- V022: Change user_sessions.ip_address from inet to text for JPA/Hibernate compatibility

ALTER TABLE user_sessions ALTER COLUMN ip_address TYPE text;
