import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import Redis from 'ioredis';
import { RedisCacheService } from './redis.service';

// Mock ioredis
jest.mock('ioredis');

describe('RedisCacheService', () => {
  let redisCacheService: RedisCacheService;
  let mockRedis: jest.Mocked<Redis>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a new instance for each test
    redisCacheService = new RedisCacheService();
    mockRedis = (Redis as jest.MockedClass<typeof Redis>).mock.instances[0] as jest.Mocked<Redis>;
  });

  describe('User caching', () => {
    const mockUserId = 'test-user-id';
    const mockUserData = {
      id: mockUserId,
      email: 'test@example.com',
      username: 'testuser',
    };

    it('should cache user data', async () => {
      await redisCacheService.cacheUser(mockUserId, mockUserData);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        `user:${mockUserId}`,
        3600,
        JSON.stringify(mockUserData)
      );
    });

    it('should retrieve cached user data', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(mockUserData));

      const result = await redisCacheService.getCachedUser(mockUserId);

      expect(mockRedis.get).toHaveBeenCalledWith(`user:${mockUserId}`);
      expect(result).toEqual(mockUserData);
    });

    it('should return null for non-existent user cache', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await redisCacheService.getCachedUser(mockUserId);

      expect(mockRedis.get).toHaveBeenCalledWith(`user:${mockUserId}`);
      expect(result).toBeNull();
    });
  });

  describe('Journal entry caching', () => {
    const mockEntryId = 'test-entry-id';
    const mockEntryData = {
      id: mockEntryId,
      title: 'Test Entry',
      content: 'Test content',
    };

    it('should cache journal entry data', async () => {
      await redisCacheService.cacheJournalEntry(mockEntryId, mockEntryData);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        `entry:${mockEntryId}`,
        1800,
        JSON.stringify(mockEntryData)
      );
    });

    it('should retrieve cached journal entry data', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(mockEntryData));

      const result = await redisCacheService.getCachedJournalEntry(mockEntryId);

      expect(mockRedis.get).toHaveBeenCalledWith(`entry:${mockEntryId}`);
      expect(result).toEqual(mockEntryData);
    });
  });

  describe('Cache invalidation', () => {
    const mockUserId = 'test-user-id';
    const mockEntryId = 'test-entry-id';

    it('should invalidate user cache and related data', async () => {
      await redisCacheService.invalidateUserCache(mockUserId);

      expect(mockRedis.del).toHaveBeenCalledWith(
        `user:${mockUserId}`,
        `user:${mockUserId}:entries`,
        `user:${mockUserId}:folders`,
        `user:${mockUserId}:tags`
      );
    });

    it('should invalidate journal entry cache', async () => {
      await redisCacheService.invalidateJournalEntryCache(mockEntryId, mockUserId);

      expect(mockRedis.del).toHaveBeenCalledWith(
        `entry:${mockEntryId}`,
        `user:${mockUserId}:entries`
      );
    });
  });

  describe('Health check', () => {
    it('should return true when Redis is healthy', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      const result = await redisCacheService.isHealthy();

      expect(result).toBe(true);
      expect(mockRedis.ping).toHaveBeenCalled();
    });

    it('should return false when Redis is unhealthy', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection failed'));

      const result = await redisCacheService.isHealthy();

      expect(result).toBe(false);
      expect(mockRedis.ping).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should disconnect from Redis', async () => {
      await redisCacheService.disconnect();

      expect(mockRedis.quit).toHaveBeenCalled();
    });
  });
});
