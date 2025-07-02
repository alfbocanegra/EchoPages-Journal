import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
    fetch.mockClear();
  });

  describe('Authentication Flow', () => {
    it('should handle Google OAuth flow', async () => {
      // Mock successful OAuth response
      const mockOAuthResponse = {
        type: 'success',
        params: {
          access_token: 'mock-google-token',
        },
      };

      // Mock user info API response
      const mockUserInfo = {
        id: 'google-user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      // Mock backend sync response
      const mockSyncResponse = {
        success: true,
        newVersion: 1,
        entries: [
          {
            id: '1',
            title: 'Synced Entry',
            content: 'This entry was synced from the cloud',
            date: '2025-06-01',
          },
        ],
      };

      // Setup fetch mocks
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUserInfo,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSyncResponse,
        });

      // Simulate OAuth flow
      const handleGoogleSignIn = async () => {
        // 1. Get OAuth response (mocked)
        const oauthResponse = mockOAuthResponse;

        if (oauthResponse.type === 'success' && oauthResponse.params.access_token) {
          // 2. Fetch user info
          const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: { Authorization: `Bearer ${oauthResponse.params.access_token}` },
          });
          const userInfo = await userInfoResponse.json();

          // 3. Save auth state
          const authState = {
            provider: 'google',
            token: oauthResponse.params.access_token,
            user: userInfo,
          };

          await SecureStore.setItemAsync('authState', JSON.stringify(authState));

          // 4. Sync with backend
          const syncResponse = await fetch('http://localhost:3000/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${oauthResponse.params.access_token}`,
            },
            body: JSON.stringify({
              deviceId: 'test-device',
              provider: 'google',
              changes: [],
            }),
          });

          const syncData = await syncResponse.json();

          return { userInfo, syncData };
        }

        throw new Error('OAuth failed');
      };

      // Execute the flow
      const result = await handleGoogleSignIn();

      // Verify the flow
      expect(result.userInfo).toEqual(mockUserInfo);
      expect(result.syncData).toEqual(mockSyncResponse);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'authState',
        JSON.stringify({
          provider: 'google',
          token: 'mock-google-token',
          user: mockUserInfo,
        })
      );
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle authentication errors gracefully', async () => {
      // Mock failed OAuth response
      const mockOAuthResponse = {
        type: 'error',
        error: 'access_denied',
      };

      const handleGoogleSignIn = async () => {
        const oauthResponse = mockOAuthResponse;

        if (oauthResponse.type === 'success') {
          // This should not be reached
          return { success: true };
        } else {
          throw new Error(`OAuth failed: ${oauthResponse.error}`);
        }
      };

      // Execute and expect error
      await expect(handleGoogleSignIn()).rejects.toThrow('OAuth failed: access_denied');
    });
  });

  describe('Data Synchronization', () => {
    it('should sync local entries with backend', async () => {
      // Mock local entries
      const localEntries = [
        {
          id: 'local-1',
          title: 'Local Entry 1',
          content: 'This is a local entry',
          date: '2025-06-01',
          tags: ['local'],
          mood: '😊',
        },
        {
          id: 'local-2',
          title: 'Local Entry 2',
          content: 'Another local entry',
          date: '2025-06-02',
          tags: ['local'],
          mood: '😌',
        },
      ];

      // Mock backend sync response
      const mockSyncResponse = {
        success: true,
        newVersion: 2,
        entries: [
          ...localEntries,
          {
            id: 'remote-1',
            title: 'Remote Entry',
            content: 'This came from the cloud',
            date: '2025-06-03',
            tags: ['remote'],
            mood: '🎨',
          },
        ],
        conflicts: [],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSyncResponse,
      });

      // Mock auth state
      SecureStore.getItemAsync.mockResolvedValueOnce(
        JSON.stringify({
          provider: 'google',
          token: 'mock-token',
          user: { id: 'user-123', email: 'test@example.com' },
        })
      );

      const syncWithBackend = async () => {
        // 1. Get auth state
        const authStateStr = await SecureStore.getItemAsync('authState');
        const authState = JSON.parse(authStateStr);

        if (!authState || !authState.token) {
          throw new Error('Not authenticated');
        }

        // 2. Prepare sync data
        const syncData = {
          deviceId: 'test-device',
          provider: authState.provider,
          changes: localEntries.map(entry => ({
            type: 'create',
            entityType: 'journal_entry',
            entityId: entry.id,
            data: entry,
            timestamp: Date.now(),
          })),
        };

        // 3. Send to backend
        const response = await fetch('http://localhost:3000/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authState.token}`,
          },
          body: JSON.stringify(syncData),
        });

        if (!response.ok) {
          throw new Error('Sync failed');
        }

        const result = await response.json();

        // 4. Update local storage with synced data
        await AsyncStorage.setItem('journalEntries', JSON.stringify(result.entries));

        return result;
      };

      // Execute sync
      const result = await syncWithBackend();

      // Verify sync
      expect(result.success).toBe(true);
      expect(result.entries).toHaveLength(3);
      expect(result.newVersion).toBe(2);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/sync',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token',
          }),
          body: expect.stringContaining('test-device'),
        })
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'journalEntries',
        JSON.stringify(result.entries)
      );
    });

    it('should handle sync conflicts', async () => {
      // Mock conflict response
      const mockConflictResponse = {
        success: false,
        conflicts: [
          {
            entityId: 'conflict-1',
            localVersion: { title: 'Local Title', content: 'Local content' },
            remoteVersion: { title: 'Remote Title', content: 'Remote content' },
            timestamp: Date.now(),
          },
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConflictResponse,
      });

      SecureStore.getItemAsync.mockResolvedValueOnce(
        JSON.stringify({
          provider: 'google',
          token: 'mock-token',
        })
      );

      const syncWithBackend = async () => {
        const authStateStr = await SecureStore.getItemAsync('authState');
        const authState = JSON.parse(authStateStr);

        const response = await fetch('http://localhost:3000/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authState.token}`,
          },
          body: JSON.stringify({
            deviceId: 'test-device',
            provider: authState.provider,
            changes: [],
          }),
        });

        return await response.json();
      };

      const result = await syncWithBackend();

      expect(result.success).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].entityId).toBe('conflict-1');
    });

    it('should handle network errors during sync', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      SecureStore.getItemAsync.mockResolvedValueOnce(
        JSON.stringify({
          provider: 'google',
          token: 'mock-token',
        })
      );

      const syncWithBackend = async () => {
        const authStateStr = await SecureStore.getItemAsync('authState');
        const authState = JSON.parse(authStateStr);

        try {
          const response = await fetch('http://localhost:3000/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authState.token}`,
            },
            body: JSON.stringify({
              deviceId: 'test-device',
              provider: authState.provider,
              changes: [],
            }),
          });

          return await response.json();
        } catch (error) {
          return { success: false, error: error.message };
        }
      };

      const result = await syncWithBackend();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('Data Persistence and Recovery', () => {
    it('should recover from app restart with persisted data', async () => {
      // Mock persisted data
      const persistedEntries = [
        {
          id: 'persisted-1',
          title: 'Persisted Entry',
          content: 'This entry survived app restart',
          date: '2025-06-01',
        },
      ];

      const persistedAuthState = {
        provider: 'google',
        token: 'persisted-token',
        user: { id: 'user-123', email: 'test@example.com' },
      };

      // Setup mocks
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(persistedEntries));
      SecureStore.getItemAsync.mockResolvedValueOnce(JSON.stringify(persistedAuthState));

      const recoverAppState = async () => {
        // 1. Recover entries
        const entriesStr = await AsyncStorage.getItem('journalEntries');
        const entries = entriesStr ? JSON.parse(entriesStr) : [];

        // 2. Recover auth state
        const authStateStr = await SecureStore.getItemAsync('authState');
        const authState = authStateStr ? JSON.parse(authStateStr) : null;

        return { entries, authState };
      };

      const recoveredState = await recoverAppState();

      expect(recoveredState.entries).toEqual(persistedEntries);
      expect(recoveredState.authState).toEqual(persistedAuthState);
    });

    it('should handle missing persisted data gracefully', async () => {
      // Mock missing data
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      SecureStore.getItemAsync.mockResolvedValueOnce(null);

      const recoverAppState = async () => {
        const entriesStr = await AsyncStorage.getItem('journalEntries');
        const entries = entriesStr ? JSON.parse(entriesStr) : [];

        const authStateStr = await SecureStore.getItemAsync('authState');
        const authState = authStateStr ? JSON.parse(authStateStr) : null;

        return { entries, authState };
      };

      const recoveredState = await recoverAppState();

      expect(recoveredState.entries).toEqual([]);
      expect(recoveredState.authState).toBeNull();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed JSON in storage', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce('invalid-json');
      SecureStore.getItemAsync.mockResolvedValueOnce('also-invalid');

      const safeGetData = async () => {
        try {
          const entriesStr = await AsyncStorage.getItem('journalEntries');
          const entries = entriesStr ? JSON.parse(entriesStr) : [];
          return entries;
        } catch (error) {
          return [];
        }
      };

      const safeGetAuth = async () => {
        try {
          const authStateStr = await SecureStore.getItemAsync('authState');
          const authState = authStateStr ? JSON.parse(authStateStr) : null;
          return authState;
        } catch (error) {
          return null;
        }
      };

      const entries = await safeGetData();
      const authState = await safeGetAuth();

      expect(entries).toEqual([]);
      expect(authState).toBeNull();
    });

    it('should handle expired tokens', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Token expired' }),
      });

      SecureStore.getItemAsync.mockResolvedValueOnce(
        JSON.stringify({
          provider: 'google',
          token: 'expired-token',
        })
      );

      const syncWithBackend = async () => {
        const authStateStr = await SecureStore.getItemAsync('authState');
        const authState = JSON.parse(authStateStr);

        const response = await fetch('http://localhost:3000/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authState.token}`,
          },
          body: JSON.stringify({
            deviceId: 'test-device',
            provider: authState.provider,
            changes: [],
          }),
        });

        if (response.status === 401) {
          // Clear auth state on token expiration
          await SecureStore.deleteItemAsync('authState');
          throw new Error('Authentication required');
        }

        return await response.json();
      };

      await expect(syncWithBackend()).rejects.toThrow('Authentication required');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('authState');
    });
  });
});
