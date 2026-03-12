-- Create auth provider type
CREATE TYPE auth_provider AS ENUM ('google', 'apple', 'microsoft');

-- Create biometric type
CREATE TYPE biometric_type AS ENUM ('face_id', 'touch_id', 'windows_hello', 'fingerprint');

-- Add OAuth and biometric fields to users table
ALTER TABLE users
    DROP COLUMN password_hash,
    ADD COLUMN auth_provider auth_provider,
    ADD COLUMN auth_provider_id VARCHAR(255),
    ADD COLUMN auth_provider_data JSONB DEFAULT '{}',
    ADD COLUMN refresh_token TEXT;

-- Create unique constraint for auth provider and ID
CREATE UNIQUE INDEX idx_users_auth_provider ON users(auth_provider, auth_provider_id) WHERE auth_provider IS NOT NULL;

-- Create biometric credentials table
CREATE TABLE biometric_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    biometric_type biometric_type NOT NULL,
    biometric_key_hash TEXT NOT NULL,
    public_key TEXT,
    key_handle TEXT,
    metadata JSONB DEFAULT '{}',
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_biometric_per_device UNIQUE (user_id, device_id, biometric_type)
);

CREATE INDEX idx_biometric_user ON biometric_credentials(user_id);
CREATE INDEX idx_biometric_device ON biometric_credentials(device_id);

-- Add trigger for updated_at
CREATE TRIGGER update_biometric_credentials_updated_at
    BEFORE UPDATE ON biometric_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Modify user_sessions table to support biometric auth
ALTER TABLE user_sessions
    ADD COLUMN auth_method VARCHAR(20) NOT NULL DEFAULT 'oauth',
    ADD COLUMN biometric_credential_id UUID REFERENCES biometric_credentials(id) ON DELETE SET NULL; 