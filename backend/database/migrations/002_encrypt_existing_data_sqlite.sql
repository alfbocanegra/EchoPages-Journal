-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Add encryption metadata columns to journal_entries
ALTER TABLE journal_entries ADD COLUMN encrypted_content BLOB;
ALTER TABLE journal_entries ADD COLUMN content_key BLOB;
ALTER TABLE journal_entries ADD COLUMN content_nonce BLOB;
ALTER TABLE journal_entries ADD COLUMN content_tag BLOB;

-- Add encryption metadata columns to folders
ALTER TABLE folders ADD COLUMN encrypted_name BLOB;
ALTER TABLE folders ADD COLUMN encrypted_description BLOB;
ALTER TABLE folders ADD COLUMN folder_key BLOB;
ALTER TABLE folders ADD COLUMN folder_nonce BLOB;
ALTER TABLE folders ADD COLUMN folder_tag BLOB;

-- Add encryption metadata columns to media_attachments
ALTER TABLE media_attachments ADD COLUMN encrypted_content BLOB;
ALTER TABLE media_attachments ADD COLUMN media_key BLOB;
ALTER TABLE media_attachments ADD COLUMN media_nonce BLOB;
ALTER TABLE media_attachments ADD COLUMN media_tag BLOB;

-- Create encryption_metadata table for tracking encryption status
CREATE TABLE encryption_metadata (
    id TEXT PRIMARY KEY,  -- UUID stored as TEXT
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- 'journal_entry', 'folder', or 'media'
    entity_id TEXT NOT NULL,
    encryption_version INTEGER NOT NULL DEFAULT 1,
    last_rotated_at TEXT,  -- Timestamp in ISO8601
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (entity_type, entity_id)
);

CREATE INDEX idx_encryption_metadata_user ON encryption_metadata(user_id);
CREATE INDEX idx_encryption_metadata_entity ON encryption_metadata(entity_type, entity_id);

-- Create trigger for encryption_metadata updated_at
CREATE TRIGGER update_encryption_metadata_updated_at
    AFTER UPDATE ON encryption_metadata
    FOR EACH ROW
    BEGIN
        UPDATE encryption_metadata 
        SET updated_at = datetime('now')
        WHERE id = NEW.id;
    END;

-- Create view for tracking encryption progress
CREATE VIEW encryption_migration_status AS
SELECT 
    u.id as user_id,
    u.email,
    COUNT(DISTINCT j.id) as total_journal_entries,
    COUNT(DISTINCT CASE WHEN j.content_encrypted = 1 THEN j.id END) as encrypted_journal_entries,
    COUNT(DISTINCT f.id) as total_folders,
    COUNT(DISTINCT CASE WHEN f.is_encrypted = 1 THEN f.id END) as encrypted_folders,
    COUNT(DISTINCT m.id) as total_media,
    COUNT(DISTINCT CASE WHEN m.is_encrypted = 1 THEN m.id END) as encrypted_media
FROM users u
LEFT JOIN journal_entries j ON j.user_id = u.id
LEFT JOIN folders f ON f.user_id = u.id
LEFT JOIN media_attachments m ON m.entry_id IN (SELECT id FROM journal_entries WHERE user_id = u.id)
GROUP BY u.id, u.email; 