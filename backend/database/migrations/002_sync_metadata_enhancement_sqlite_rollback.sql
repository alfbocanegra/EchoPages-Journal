-- Remove version tracking from existing tables
ALTER TABLE journal_entries DROP COLUMN local_version;
ALTER TABLE journal_entries DROP COLUMN server_version;

ALTER TABLE folders DROP COLUMN local_version;
ALTER TABLE folders DROP COLUMN server_version;

ALTER TABLE tags DROP COLUMN local_version;
ALTER TABLE tags DROP COLUMN server_version;

ALTER TABLE media_attachments DROP COLUMN local_version;
ALTER TABLE media_attachments DROP COLUMN server_version;

-- Drop sync-related tables
DROP TABLE IF EXISTS sync_conflicts;
DROP TABLE IF EXISTS sync_device_states;
DROP TABLE IF EXISTS sync_changes; 