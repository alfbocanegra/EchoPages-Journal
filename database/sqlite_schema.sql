-- EchoPages Journal SQLite Schema
-- Version: 1.0.0

-- SQLite doesn't support ENUMs, using CHECK constraints instead
-- User status values: 'active', 'inactive', 'suspended'
-- Entry status values: 'draft', 'published', 'archived', 'deleted'
-- Sync status values: 'pending', 'synced', 'conflict'

-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,  -- UUID stored as TEXT
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    preferences TEXT DEFAULT '{}',  -- JSON stored as TEXT
    last_login_at TEXT,  -- ISO8601 timestamp
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Folders table
CREATE TABLE folders (
    id TEXT PRIMARY KEY,  -- UUID stored as TEXT
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_folder_id TEXT REFERENCES folders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_encrypted INTEGER NOT NULL DEFAULT 0,  -- Boolean as INTEGER (0/1)
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
    sync_version INTEGER NOT NULL DEFAULT 1,
    UNIQUE (user_id, parent_folder_id, name)
);

-- Tags table
CREATE TABLE tags (
    id TEXT PRIMARY KEY,  -- UUID stored as TEXT
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,  -- Hex color code
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
    sync_version INTEGER NOT NULL DEFAULT 1,
    UNIQUE (user_id, name)
);

-- Journal entries table
CREATE TABLE journal_entries (
    id TEXT PRIMARY KEY,  -- UUID stored as TEXT
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
    title TEXT,
    content TEXT,
    content_encrypted INTEGER NOT NULL DEFAULT 0,  -- Boolean as INTEGER (0/1)
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    weather TEXT,  -- JSON stored as TEXT
    location TEXT,  -- JSON stored as TEXT
    entry_date TEXT NOT NULL DEFAULT (date('now')),  -- Date in ISO8601
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
    sync_version INTEGER NOT NULL DEFAULT 1
);

-- Entry tags junction table
CREATE TABLE entry_tags (
    entry_id TEXT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (entry_id, tag_id)
);

-- Media attachments table
CREATE TABLE media_attachments (
    id TEXT PRIMARY KEY,  -- UUID stored as TEXT
    entry_id TEXT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,  -- SQLite INTEGER is 64-bit
    storage_path TEXT NOT NULL,
    is_encrypted INTEGER NOT NULL DEFAULT 0,  -- Boolean as INTEGER (0/1)
    thumbnail_path TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON stored as TEXT
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
    sync_version INTEGER NOT NULL DEFAULT 1
);

-- User sessions table for authentication
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,  -- UUID stored as TEXT
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    device_info TEXT NOT NULL,  -- JSON stored as TEXT
    expires_at TEXT NOT NULL,  -- ISO8601 timestamp
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_active_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sync metadata table
CREATE TABLE sync_metadata (
    id TEXT PRIMARY KEY,  -- UUID stored as TEXT
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    last_sync_at TEXT NOT NULL DEFAULT (datetime('now')),
    sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
    metadata TEXT DEFAULT '{}',  -- JSON stored as TEXT
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, device_id)
);

-- Indexes (same as PostgreSQL for consistency)
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
CREATE TRIGGER update_users_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
        UPDATE users SET updated_at = datetime('now')
        WHERE id = NEW.id;
    END;

CREATE TRIGGER update_folders_updated_at
    AFTER UPDATE ON folders
    FOR EACH ROW
    BEGIN
        UPDATE folders SET updated_at = datetime('now')
        WHERE id = NEW.id;
    END;

CREATE TRIGGER update_tags_updated_at
    AFTER UPDATE ON tags
    FOR EACH ROW
    BEGIN
        UPDATE tags SET updated_at = datetime('now')
        WHERE id = NEW.id;
    END;

CREATE TRIGGER update_journal_entries_updated_at
    AFTER UPDATE ON journal_entries
    FOR EACH ROW
    BEGIN
        UPDATE journal_entries SET updated_at = datetime('now')
        WHERE id = NEW.id;
    END;

CREATE TRIGGER update_media_attachments_updated_at
    AFTER UPDATE ON media_attachments
    FOR EACH ROW
    BEGIN
        UPDATE media_attachments SET updated_at = datetime('now')
        WHERE id = NEW.id;
    END;

CREATE TRIGGER update_sync_metadata_updated_at
    AFTER UPDATE ON sync_metadata
    FOR EACH ROW
    BEGIN
        UPDATE sync_metadata SET updated_at = datetime('now')
        WHERE id = NEW.id;
    END; 