-- Drop view
DROP VIEW IF EXISTS encryption_migration_status;

-- Drop encryption metadata table and trigger
DROP TRIGGER IF EXISTS update_encryption_metadata_updated_at ON encryption_metadata;
DROP TABLE IF EXISTS encryption_metadata;

-- Remove encryption metadata columns from media_attachments
ALTER TABLE media_attachments
DROP COLUMN IF EXISTS encrypted_content,
DROP COLUMN IF EXISTS media_key,
DROP COLUMN IF EXISTS media_nonce,
DROP COLUMN IF EXISTS media_tag;

-- Remove encryption metadata columns from folders
ALTER TABLE folders
DROP COLUMN IF EXISTS encrypted_name,
DROP COLUMN IF EXISTS encrypted_description,
DROP COLUMN IF EXISTS folder_key,
DROP COLUMN IF EXISTS folder_nonce,
DROP COLUMN IF EXISTS folder_tag;

-- Remove encryption metadata columns from journal_entries
ALTER TABLE journal_entries
DROP COLUMN IF EXISTS encrypted_content,
DROP COLUMN IF EXISTS content_key,
DROP COLUMN IF EXISTS content_nonce,
DROP COLUMN IF EXISTS content_tag; 