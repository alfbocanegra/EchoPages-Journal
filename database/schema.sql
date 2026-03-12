-- EchoPages Journal PostgreSQL Schema
-- Version: 1.0.0

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE entry_status AS ENUM ('draft', 'published', 'archived', 'deleted');
CREATE TYPE sync_status AS ENUM ('pending', 'synced', 'conflict');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100),
    status user_status NOT NULL DEFAULT 'active',
    preferences JSONB DEFAULT '{}',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Folders table
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sync_status sync_status NOT NULL DEFAULT 'synced',
    sync_version INTEGER NOT NULL DEFAULT 1,
    UNIQUE (user_id, parent_folder_id, name)
);

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sync_status sync_status NOT NULL DEFAULT 'synced',
    sync_version INTEGER NOT NULL DEFAULT 1,
    UNIQUE (user_id, name)
);

-- Journal entries table
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    title TEXT,
    content TEXT,
    content_encrypted BOOLEAN NOT NULL DEFAULT false,
    status entry_status NOT NULL DEFAULT 'published',
    mood_score SMALLINT CHECK (mood_score >= 1 AND mood_score <= 10),
    weather JSONB,
    location JSONB,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sync_status sync_status NOT NULL DEFAULT 'synced',
    sync_version INTEGER NOT NULL DEFAULT 1
);

-- Entry tags junction table
CREATE TABLE entry_tags (
    entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (entry_id, tag_id)
);

-- Media attachments table
CREATE TABLE media_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    is_encrypted BOOLEAN NOT NULL DEFAULT false,
    thumbnail_path TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sync_status sync_status NOT NULL DEFAULT 'synced',
    sync_version INTEGER NOT NULL DEFAULT 1
);

-- User sessions table for authentication
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    device_info JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sync metadata table
CREATE TABLE sync_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    last_sync_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sync_status sync_status NOT NULL DEFAULT 'synced',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, device_id)
);

-- Indexes
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_folder_id ON journal_entries(folder_id);
CREATE INDEX idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_sync_status ON journal_entries(sync_status);
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_parent_folder_id ON folders(parent_folder_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_media_attachments_entry_id ON media_attachments(entry_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_sync_metadata_user_id ON sync_metadata(user_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at
    BEFORE UPDATE ON folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_attachments_updated_at
    BEFORE UPDATE ON media_attachments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_metadata_updated_at
    BEFORE UPDATE ON sync_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments on tables and columns
COMMENT ON TABLE users IS 'User accounts and profile information';
COMMENT ON TABLE folders IS 'Journal entry organizational folders';
COMMENT ON TABLE tags IS 'User-defined tags for categorizing entries';
COMMENT ON TABLE journal_entries IS 'Main journal entries table';
COMMENT ON TABLE entry_tags IS 'Junction table linking entries to tags';
COMMENT ON TABLE media_attachments IS 'Files and media attached to journal entries';
COMMENT ON TABLE user_sessions IS 'Active user sessions and authentication tokens';
COMMENT ON TABLE sync_metadata IS 'Cross-device synchronization metadata'; 