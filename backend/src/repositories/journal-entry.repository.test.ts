import { Pool, QueryResult } from 'pg';
import { JournalEntryRepository } from './journal-entry.repository';
import { RedisCacheService } from '../cache/redis.service';
import { EncryptionService } from '../encryption/encryption.service';
import { ENV_KEYS } from '../encryption/encryption.config';

// Mock dependencies
jest.mock('pg');
jest.mock('../cache/redis.service');
jest.mock('../encryption/encryption.service');

describe('JournalEntryRepository', () => {
  let repository: JournalEntryRepository;
  let mockPool: jest.Mocked<Pool>;
  let mockCache: jest.Mocked<RedisCacheService>;
  let mockEncryption: jest.Mocked<EncryptionService>;

  const mockUserId = 'test-user-123';
  const mockEntryId = 'test-entry-123';
  const mockContent = 'Test journal entry content';
  const mockEncryptedContent = 'encrypted:Test journal entry content';
  const testDate = new Date('2024-01-01T12:00:00Z');

  beforeAll(() => {
    // Set up encryption environment variables
    process.env[ENV_KEYS.MASTER_KEY] = EncryptionService.generateMasterKey();
    process.env[ENV_KEYS.KEY_DERIVATION_SALT] = EncryptionService.generateKeyDerivationSalt();
  });

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock instances with properly typed query method
    mockPool = {
      query: jest
        .fn()
        .mockImplementation(() => Promise.resolve({ rows: [] })) as unknown as Pool['query'],
    } as unknown as jest.Mocked<Pool>;
    mockCache = new RedisCacheService() as jest.Mocked<RedisCacheService>;
    mockEncryption = new EncryptionService() as jest.Mocked<EncryptionService>;

    // Set up encryption mock methods
    mockEncryption.encrypt.mockImplementation(async (_, data) => `encrypted:${data}`);
    mockEncryption.decrypt.mockImplementation(async (_, data) => {
      if (!data.startsWith('encrypted:')) {
        throw new Error('Invalid encrypted data format');
      }
      return data.substring('encrypted:'.length);
    });

    // Create repository instance
    repository = new JournalEntryRepository(mockPool, mockCache, mockEncryption);
  });

  afterAll(() => {
    delete process.env[ENV_KEYS.MASTER_KEY];
    delete process.env[ENV_KEYS.KEY_DERIVATION_SALT];
  });

  describe('findById', () => {
    const mockDbRow = {
      id: mockEntryId,
      user_id: mockUserId,
      folder_id: null,
      title: null,
      content: mockEncryptedContent,
      content_encrypted: true,
      status: 'published',
      mood_score: null,
      weather: '{}',
      location: '{}',
      entry_date: testDate,
      created_at: testDate,
      updated_at: testDate,
      sync_status: 'synced',
      sync_version: 1,
    };

    const expectedEntry = {
      id: mockEntryId,
      userId: mockUserId,
      folderId: null,
      title: null,
      content: mockContent,
      contentEncrypted: true,
      status: 'published',
      moodScore: null,
      weather: {},
      location: {},
      entryDate: testDate,
      createdAt: testDate,
      updatedAt: testDate,
      syncStatus: 'synced',
      syncVersion: 1,
    };

    it('should return decrypted entry from cache if available', async () => {
      mockCache.getCachedJournalEntry.mockResolvedValue({
        ...expectedEntry,
        content: mockEncryptedContent,
      });

      const result = await repository.findById(mockEntryId);

      expect(result).toEqual(expectedEntry);
      expect(mockEncryption.decrypt).toHaveBeenCalledWith(mockUserId, mockEncryptedContent);
      expect(mockPool.query).not.toHaveBeenCalled();
    });

    it('should fetch and decrypt entry from database if not in cache', async () => {
      mockCache.getCachedJournalEntry.mockResolvedValue(null);
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockDbRow] } as QueryResult);

      const result = await repository.findById(mockEntryId);

      expect(result).toEqual(expectedEntry);
      expect(mockEncryption.decrypt).toHaveBeenCalledWith(mockUserId, mockEncryptedContent);
      expect(mockCache.cacheJournalEntry).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    const newEntry = {
      userId: mockUserId,
      content: mockContent,
      contentEncrypted: true,
      status: 'draft' as const,
      entryDate: testDate,
      syncStatus: 'pending' as const,
      syncVersion: 1,
    };

    const mockDbRow = {
      id: mockEntryId,
      user_id: mockUserId,
      folder_id: null,
      title: null,
      content: mockEncryptedContent,
      content_encrypted: true,
      status: 'draft',
      mood_score: null,
      weather: '{}',
      location: '{}',
      entry_date: testDate,
      created_at: testDate,
      updated_at: testDate,
      sync_status: 'pending',
      sync_version: 1,
    };

    it('should encrypt content before storing', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockDbRow] } as QueryResult);

      const result = await repository.create(newEntry);

      expect(mockEncryption.encrypt).toHaveBeenCalledWith(mockUserId, mockContent);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([mockUserId, null, null, mockEncryptedContent])
      );
      expect(result.content).toBe(mockContent);
    });
  });

  describe('update', () => {
    const existingDbRow = {
      id: mockEntryId,
      user_id: mockUserId,
      folder_id: null,
      title: null,
      content: mockEncryptedContent,
      content_encrypted: true,
      status: 'draft',
      mood_score: null,
      weather: '{}',
      location: '{}',
      entry_date: testDate,
      created_at: testDate,
      updated_at: testDate,
      sync_status: 'pending',
      sync_version: 1,
    };

    it('should encrypt updated content', async () => {
      const updateData = {
        content: 'Updated content',
        status: 'published' as const,
      };

      const updatedEncryptedContent = 'encrypted:Updated content';
      const updatedDbRow = {
        ...existingDbRow,
        content: updatedEncryptedContent,
        status: updateData.status,
        sync_version: 2,
      };

      (mockPool.query as jest.Mock).mockImplementation(
        async query =>
          ({
            rows: query.includes('SELECT') ? [existingDbRow] : [updatedDbRow],
          } as QueryResult)
      );

      const result = await repository.update(mockEntryId, updateData);

      expect(mockEncryption.encrypt).toHaveBeenCalledWith(mockUserId, updateData.content);
      expect(result.content).toBe(updateData.content);
      expect(mockCache.invalidateUserCache).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('findByUserId', () => {
    const mockDbRows = [
      {
        id: mockEntryId,
        user_id: mockUserId,
        folder_id: null,
        title: null,
        content: mockEncryptedContent,
        content_encrypted: true,
        status: 'published',
        mood_score: null,
        weather: '{}',
        location: '{}',
        entry_date: testDate,
        created_at: testDate,
        updated_at: testDate,
        sync_status: 'synced',
        sync_version: 1,
      },
    ];

    const expectedEntries = [
      {
        id: mockEntryId,
        userId: mockUserId,
        folderId: null,
        title: null,
        content: mockContent,
        contentEncrypted: true,
        status: 'published',
        moodScore: null,
        weather: {},
        location: {},
        entryDate: testDate,
        createdAt: testDate,
        updatedAt: testDate,
        syncStatus: 'synced',
        syncVersion: 1,
      },
    ];

    it('should return decrypted entries from cache if available', async () => {
      mockCache.getCachedUserEntries.mockResolvedValue(
        expectedEntries.map(entry => ({ ...entry, content: mockEncryptedContent }))
      );

      const result = await repository.findByUserId(mockUserId);

      expect(result).toEqual(expectedEntries);
      expect(mockEncryption.decrypt).toHaveBeenCalledWith(mockUserId, mockEncryptedContent);
      expect(mockPool.query).not.toHaveBeenCalled();
    });

    it('should fetch and decrypt entries from database if not in cache', async () => {
      mockCache.getCachedUserEntries.mockResolvedValue(null);
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockDbRows });

      const result = await repository.findByUserId(mockUserId);

      expect(result).toEqual(expectedEntries);
      expect(mockEncryption.decrypt).toHaveBeenCalledWith(mockUserId, mockEncryptedContent);
      expect(mockCache.cacheUserEntries).toHaveBeenCalled();
    });

    it('should handle decryption errors gracefully', async () => {
      mockCache.getCachedUserEntries.mockResolvedValue(null);
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockDbRows });
      mockEncryption.decrypt.mockRejectedValue(new Error('Decryption failed'));

      await expect(repository.findByUserId(mockUserId)).rejects.toThrow('Decryption failed');
    });
  });

  describe('error handling', () => {
    it('should handle create errors gracefully', async () => {
      const newEntry = {
        userId: mockUserId,
        content: mockContent,
        contentEncrypted: true,
        status: 'draft' as const,
        entryDate: testDate,
        syncStatus: 'pending' as const,
        syncVersion: 1,
      };

      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(repository.create(newEntry)).rejects.toThrow('Database error');
    });

    it('should handle encryption errors during create', async () => {
      const newEntry = {
        userId: mockUserId,
        content: mockContent,
        contentEncrypted: true,
        status: 'draft' as const,
        entryDate: testDate,
        syncStatus: 'pending' as const,
        syncVersion: 1,
      };

      mockEncryption.encrypt.mockRejectedValue(new Error('Encryption failed'));

      await expect(repository.create(newEntry)).rejects.toThrow('Encryption failed');
    });

    it('should handle delete when entry does not exist', async () => {
      mockCache.getCachedJournalEntry.mockResolvedValue(null);
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      await repository.delete(mockEntryId);

      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should handle delete errors gracefully', async () => {
      mockCache.getCachedJournalEntry.mockResolvedValue({
        id: mockEntryId,
        userId: mockUserId,
        contentEncrypted: false,
      });
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      await expect(repository.delete(mockEntryId)).rejects.toThrow('Delete failed');
    });
  });
});
