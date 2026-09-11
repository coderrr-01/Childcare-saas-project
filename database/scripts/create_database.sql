-- Database setup script
-- Run this first to create the database and application user

-- 1. Create the database
CREATE DATABASE childcare_saas
    WITH
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_AU.UTF-8'
    LC_CTYPE = 'en_AU.UTF-8'
    TEMPLATE = template0;

-- 2. Connect to the database and run as superuser
\c childcare_saas;

-- 3. Create application user with limited privileges
CREATE USER childcare_app WITH PASSWORD 'change_me_in_production';

-- 4. Grant schema usage
GRANT USAGE ON SCHEMA public TO childcare_app;

-- 5. Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO childcare_app;

-- 6. Grant sequence usage (for IDENTITY columns)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO childcare_app;

-- 7. Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO childcare_app;

-- 8. Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO childcare_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO childcare_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO childcare_app;

-- 9. Create read-only user for reporting
CREATE USER childcare_readonly WITH PASSWORD 'readonly_password';
GRANT USAGE ON SCHEMA public TO childcare_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO childcare_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO childcare_readonly;
