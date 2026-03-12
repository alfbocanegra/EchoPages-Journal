import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { SyncService } from '../SyncService';
import { Logger } from 'winston';
import { SyncOptions, EntityType, ChangeType } from '../../../types/sync';

const mockLogger: Logger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
} as any;

describe('SyncService', () => {
  let syncService: SyncService;
  let mockPgPool: any;

  beforeEach(() => {
    mockPgPool = {
      query: jest.fn(),
    };
    syncService = new SyncService(mockPgPool, null, mockLogger);
  });

  describe('trackChange', () => {
    it('should call trackChangePg if pgPool is provided', async () => {
      const userId = 'user1';
      const entityType = 'journal_entry' as EntityType;
      const entityId = 'entry1';
      const changeType = 'create' as ChangeType;
      mockPgPool.query.mockResolvedValue({ rows: [{ next_version: 1 }] });
      (syncService as any).trackChangePg = jest.fn();
      const result = await syncService.trackChange(userId, entityType, entityId, changeType);
      expect((syncService as any).trackChangePg).toHaveBeenCalled();
      expect(result.userId).toBe(userId);
      expect(result.entityType).toBe(entityType);
      expect(result.entityId).toBe(entityId);
      expect(result.changeType).toBe(changeType);
    });
  });

  describe('getDeviceState', () => {
    it('should call pgPool.query and map result', async () => {
      const userId = 'user1';
      const deviceId = 'device1';
      const mockRow = {
        id: '1',
        user_id: userId,
        device_id: deviceId,
        last_sync_version: 5,
        last_successful_sync: new Date().toISOString(),
        sync_failures: 0,
        device_metadata: '{}',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockPgPool.query.mockResolvedValue({ rows: [mockRow] });
      const result = await syncService.getDeviceState(userId, deviceId);
      expect(result.userId).toBe(userId);
      expect(result.deviceId).toBe(deviceId);
      expect(result.lastSyncVersion).toBe(5);
    });
  });

  describe('getChangesSinceVersion', () => {
    it('should call pgPool.query and map results', async () => {
      const userId = 'user1';
      const version = 2;
      const batchSize = 10;
      const mockRows = [
        {
          id: 'c1',
          user_id: userId,
          entity_type: 'journal_entry',
          entity_id: 'e1',
          change_type: 'create',
          change_version: 3,
          change_timestamp: new Date().toISOString(),
          change_metadata: '{}',
          is_conflict: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      mockPgPool.query.mockResolvedValue({ rows: mockRows });
      const result = await syncService.getChangesSinceVersion(userId, version, batchSize);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].userId).toBe(userId);
      expect(result[0].entityType).toBe('journal_entry');
    });
  });

  describe('syncDevice', () => {
    it('should return a SyncResult with success true if no conflicts', async () => {
      // Mock getDeviceState, getChangesSinceVersion, detectConflicts, applyChanges, updateDeviceState
      (syncService as any).getDeviceState = jest.fn().mockResolvedValue({ lastSyncVersion: 1 });
      (syncService as any).getChangesSinceVersion = jest.fn().mockResolvedValue([]);
      (syncService as any).detectConflicts = jest.fn().mockResolvedValue([]);
      (syncService as any).applyChanges = jest.fn().mockResolvedValue(undefined);
      (syncService as any).updateDeviceState = jest.fn().mockResolvedValue(2);
      const result = await syncService.syncDevice('user1', 'device1', {} as SyncOptions);
      expect(result.success).toBe(true);
      expect(result.newVersion).toBe(2);
    });
  });
});
