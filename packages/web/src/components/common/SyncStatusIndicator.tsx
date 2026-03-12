import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface SyncStatusIndicatorProps {
  style?: React.CSSProperties;
  onSyncClick?: () => void;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ style, onSyncClick }) => {
  const { cloudStorage, syncToCloud, authProvider } = useAuth();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Load last sync time from storage
    const saved = localStorage.getItem('lastSyncTime');
    if (saved) {
      setLastSync(new Date(saved));
    }
  }, []);

  const handleSync = async () => {
    if (!cloudStorage || !cloudStorage.isAvailable()) return;

    setSyncStatus('syncing');
    try {
      await syncToCloud();
      setSyncStatus('synced');
      const now = new Date();
      setLastSync(now);
      localStorage.setItem('lastSyncTime', now.toISOString());

      // Reset to idle after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return '🗄️';
      case 'apple':
        return '☁️';
      case 'microsoft':
        return '📁';
      case 'dropbox':
        return '📦';
      default:
        return '💾';
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return '🔄';
      case 'synced':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⬆️';
    }
  };

  const getStatusText = () => {
    if (!cloudStorage || !cloudStorage.isAvailable()) {
      return 'Local only';
    }

    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'synced':
        return 'Synced';
      case 'error':
        return 'Sync failed';
      default:
        return lastSync ? `Last sync: ${lastSync.toLocaleTimeString()}` : 'Not synced';
    }
  };

  const getStorageProviderText = () => {
    if (!cloudStorage || !cloudStorage.isAvailable()) {
      return 'Local Storage';
    }

    const provider = cloudStorage.getProvider();
    switch (provider) {
      case 'google-drive':
        return 'Google Drive';
      case 'icloud':
        return 'iCloud';
      case 'onedrive':
        return 'OneDrive';
      case 'dropbox':
        return 'Dropbox';
      default:
        return 'Cloud Storage';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 12px',
        backgroundColor: 'rgba(248, 249, 250, 0.8)',
        border: '1px solid rgba(233, 236, 239, 0.6)',
        borderRadius: 12,
        fontSize: 12,
        color: '#666',
        cursor: cloudStorage?.isAvailable() ? 'pointer' : 'default',
        height: 40, // Match all other buttons
        minHeight: 40,
        backdropFilter: 'blur(4px)',
        ...style,
      }}
      onClick={cloudStorage?.isAvailable() ? onSyncClick || handleSync : undefined}
      title={cloudStorage?.isAvailable() ? 'Click to sync now' : 'Local storage only'}
    >
      <span>{getProviderIcon(authProvider)}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontWeight: 500 }}>{getStorageProviderText()}</div>
        <div
          style={{
            fontSize: 11,
            color:
              syncStatus === 'error' ? '#dc3545' : syncStatus === 'synced' ? '#28a745' : '#666',
          }}
        >
          {getStatusIcon()} {getStatusText()}
        </div>
      </div>
      {cloudStorage?.isAvailable() && syncStatus === 'idle' && (
        <button
          style={{
            background: 'none',
            border: 'none',
            fontSize: 12,
            color: '#007bff',
            cursor: 'pointer',
            marginLeft: 4,
          }}
          onClick={e => {
            e.stopPropagation();
            handleSync();
          }}
        >
          Sync
        </button>
      )}
    </div>
  );
};
