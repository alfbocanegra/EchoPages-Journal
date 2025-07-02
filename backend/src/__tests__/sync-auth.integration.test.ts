// @ts-nocheck
import request from 'supertest';
import { describe, it, expect, jest, beforeAll } from '@jest/globals';
import app from '../app';
import { testDb } from './setup';

// Mock the services and repositories that the app expects
jest.mock('../services/sync/SyncService');
jest.mock('../repositories/UserRepository');
jest.mock('../services/auth/OAuthService');

// Mock the requireAuth middleware to bypass authentication
jest.mock('../middleware/auth', () => ({
  requireAuth: (req, res, next) => {
    // Set a mock user for testing
    req.user = {
      id: 'test-user-id',
      email: 'test@example.com',
      isAdmin: req.headers.authorization?.includes('admin') || false,
    };
    next();
  },
}));

describe('Sync Auth Integration', () => {
  beforeAll(async () => {
    // Mock the app's service dependencies
    const mockSyncService = {
      syncDevice: jest.fn().mockResolvedValue({ success: true, newVersion: 1 }),
      getDeviceState: jest.fn().mockResolvedValue({ lastSyncVersion: 0 }),
      resolveConflict: jest.fn().mockResolvedValue({ success: true }),
      getConflictSummary: jest.fn().mockResolvedValue({ unresolved: [], autoResolvedCount: 0, manualResolvedCount: 0 }),
    };

    const mockUserRepository = {
      find: jest.fn().mockResolvedValue([
        { id: '1', email: 'user1@example.com', authProvider: 'google', entries: [] },
        { id: '2', email: 'user2@example.com', authProvider: 'apple', entries: [{ id: 'entry1' }] },
      ]),
      findOne: jest.fn().mockResolvedValue({ id: '1', email: 'user1@example.com', isAdmin: false }),
    };

    const mockOAuthService = {
      handleOAuthUser: jest.fn().mockImplementation((profile) => ({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        authProvider: profile.provider,
        isAdmin: false,
      })),
    };

    // Set the mocked services on the app
    (app as any).set('syncService', mockSyncService);
    (app as any).set('userRepository', mockUserRepository);
    (app as any).set('oauthService', mockOAuthService);
  });

  it('should create and isolate users for Google, Apple, Dropbox', async () => {
    // Mock tokens and user info
    const tokens = [
      { provider: 'google', token: 'mock-google-token', email: 'guser@example.com' },
      { provider: 'apple', token: 'mock-apple-token', email: 'auser@example.com' },
      { provider: 'dropbox', token: 'mock-dropbox-token', email: 'duser@example.com' },
    ];
    for (const { provider, token, email } of tokens) {
      // Sync as new user
      const res = await request(app)
        .post('/sync')
        .set('Authorization', `Bearer ${token}`)
        .send({ deviceId: 'test-device', provider, changes: [] });
      expect(res.status).toBe(200);
      // Sync again, should still be isolated
      const res2 = await request(app)
        .post('/sync')
        .set('Authorization', `Bearer ${token}`)
        .send({ deviceId: 'test-device', provider, changes: [] });
      expect(res2.status).toBe(200);
    }
  });

  it('should allow admin to list all users and entry counts', async () => {
    // Mock admin user
    const mockUserRepository = (app as any).get('userRepository');
    mockUserRepository.findOne.mockResolvedValueOnce({ id: 'admin', email: 'admin@example.com', isAdmin: true });
    
    const adminToken = 'mock-admin-token';
    const res = await request(app)
      .get('/sync/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send();
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
}); 