import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { DataSource, Repository, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { Logger } from 'winston';
import { SyncService } from '../SyncService';
import { testDb } from '../../../__tests__/setup';
import { logger } from '../../../__tests__/mocks/logger.mock';

interface MockEntity {
  id: string;
  userId: string;
  syncVersion: number;
  syncStatus: string;
  updatedAt: Date;
  content?: string;
}

interface MockEntityTarget {
  type: MockEntity;
  name: string;
}

type MockManager = Record<string, unknown>;
type MockMetadata = Record<string, unknown>;

type MockRepository<T extends ObjectLiteral> = Partial<Repository<T>> & {
  find: jest.Mock<Promise<T[]>, []>;
  findOne: jest.Mock<Promise<T | null>, []>;
  save: jest.Mock<Promise<T>, [T]>;
  target: MockEntityTarget & ObjectLiteral;
  manager: MockManager;
  metadata: MockMetadata;
  createQueryBuilder: jest.Mock<SelectQueryBuilder<T>, []>;
};

describe('SyncService', () => {
  let syncService: SyncService;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockSyncMetadataRepo: jest.Mocked<Repository<SyncMetadata>>;

  beforeEach(() => {
    mockSyncMetadataRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
    } as unknown as jest.Mocked<Repository<SyncMetadata>>;

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockSyncMetadataRepo),
      transaction: jest.fn((cb: (ds: DataSource) => Promise<any>) => cb(mockDataSource)),
    } as unknown as jest.Mocked<DataSource>;

    syncService = new SyncService(logger as unknown as Logger, mockDataSource);
  });

  describe('initializeDevice', () => {
    it('should return existing metadata if found', async () => {
      const mockMetadata: SyncMetadata = {
        id: '123',
        userId: 'user1',
        deviceId: 'device1',
        lastSyncAt: new Date(),
        syncStatus: 'synced' as SyncStatus,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSyncMetadataRepo.findOne.mockResolvedValueOnce(mockMetadata);

      const result = await syncService.initializeDevice('user1', 'device1');
      expect(result).toEqual(mockMetadata);
      expect(mockSyncMetadataRepo.save).not.toHaveBeenCalled();
    });

    it('should create new metadata if not found', async () => {
      mockSyncMetadataRepo.findOne.mockResolvedValueOnce(null);
      mockSyncMetadataRepo.save.mockImplementationOnce(async (data) => ({
        id: '123',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as SyncMetadata));

      const result = await syncService.initializeDevice('user1', 'device1');
      expect(result).toMatchObject({
        userId: 'user1',
        deviceId: 'device1',
        syncStatus: 'synced',
        metadata: {},
      });
      expect(mockSyncMetadataRepo.save).toHaveBeenCalled();
    });
  });

  describe('getChanges', () => {
    it('should return changes for modified entities', async () => {
      const mockEntities: MockEntity[] = [
        {
          id: '1',
          userId: 'user1',
          syncVersion: 1,
          syncStatus: 'pending',
          updatedAt: new Date(),
        },
        {
          id: '2',
          userId: 'user1',
          syncVersion: 2,
          syncStatus: 'pending',
          updatedAt: new Date(),
        },
      ];

      const mockEntityRepo = {
        find: jest.fn<Promise<MockEntity[]>>().mockResolvedValue(mockEntities),
        findOne: jest.fn<Promise<MockEntity | null>>(),
        save: jest.fn<Promise<MockEntity>>(),
        target: {
          type: {} as MockEntity,
          name: 'mock_entity',
        } as MockEntityTarget & ObjectLiteral,
        manager: {} as any,
        metadata: {} as any,
        createQueryBuilder: jest.fn<SelectQueryBuilder<MockEntity>>(),
      } as unknown as Repository<MockEntity>;

      mockDataSource.getRepository.mockReturnValue(mockEntityRepo);

      const lastSyncAt = new Date(Date.now() - 3600000); // 1 hour ago
      const result = await syncService.getChanges('user1', 'device1', lastSyncAt);

      expect(result).toHaveLength(8); // 2 entities * 4 entity types
      expect(mockEntityRepo.find).toHaveBeenCalledWith({
        where: [
          { userId: 'user1', updatedAt: { $gt: lastSyncAt } },
          { userId: 'user1', syncStatus: 'pending' },
        ],
      });
    });

    it('should filter by included types', async () => {
      const mockEntities: MockEntity[] = [{
        id: '1',
        userId: 'user1',
        syncVersion: 1,
        syncStatus: 'pending',
        updatedAt: new Date(),
      }];

      const mockEntityRepo = {
        find: jest.fn().mockResolvedValue(mockEntities),
      } as unknown as Repository<MockEntity>;

      mockDataSource.getRepository.mockReturnValue(mockEntityRepo);

      const lastSyncAt = new Date(Date.now() - 3600000);
      const result = await syncService.getChanges('user1', 'device1', lastSyncAt, {
        includeTypes: ['journal_entry'],
      });

      expect(result).toHaveLength(1);
      expect(mockDataSource.getRepository).toHaveBeenCalledWith('journal_entry');
    });
  });

  describe('applyChanges', () => {
    it('should handle conflicts correctly', async () => {
      const mockExistingEntity: MockEntity = {
        id: '1',
        userId: 'user1',
        syncVersion: 2,
        syncStatus: 'synced',
        updatedAt: new Date(),
      };

      const mockEntityRepo = {
        findOne: jest.fn<Promise<MockEntity | null>>().mockResolvedValue(mockExistingEntity),
        find: jest.fn<Promise<MockEntity[]>>(),
        save: jest.fn<Promise<MockEntity>>(),
        target: {
          type: {} as MockEntity,
          name: 'mock_entity',
        } as MockEntityTarget & ObjectLiteral,
        manager: {} as any,
        metadata: {} as any,
        createQueryBuilder: jest.fn<SelectQueryBuilder<MockEntity>>(),
      } as unknown as Repository<MockEntity>;

      mockDataSource.getRepository.mockReturnValue(mockEntityRepo);
      mockDataSource.transaction.mockImplementation(cb => cb(mockDataSource));

      const changes = [
        {
          entityType: 'journal_entry' as const,
          entityId: '1',
          operation: 'update' as const,
          version: 1,
          timestamp: new Date(),
          deviceId: 'device1',
          data: { content: 'updated' },
        },
      ];

      const result = await syncService.applyChanges('user1', 'device1', changes);

      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts![0]).toMatchObject({
        entityType: 'journal_entry',
        entityId: '1',
        serverVersion: 2,
        clientVersion: 1,
      });
      expect(mockEntityRepo.save).not.toHaveBeenCalled();
    });

    it('should update entities successfully', async () => {
      const mockExistingEntity: MockEntity = {
        id: '1',
        userId: 'user1',
        syncVersion: 1,
        syncStatus: 'synced',
        updatedAt: new Date(),
      };

      const mockEntityRepo = {
        findOne: jest.fn<Promise<MockEntity | null>>().mockResolvedValue(mockExistingEntity),
        save: jest.fn<Promise<MockEntity>>().mockImplementation((data: MockEntity) =>
          Promise.resolve({
            ...data,
            updatedAt: new Date(),
          })
        ),
        find: jest.fn<Promise<MockEntity[]>>(),
        target: {
          type: {} as MockEntity,
          name: 'mock_entity',
        } as MockEntityTarget & ObjectLiteral,
        manager: {} as any,
        metadata: {} as any,
        createQueryBuilder: jest.fn<SelectQueryBuilder<MockEntity>>(),
      } as unknown as Repository<MockEntity>;

      mockDataSource.getRepository.mockReturnValue(mockEntityRepo);
      mockDataSource.transaction.mockImplementation(cb => cb(mockDataSource));

      const changes = [
        {
          entityType: 'journal_entry' as const,
          entityId: '1',
          operation: 'update' as const,
          version: 1,
          timestamp: new Date(),
          deviceId: 'device1',
          data: { content: 'updated' },
        },
      ];

      const result = await syncService.applyChanges('user1', 'device1', changes);

      expect(result.conflicts).toHaveLength(0);
      expect(result.syncedEntities).toHaveLength(1);
      expect(mockEntityRepo.save).toHaveBeenCalled();
      expect(mockSyncMetadataRepo.update).toHaveBeenCalled();
    });
  });

  describe('resolveConflicts', () => {
    it('should handle manual resolution correctly', async () => {
      const mockEntity: MockEntity = {
        id: '1',
        userId: 'user1',
        syncVersion: 2,
        syncStatus: 'conflict',
        updatedAt: new Date(),
      };

      const mockEntityRepo = {
        findOne: jest.fn<Promise<MockEntity | null>>().mockResolvedValue(mockEntity),
        save: jest.fn<Promise<MockEntity>>().mockImplementation((data: MockEntity) =>
          Promise.resolve({
            ...data,
            updatedAt: new Date(),
          })
        ),
        find: jest.fn<Promise<MockEntity[]>>().mockResolvedValue([]),
        target: {
          type: {} as MockEntity,
          name: 'mock_entity',
        } as MockEntityTarget & ObjectLiteral,
        manager: {} as any,
        metadata: {} as any,
        createQueryBuilder: jest.fn<SelectQueryBuilder<MockEntity>>(),
      } as unknown as Repository<MockEntity>;

      mockDataSource.getRepository.mockReturnValue(mockEntityRepo);
      mockDataSource.transaction.mockImplementation(cb => cb(mockDataSource));

      const resolutions = [
        {
          entityType: 'journal_entry',
          entityId: '1',
          resolution: 'manual_required' as const,
          manualData: { content: 'manually resolved' },
        },
      ];

      const result = await syncService.resolveConflicts('user1', 'device1', resolutions);

      expect(result.success).toBe(true);
      expect(result.syncedEntities).toHaveLength(1);
      expect(mockEntityRepo.save).toHaveBeenCalled();
      expect(mockSyncMetadataRepo.update).toHaveBeenCalled();
    });

    it('should handle missing entities', async () => {
      const mockEntityRepo = {
        findOne: jest.fn<Promise<MockEntity | null>>().mockResolvedValue(null),
        find: jest.fn<Promise<MockEntity[]>>().mockResolvedValue([]),
        save: jest.fn<Promise<MockEntity>>(),
        target: {
          type: {} as MockEntity,
          name: 'mock_entity',
        } as MockEntityTarget & ObjectLiteral,
        manager: {} as any,
        metadata: {} as any,
        createQueryBuilder: jest.fn<SelectQueryBuilder<MockEntity>>(),
      } as unknown as Repository<MockEntity>;

      mockDataSource.getRepository.mockReturnValue(mockEntityRepo);
      mockDataSource.transaction.mockImplementation(cb => cb(mockDataSource));

      const resolutions = [
        {
          entityType: 'journal_entry',
          entityId: '1',
          resolution: 'manual_required' as const,
          manualData: { content: 'manually resolved' },
        },
      ];

      const result = await syncService.resolveConflicts('user1', 'device1', resolutions);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].error).toBe('Entity not found');
    });
  });
});
