-- Add change tracking table
CREATE TABLE sync_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('journal_entry', 'folder', 'tag', 'media_attachment')),
    entity_id UUID NOT NULL,
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('create', 'update', 'delete')),
    change_version INTEGER NOT NULL,
    change_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    change_metadata JSONB DEFAULT '{}',
    is_conflict BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sync_changes_user ON sync_changes(user_id);
CREATE INDEX idx_sync_changes_entity ON sync_changes(entity_type, entity_id);
CREATE INDEX idx_sync_changes_timestamp ON sync_changes(change_timestamp);
CREATE INDEX idx_sync_changes_version ON sync_changes(change_version);
CREATE INDEX idx_sync_changes_conflict ON sync_changes(is_conflict) WHERE is_conflict = true;

-- Add device sync state table
CREATE TABLE sync_device_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    last_sync_version INTEGER NOT NULL DEFAULT 0,
    last_successful_sync TIMESTAMPTZ,
    sync_failures INTEGER DEFAULT 0,
    device_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_device_state UNIQUE (user_id, device_id)
);

CREATE INDEX idx_device_states_user ON sync_device_states(user_id);
CREATE INDEX idx_device_states_version ON sync_device_states(last_sync_version);

-- Add conflict resolution table
CREATE TABLE sync_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    change_id UUID NOT NULL REFERENCES sync_changes(id) ON DELETE CASCADE,
    conflicting_change_id UUID REFERENCES sync_changes(id),
    resolution_strategy VARCHAR(50) NOT NULL CHECK (resolution_strategy IN ('client_wins', 'server_wins', 'manual', 'merge')),
    resolved BOOLEAN DEFAULT false,
    resolution_metadata JSONB DEFAULT '{}',
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conflicts_change ON sync_conflicts(change_id);
CREATE INDEX idx_conflicts_resolution ON sync_conflicts(resolved, resolution_strategy);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_sync_changes_updated_at
    BEFORE UPDATE ON sync_changes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_device_states_updated_at
    BEFORE UPDATE ON sync_device_states
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_conflicts_updated_at
    BEFORE UPDATE ON sync_conflicts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add version tracking to existing tables
ALTER TABLE journal_entries 
    ADD COLUMN local_version INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN server_version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE folders 
    ADD COLUMN local_version INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN server_version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE tags 
    ADD COLUMN local_version INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN server_version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE media_attachments 
    ADD COLUMN local_version INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN server_version INTEGER NOT NULL DEFAULT 1; 