import React from 'react';
import ThemeButton from '../common/ThemeButton';
import { useSync } from '../../hooks/useSync';
import { useAuth } from '../../context/AuthContext';

export const SyncStatus: React.FC = () => {
  const { jwt, deviceId, passphrase } = useAuth();
  const {
    status,
    syncError,
    lastSync,
    conflictCount,
    conflicts,
    resolvingId,
    resolveMsg,
    sync,
    resolveConflict,
    syncMetrics,
  } = useSync({ jwt, deviceId, passphrase });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        height: '100%', // Use full height of parent container
        margin: 0, // Remove margin that affects alignment
      }}
      role="status"
      aria-live="polite"
    >
      {syncError && (
        <div
          style={{
            background: '#fff1f0',
            color: '#cf1322',
            border: '1px solid #ffa39e',
            padding: 10,
            borderRadius: 6,
            marginBottom: 8,
            maxWidth: 400,
          }}
          role="alert"
        >
          <b>Sync Error:</b> {syncError}
          <button
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              color: '#cf1322',
              cursor: 'pointer',
            }}
            onClick={() => {}}
            disabled
          >
            ✕
          </button>
        </div>
      )}
      <span>
        {status === 'connected' && <span style={{ color: 'green' }}>● Connected</span>}
        {status === 'syncing' && <span style={{ color: '#888' }}>Syncing...</span>}
        {status === 'synced' && (
          <span style={{ color: 'green' }}>✔ Synced{lastSync ? ` (${lastSync})` : ''}</span>
        )}
        {status === 'error' && <span style={{ color: 'red' }}>Sync Error</span>}
        {status === 'disconnected' && <span style={{ color: '#888' }}>● Disconnected</span>}
        {conflictCount > 0 && (
          <span style={{ color: 'orange', marginLeft: 8 }}>
            ⚠ {conflictCount} conflict{conflictCount > 1 ? 's' : ''}
          </span>
        )}
      </span>
      <ThemeButton
        title={status === 'syncing' ? 'Syncing...' : 'Sync Now'}
        onClick={sync}
        disabled={status === 'syncing' || status === 'disconnected'}
        variant="outline"
        style={{
          minWidth: 100,
          height: 40, // Match all other buttons
          minHeight: 40,
          fontSize: 14,
          padding: '0 16px',
        }}
      />
      {syncMetrics && (
        <div style={{ fontSize: 12, color: '#888', marginTop: 4, marginLeft: 8 }}>
          <b>Server Metrics:</b>
          {` Connections: ${syncMetrics.totalConnections}, Requests: ${syncMetrics.syncRequests}, Updates: ${syncMetrics.syncUpdates}, Errors: ${syncMetrics.syncErrors}, Conflicts: ${syncMetrics.syncConflicts}`}
        </div>
      )}
      {conflicts.length > 0 && (
        <div
          style={{
            marginTop: 16,
            background: '#fffbe6',
            border: '1px solid #ffe58f',
            padding: 12,
            borderRadius: 6,
            maxWidth: 400,
          }}
        >
          <strong>Unresolved Conflicts:</strong>
          {resolveMsg && (
            <div
              style={{ color: resolveMsg.includes('success') ? 'green' : 'red', marginBottom: 8 }}
            >
              {resolveMsg}
            </div>
          )}
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {conflicts.map(conflict => (
              <li key={conflict.id} style={{ marginBottom: 12 }}>
                <div>
                  <b>Conflict ID:</b> {conflict.id}
                </div>
                {conflict.resolutionMetadata && (
                  <>
                    <div>
                      <b>Local:</b>{' '}
                      <pre style={{ background: '#f6f8fa', padding: 4, borderRadius: 4 }}>
                        {JSON.stringify(conflict.resolutionMetadata.local, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <b>Remote:</b>{' '}
                      <pre style={{ background: '#f6f8fa', padding: 4, borderRadius: 4 }}>
                        {JSON.stringify(conflict.resolutionMetadata.remote, null, 2)}
                      </pre>
                    </div>
                  </>
                )}
                <div style={{ marginTop: 4 }}>
                  <button
                    onClick={() => resolveConflict(conflict.id, 'local_wins')}
                    disabled={resolvingId === conflict.id}
                  >
                    {resolvingId === conflict.id ? 'Resolving...' : 'Keep Local'}
                  </button>
                  <button
                    onClick={() => resolveConflict(conflict.id, 'remote_wins')}
                    style={{ marginLeft: 8 }}
                    disabled={resolvingId === conflict.id}
                  >
                    {resolvingId === conflict.id ? 'Resolving...' : 'Keep Remote'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
