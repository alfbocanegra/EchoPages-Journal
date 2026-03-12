-- Drop triggers
DROP TRIGGER IF EXISTS update_sync_metadata_updated_at ON sync_metadata;
DROP TRIGGER IF EXISTS update_media_attachments_updated_at ON media_attachments;
DROP TRIGGER IF EXISTS update_tags_updated_at ON tags;
DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;
DROP TRIGGER IF EXISTS update_folders_updated_at ON folders;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables
DROP TABLE IF EXISTS sync_metadata;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS media_attachments;
DROP TABLE IF EXISTS entry_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS journal_entries;
DROP TABLE IF EXISTS folders;
DROP TABLE IF EXISTS users;

-- Drop custom types
DROP TYPE IF EXISTS user_status;
DROP TYPE IF EXISTS sync_status;
DROP TYPE IF EXISTS entry_status;

-- Drop UUID extension if no other tables are using it
-- DROP EXTENSION IF EXISTS "uuid-ossp"; 