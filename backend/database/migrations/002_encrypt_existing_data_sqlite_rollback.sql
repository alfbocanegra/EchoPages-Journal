-- Drop view
DROP VIEW IF EXISTS encryption_migration_status;

-- Drop encryption metadata table and trigger
DROP TRIGGER IF EXISTS update_encryption_metadata_updated_at;
DROP TABLE IF EXISTS encryption_metadata;

-- Remove encryption metadata columns from media_attachments
ALTER TABLE media_attachments DROP COLUMN encrypted_content;
ALTER TABLE media_attachments DROP COLUMN media_key;
ALTER TABLE media_attachments DROP COLUMN media_nonce;
ALTER TABLE media_attachments DROP COLUMN media_tag;

-- Remove encryption metadata columns from folders
ALTER TABLE folders DROP COLUMN encrypted_name;
ALTER TABLE folders DROP COLUMN encrypted_description;
ALTER TABLE folders DROP COLUMN folder_key;
ALTER TABLE folders DROP COLUMN folder_nonce;
ALTER TABLE folders DROP COLUMN folder_tag;

-- Remove encryption metadata columns from journal_entries
ALTER TABLE journal_entries DROP COLUMN encrypted_content;
ALTER TABLE journal_entries DROP COLUMN content_key;
ALTER TABLE journal_entries DROP COLUMN content_nonce;
ALTER TABLE journal_entries DROP COLUMN content_tag; 