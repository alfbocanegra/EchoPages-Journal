import { Database } from 'sqlite3';
import { beforeAll, beforeEach, afterAll } from '@jest/globals';

let testDb: Database;

beforeAll(async () => {
  // Create in-memory SQLite database for tests
  testDb = new Database(':memory:');

  await new Promise<void>((resolve, _reject) => {
    testDb.serialize(() => {
      testDb.run('PRAGMA foreign_keys = ON');

      // Create tables
      testDb.run(`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);

      testDb.run(`
        CREATE TABLE journal_entries (
          id TEXT PRIMARY KEY,
          user_id TEXT REFERENCES users(id),
          title TEXT,
          content TEXT,
          content_encrypted INTEGER DEFAULT 0,
          encrypted_content BLOB,
          content_key BLOB,
          content_nonce BLOB,
          content_tag BLOB,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);

      testDb.run(`
        CREATE TABLE folders (
          id TEXT PRIMARY KEY,
          user_id TEXT REFERENCES users(id),
          name TEXT,
          description TEXT,
          is_encrypted INTEGER DEFAULT 0,
          encrypted_name BLOB,
          encrypted_description BLOB,
          folder_key BLOB,
          folder_nonce BLOB,
          folder_tag BLOB,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);

      testDb.run(`
        CREATE TABLE media_attachments (
          id TEXT PRIMARY KEY,
          entry_id TEXT REFERENCES journal_entries(id),
          filename TEXT,
          content_type TEXT,
          is_encrypted INTEGER DEFAULT 0,
          encrypted_content BLOB,
          media_key BLOB,
          media_nonce BLOB,
          media_tag BLOB,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);

      testDb.run(`
        CREATE TABLE encryption_metadata (
          id TEXT PRIMARY KEY,
          user_id TEXT REFERENCES users(id),
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          encryption_version INTEGER NOT NULL DEFAULT 1,
          last_rotated_at TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (entity_type, entity_id)
        )`);

      testDb.run(`
        CREATE TABLE sync_metadata (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          device_id TEXT NOT NULL,
          last_sync_at TEXT NOT NULL,
          sync_status TEXT NOT NULL,
          metadata TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (user_id, device_id)
        )`);

      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>(resolve => {
    testDb.close(() => resolve());
  });
});

beforeEach(async () => {
  // Clear all tables before each test
  await new Promise<void>((resolve, _reject) => {
    testDb.serialize(() => {
      testDb.run('DELETE FROM encryption_metadata');
      testDb.run('DELETE FROM media_attachments');
      testDb.run('DELETE FROM journal_entries');
      testDb.run('DELETE FROM folders');
      testDb.run('DELETE FROM sync_metadata');
      testDb.run('DELETE FROM users');
      resolve();
    });
  });
});

// Export the database instance for tests to use
export { testDb };
