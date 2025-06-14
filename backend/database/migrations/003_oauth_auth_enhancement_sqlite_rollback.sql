-- Remove columns from user_sessions
ALTER TABLE user_sessions DROP COLUMN auth_method;
ALTER TABLE user_sessions DROP COLUMN biometric_credential_id;

-- Drop biometric credentials table and its indexes
DROP TABLE IF EXISTS biometric_credentials;

-- Create temporary table with original schema
CREATE TABLE users_temp (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    preferences TEXT DEFAULT '{}',
    last_login_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- Copy data to temporary table
INSERT INTO users_temp 
SELECT id, email, username, '', full_name, status, preferences, last_login_at, created_at, updated_at 
FROM users;

-- Drop the modified table
DROP TABLE users;

-- Rename the temporary table
ALTER TABLE users_temp RENAME TO users;

-- Recreate original indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status); 