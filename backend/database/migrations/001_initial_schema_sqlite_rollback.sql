-- Drop triggers
DROP TRIGGER IF EXISTS update_sync_metadata_updated_at;
DROP TRIGGER IF EXISTS update_media_attachments_updated_at;
DROP TRIGGER IF EXISTS update_tags_updated_at;
DROP TRIGGER IF EXISTS update_journal_entries_updated_at;
DROP TRIGGER IF EXISTS update_folders_updated_at;
DROP TRIGGER IF EXISTS update_users_updated_at;

-- Drop tables
DROP TABLE IF EXISTS sync_metadata;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS media_attachments;
DROP TABLE IF EXISTS entry_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS journal_entries;
DROP TABLE IF EXISTS folders;
DROP TABLE IF EXISTS users; 