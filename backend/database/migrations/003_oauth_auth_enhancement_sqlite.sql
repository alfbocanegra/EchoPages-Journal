-- SQLite doesn't support ENUM, so we'll use CHECK constraints
-- First, create a temporary table to preserve data
CREATE TABLE users_temp (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    preferences TEXT DEFAULT '{}',
    auth_provider TEXT CHECK (auth_provider IN ('google', 'apple', 'microsoft')),
    auth_provider_id TEXT,
    auth_provider_data TEXT DEFAULT '{}',
    refresh_token TEXT,
    last_login_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- Copy data from the old table
INSERT INTO users_temp 
SELECT id, email, username, full_name, status, preferences, NULL, NULL, '{}', NULL, last_login_at, created_at, updated_at 
FROM users;

-- Drop the old table
DROP TABLE users;

-- Rename the temporary table
ALTER TABLE users_temp RENAME TO users;

-- Recreate indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE UNIQUE INDEX idx_users_auth_provider ON users(auth_provider, auth_provider_id) WHERE auth_provider IS NOT NULL;

-- Create biometric credentials table
CREATE TABLE biometric_credentials (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    biometric_type TEXT NOT NULL CHECK (biometric_type IN ('face_id', 'touch_id', 'windows_hello', 'fingerprint')),
    biometric_key_hash TEXT NOT NULL,
    public_key TEXT,
    key_handle TEXT,
    metadata TEXT DEFAULT '{}',
    last_used_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    UNIQUE (user_id, device_id, biometric_type)
);

CREATE INDEX idx_biometric_user ON biometric_credentials(user_id);
CREATE INDEX idx_biometric_device ON biometric_credentials(device_id);

-- Add columns to user_sessions table
ALTER TABLE user_sessions 
    ADD COLUMN auth_method TEXT NOT NULL DEFAULT 'oauth' CHECK (auth_method IN ('oauth', 'biometric'));
ALTER TABLE user_sessions 
    ADD COLUMN biometric_credential_id TEXT REFERENCES biometric_credentials(id) ON DELETE SET NULL; 