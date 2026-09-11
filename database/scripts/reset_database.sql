-- Database reset script
-- WARNING: This will DELETE ALL DATA

-- Drop and recreate the database
DROP DATABASE IF EXISTS childcare_saas;
CREATE DATABASE childcare_saas
    WITH
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_AU.UTF-8'
    LC_CTYPE = 'en_AU.UTF-8'
    TEMPLATE = template0;

-- After running this script, run create_database.sql then Flyway migrations
