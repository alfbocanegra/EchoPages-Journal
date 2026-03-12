import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { Database } from 'sqlite3';
import { DataEncryptionMigration } from '../encryptExistingData';
import { createEncryptionService } from '../../services/encryption';
import winston from 'winston';
import { testConfig } from '../../config/test.config';
import { EncryptionService } from '../../services/encryption';

// Create a test logger
const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()],
  format: winston.format.simple(),
});

describe('DataEncryptionMigration', () => {
  let sqliteDb: Database;
  let migration: DataEncryptionMigration;
  const encryptionService = createEncryptionService(testConfig.encryption);

  beforeAll(async () => {
    // Setup SQLite test database
    sqliteDb = new Database(':memory:');
    await new Promise<void>((resolve, _reject) => {
      sqliteDb.serialize(() => {
        sqliteDb.run('PRAGMA foreign_keys = ON');

        // Create tables
        sqliteDb.run(`
          CREATE TABLE users (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          )`);

        sqliteDb.run(`
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

        sqliteDb.run(`
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

        sqliteDb.run(`
          CREATE TABLE media_attachments (
            id TEXT PRIMARY KEY,
            user_id TEXT REFERENCES users(id),
            journal_entry_id TEXT REFERENCES journal_entries(id),
            file_path TEXT,
            file_name TEXT,
            mime_type TEXT,
            size INTEGER,
            is_encrypted INTEGER DEFAULT 0,
            encrypted_file BLOB,
            file_key BLOB,
            file_nonce BLOB,
            file_tag BLOB,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          )`);

        sqliteDb.run(`
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

        resolve();
      });
    });
  });

  beforeEach(async () => {
    // Clear all tables before each test
    await new Promise<void>(resolve => {
      sqliteDb.serialize(() => {
        sqliteDb.run('DELETE FROM encryption_metadata');
        sqliteDb.run('DELETE FROM journal_entries');
        sqliteDb.run('DELETE FROM folders');
        sqliteDb.run('DELETE FROM users');
        resolve();
      });
    });

    // Insert test data
    await new Promise<void>(resolve => {
      sqliteDb.serialize(() => {
        sqliteDb.run('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)', [
          'user1',
          'test@example.com',
          'hash123',
        ]);

        sqliteDb.run(
          'INSERT INTO journal_entries (id, user_id, title, content) VALUES (?, ?, ?, ?)',
          ['entry1', 'user1', 'Test Entry', 'This is a test entry']
        );

        sqliteDb.run('INSERT INTO folders (id, user_id, name, description) VALUES (?, ?, ?, ?)', [
          'folder1',
          'user1',
          'Test Folder',
          'This is a test folder',
        ]);

        resolve();
      });
    });

    // Create test instance
    migration = new DataEncryptionMigration(null, sqliteDb, encryptionService, logger, 10);
  });

  afterAll(async () => {
    await new Promise<void>(resolve => sqliteDb.close(() => resolve()));
  });

  describe('Data Migration', () => {
    it('should encrypt journal entries', async () => {
      await migration.migrateAll();

      await new Promise<void>(resolve => {
        sqliteDb.get('SELECT * FROM journal_entries', (err, row: any) => {
          expect(row.content_encrypted).toBe(1);
          expect(row.encrypted_content).toBeDefined();
          expect(row.content_key).toBeDefined();
          resolve();
        });
      });
    }, 10000);

    it('should encrypt folders', async () => {
      await migration.migrateAll();

      await new Promise<void>(resolve => {
        sqliteDb.get('SELECT * FROM folders', (err, row: any) => {
          expect(row.is_encrypted).toBe(1);
          expect(row.encrypted_name).toBeDefined();
          expect(row.folder_key).toBeDefined();
          resolve();
        });
      });
    }, 10000);

    it('should create encryption metadata entries', async () => {
      await migration.migrateAll();

      await new Promise<void>(resolve => {
        sqliteDb.all('SELECT * FROM encryption_metadata', (err, rows: any[]) => {
          expect(rows).toHaveLength(2); // One for journal entry, one for folder
          resolve();
        });
      });
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should handle encryption errors', async () => {
      // Create a failing encryption service
      const failingEncryptionService: EncryptionService = {
        encrypt: jest.fn().mockRejectedValue(new Error('Encryption failed')),
        decrypt: jest.fn().mockRejectedValue(new Error('Decryption failed')),
      };

      const invalidMigration = new DataEncryptionMigration(
        null,
        sqliteDb,
        failingEncryptionService,
        logger,
        10
      );

      await expect(invalidMigration.migrateAll()).rejects.toThrow('Encryption failed');

      // Verify no partial updates were committed
      await new Promise<void>(resolve => {
        sqliteDb.get(
          'SELECT COUNT(*) as count FROM journal_entries WHERE content_encrypted = 1',
          (err, row: any) => {
            expect(parseInt(row.count)).toBe(0);
            resolve();
          }
        );
      });
    }, 10000);
  });
});
