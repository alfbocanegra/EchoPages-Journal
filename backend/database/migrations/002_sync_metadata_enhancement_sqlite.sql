-- Add change tracking table
CREATE TABLE sync_changes (
    id TEXT PRIMARY KEY,  -- UUID stored as TEXT
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('journal_entry', 'folder', 'tag', 'media_attachment')),
    entity_id TEXT NOT NULL,
    change_type TEXT NOT NULL CHECK (change_type IN ('create', 'update', 'delete')),
    change_version INTEGER NOT NULL,
    change_timestamp TEXT NOT NULL DEFAULT (datetime('now')),  -- Timestamp in ISO8601
    change_metadata TEXT DEFAULT '{}',  -- JSON stored as TEXT
    is_conflict INTEGER DEFAULT 0,  -- Boolean as INTEGER (0/1)
    resolved_at TEXT,  -- Timestamp in ISO8601
    resolved_by TEXT REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_sync_changes_user ON sync_changes(user_id);
CREATE INDEX idx_sync_changes_entity ON sync_changes(entity_type, entity_id);
CREATE INDEX idx_sync_changes_timestamp ON sync_changes(change_timestamp);
CREATE INDEX idx_sync_changes_version ON sync_changes(change_version);
CREATE INDEX idx_sync_changes_conflict ON sync_changes(is_conflict) WHERE is_conflict = 1;

-- Add device sync state table
CREATE TABLE sync_device_states (
    id TEXT PRIMARY KEY,  -- UUID stored as TEXT
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    last_sync_version INTEGER NOT NULL DEFAULT 0,
    last_successful_sync TEXT,  -- Timestamp in ISO8601
    sync_failures INTEGER DEFAULT 0,
    device_metadata TEXT DEFAULT '{}',  -- JSON stored as TEXT
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, device_id)
);

CREATE INDEX idx_device_states_user ON sync_device_states(user_id);
CREATE INDEX idx_device_states_version ON sync_device_states(last_sync_version);

-- Add conflict resolution table
CREATE TABLE sync_conflicts (
    id TEXT PRIMARY KEY,  -- UUID stored as TEXT
    change_id TEXT NOT NULL REFERENCES sync_changes(id) ON DELETE CASCADE,
    conflicting_change_id TEXT REFERENCES sync_changes(id),
    resolution_strategy TEXT NOT NULL CHECK (resolution_strategy IN ('client_wins', 'server_wins', 'manual', 'merge')),
    resolved INTEGER DEFAULT 0,  -- Boolean as INTEGER (0/1)
    resolution_metadata TEXT DEFAULT '{}',  -- JSON stored as TEXT
    resolved_at TEXT,  -- Timestamp in ISO8601
    resolved_by TEXT REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_conflicts_change ON sync_conflicts(change_id);
CREATE INDEX idx_conflicts_resolution ON sync_conflicts(resolved, resolution_strategy);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_sync_changes_updated_at
    AFTER UPDATE ON sync_changes
    FOR EACH ROW
    BEGIN
        UPDATE sync_changes SET updated_at = datetime('now')
        WHERE id = NEW.id;
    END;

CREATE TRIGGER update_sync_device_states_updated_at
    AFTER UPDATE ON sync_device_states
    FOR EACH ROW
    BEGIN
        UPDATE sync_device_states SET updated_at = datetime('now')
        WHERE id = NEW.id;
    END;

CREATE TRIGGER update_sync_conflicts_updated_at
    AFTER UPDATE ON sync_conflicts
    FOR EACH ROW
    BEGIN
        UPDATE sync_conflicts SET updated_at = datetime('now')
        WHERE id = NEW.id;
    END;

-- Add version tracking to existing tables
ALTER TABLE journal_entries 
    ADD COLUMN local_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE journal_entries 
    ADD COLUMN server_version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE folders 
    ADD COLUMN local_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE folders 
    ADD COLUMN server_version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE tags 
    ADD COLUMN local_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE tags 
    ADD COLUMN server_version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE media_attachments 
    ADD COLUMN local_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE media_attachments 
    ADD COLUMN server_version INTEGER NOT NULL DEFAULT 1; 