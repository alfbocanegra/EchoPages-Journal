import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getJWT } from '../services/authService';

// Mock the CloudStorageService for web until we implement the full shared package
interface CloudStorageService {
  getProvider(): string;
  initialize(): Promise<boolean>;
  syncJournalData(data: any): Promise<any>;
  downloadJournalData(): Promise<any>;
  setEncryptionKey(key: string): void;
  isAvailable(): boolean;
}

function createMockCloudStorage(authProvider: string): CloudStorageService {
  const provider =
    authProvider.toLowerCase() === 'google'
      ? 'google-drive'
      : authProvider.toLowerCase() === 'apple'
      ? 'icloud'
      : authProvider.toLowerCase() === 'microsoft'
      ? 'onedrive'
      : 'local';

  return {
    getProvider: () => provider,
    initialize: async () => true,
    syncJournalData: async (data: any) => ({
      status: 'synced',
      filesUploaded: 1,
      filesDownloaded: 0,
      errors: [],
      lastSync: new Date(),
    }),
    downloadJournalData: async () => ({}),
    setEncryptionKey: (key: string) => {},
    isAvailable: () => provider !== 'local',
  };
}

interface AuthContextValue {
  jwt: string;
  deviceId: string;
  passphrase: string;
  authProvider: string;
  cloudStorage: CloudStorageService | null;
  setPassphrase: (p: string) => void;
  setJWT: (j: string) => void;
  setAuthProvider: (provider: string) => void;
  isAdmin: boolean;
  setIsAdmin: (a: boolean) => void;
  syncToCloud: () => Promise<void>;
  downloadFromCloud: () => Promise<any>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jwt, setJWT] = useState<string>(() => getJWT() || '');
  const [deviceId] = useState<string>(() => {
    let id = localStorage.getItem('deviceId');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('deviceId', id);
    }
    return id;
  });
  const [passphrase, setPassphrase] = useState<string>('');
  const [authProvider, setAuthProvider] = useState<string>('local');
  const [cloudStorage, setCloudStorage] = useState<CloudStorageService | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    if (!passphrase) {
      // Use a default passphrase for development to avoid blocking the UI
      const defaultPassphrase = 'development-key-123';
      setPassphrase(defaultPassphrase);
      console.log('Using default development passphrase. In production, user would be prompted.');
    }
  }, [passphrase]);

  // Initialize cloud storage when auth provider changes
  useEffect(() => {
    if (authProvider !== 'local') {
      const storage = createMockCloudStorage(authProvider);
      storage.setEncryptionKey(passphrase);
      setCloudStorage(storage);

      // Initialize cloud storage
      storage.initialize().then(success => {
        if (!success) {
          console.warn(`Failed to initialize ${storage.getProvider()} storage`);
        }
      });
    } else {
      setCloudStorage(null);
    }
  }, [authProvider, passphrase]);

  const syncToCloud = async () => {
    if (!cloudStorage || !cloudStorage.isAvailable()) {
      console.log('Cloud storage not available, using local storage only');
      return;
    }

    try {
      // Get local journal data
      const localData = localStorage.getItem('journalEntries');
      if (localData) {
        const result = await cloudStorage.syncJournalData(JSON.parse(localData));
        console.log(
          `Sync completed: ${result.filesUploaded} files uploaded to ${cloudStorage.getProvider()}`
        );
      }
    } catch (error) {
      console.error('Cloud sync failed:', error);
    }
  };

  const downloadFromCloud = async () => {
    if (!cloudStorage || !cloudStorage.isAvailable()) {
      console.log('Cloud storage not available, using local data only');
      return {};
    }

    try {
      const cloudData = await cloudStorage.downloadJournalData();
      console.log(`Downloaded data from ${cloudStorage.getProvider()}`);
      return cloudData;
    } catch (error) {
      console.error('Cloud download failed:', error);
      return {};
    }
  };

  return (
    <AuthContext.Provider
      value={{
        jwt,
        deviceId,
        passphrase,
        authProvider,
        cloudStorage,
        setPassphrase,
        setJWT,
        setAuthProvider,
        isAdmin,
        setIsAdmin,
        syncToCloud,
        downloadFromCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
