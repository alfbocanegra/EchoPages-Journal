-- Remove biometric credential references from user_sessions
ALTER TABLE user_sessions
    DROP COLUMN auth_method,
    DROP COLUMN biometric_credential_id;

-- Drop biometric credentials table
DROP TABLE IF EXISTS biometric_credentials;

-- Revert users table changes
ALTER TABLE users
    ADD COLUMN password_hash TEXT,
    DROP COLUMN auth_provider,
    DROP COLUMN auth_provider_id,
    DROP COLUMN auth_provider_data,
    DROP COLUMN refresh_token;

-- Drop indexes
DROP INDEX IF EXISTS idx_users_auth_provider;

-- Drop custom types
DROP TYPE IF EXISTS auth_provider;
DROP TYPE IF EXISTS biometric_type; 