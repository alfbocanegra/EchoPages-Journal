-- Add encryption metadata columns to journal_entries
ALTER TABLE journal_entries
ADD COLUMN IF NOT EXISTS encrypted_content BYTEA,
ADD COLUMN IF NOT EXISTS content_key BYTEA,
ADD COLUMN IF NOT EXISTS content_nonce BYTEA,
ADD COLUMN IF NOT EXISTS content_tag BYTEA;

-- Add encryption metadata columns to folders
ALTER TABLE folders
ADD COLUMN IF NOT EXISTS encrypted_name BYTEA,
ADD COLUMN IF NOT EXISTS encrypted_description BYTEA,
ADD COLUMN IF NOT EXISTS folder_key BYTEA,
ADD COLUMN IF NOT EXISTS folder_nonce BYTEA,
ADD COLUMN IF NOT EXISTS folder_tag BYTEA;

-- Add encryption metadata columns to media_attachments
ALTER TABLE media_attachments
ADD COLUMN IF NOT EXISTS encrypted_content BYTEA,
ADD COLUMN IF NOT EXISTS media_key BYTEA,
ADD COLUMN IF NOT EXISTS media_nonce BYTEA,
ADD COLUMN IF NOT EXISTS media_tag BYTEA;

-- Create encryption_metadata table for tracking encryption status
CREATE TABLE encryption_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'journal_entry', 'folder', or 'media'
    entity_id UUID NOT NULL,
    encryption_version INTEGER NOT NULL DEFAULT 1,
    last_rotated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (entity_type, entity_id)
);

CREATE INDEX idx_encryption_metadata_user ON encryption_metadata(user_id);
CREATE INDEX idx_encryption_metadata_entity ON encryption_metadata(entity_type, entity_id);

-- Create trigger for encryption_metadata updated_at
CREATE TRIGGER update_encryption_metadata_updated_at
    BEFORE UPDATE ON encryption_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for tracking encryption progress
CREATE OR REPLACE VIEW encryption_migration_status AS
SELECT 
    u.id as user_id,
    u.email,
    COUNT(DISTINCT j.id) as total_journal_entries,
    COUNT(DISTINCT CASE WHEN j.content_encrypted THEN j.id END) as encrypted_journal_entries,
    COUNT(DISTINCT f.id) as total_folders,
    COUNT(DISTINCT CASE WHEN f.is_encrypted THEN f.id END) as encrypted_folders,
    COUNT(DISTINCT m.id) as total_media,
    COUNT(DISTINCT CASE WHEN m.is_encrypted THEN m.id END) as encrypted_media
FROM users u
LEFT JOIN journal_entries j ON j.user_id = u.id
LEFT JOIN folders f ON f.user_id = u.id
LEFT JOIN media_attachments m ON m.entry_id IN (SELECT id FROM journal_entries WHERE user_id = u.id)
GROUP BY u.id, u.email; 