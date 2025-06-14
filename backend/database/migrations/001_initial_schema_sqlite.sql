-- SQLite doesn't support ENUM types, using CHECK constraints instead
-- SQLite doesn't support UUID type, using TEXT instead
-- SQLite doesn't support TIMESTAMPTZ, using TEXT for ISO8601 timestamps

PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,  -- UUID stored as TEXT
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    preferences TEXT DEFAULT '{}',  -- JSON stored as TEXT
    last_login_at TEXT,  -- Timestamp in ISO8601
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);

-- Folders table
CREATE TABLE folders (
    id TEXT PRIMARY KEY,  -- UUID stored as TEXT
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_encrypted INTEGER NOT NULL DEFAULT 0,  -- Boolean as INTEGER (0/1)
    sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
    sync_version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, parent_folder_id, name)
);

CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_parent ON folders(parent_folder_id);
CREATE INDEX idx_folders_sync ON folders(user_id, sync_status);

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
    weather TEXT DEFAULT '{}',  -- JSON stored as TEXT
    location TEXT DEFAULT '{}',  -- JSON stored as TEXT
    entry_date TEXT NOT NULL DEFAULT (date('now')),  -- Date in ISO8601
    sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
    sync_version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_entries_folder_id ON journal_entries(folder_id);
CREATE INDEX idx_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX idx_entries_status ON journal_entries(status);
CREATE INDEX idx_entries_sync ON journal_entries(user_id, sync_status);

-- Tags table
CREATE TABLE tags (
    id TEXT PRIMARY KEY,  -- UUID stored as TEXT
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT CHECK (color REGEXP '^#[0-9A-Fa-f]{6}$'),  -- Hex color validation
    sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
    sync_version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, name)
);

CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_tags_sync ON tags(user_id, sync_status);

-- Entry tags junction table
CREATE TABLE entry_tags (
    entry_id TEXT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (entry_id, tag_id)
);

CREATE INDEX idx_entry_tags_tag_id ON entry_tags(tag_id);

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
    sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
    sync_version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_media_entry_id ON media_attachments(entry_id);
CREATE INDEX idx_media_sync ON media_attachments(entry_id, sync_status);

-- User sessions table
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,  -- UUID stored as TEXT
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    device_info TEXT DEFAULT '{}',  -- JSON stored as TEXT
    expires_at TEXT NOT NULL,  -- Timestamp in ISO8601
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_active_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- Sync metadata table
CREATE TABLE sync_metadata (
    id TEXT PRIMARY KEY,  -- UUID stored as TEXT
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    last_sync_at TEXT NOT NULL DEFAULT (datetime('now')),  -- Timestamp in ISO8601
    sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
    metadata TEXT DEFAULT '{}',  -- JSON stored as TEXT
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, device_id)
);

CREATE INDEX idx_sync_user_id ON sync_metadata(user_id);
CREATE INDEX idx_sync_device ON sync_metadata(device_id);
CREATE INDEX idx_sync_last_sync ON sync_metadata(last_sync_at);

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

CREATE TRIGGER update_journal_entries_updated_at
    AFTER UPDATE ON journal_entries
    FOR EACH ROW
    BEGIN
        UPDATE journal_entries SET updated_at = datetime('now')
        WHERE id = NEW.id;
    END;

CREATE TRIGGER update_tags_updated_at
    AFTER UPDATE ON tags
    FOR EACH ROW
    BEGIN
        UPDATE tags SET updated_at = datetime('now')
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