import React, { useState, useEffect } from 'react';
import { useSync } from '../../hooks/useSync';
import { useAuth } from '../../context/AuthContext';

interface SyncNotificationBarProps {
  onShowConflicts?: () => void; // Optional callback to show conflict UI
}

export const SyncNotificationBar: React.FC<SyncNotificationBarProps> = ({ onShowConflicts }) => {
  const { jwt, deviceId, passphrase } = useAuth();
  const { status, syncError, conflictCount, resolveMsg } = useSync({ jwt, deviceId, passphrase });
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Auto-dismiss after 5 seconds for normal sync status, but keep visible for errors/conflicts
  useEffect(() => {
    if (status === 'synced' && !syncError && conflictCount === 0 && !resolveMsg) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, syncError, conflictCount, resolveMsg]);

  // Reset visibility when there are important notifications
  useEffect(() => {
    if (syncError || conflictCount > 0 || resolveMsg) {
      setIsVisible(true);
      setIsDismissed(false);
    }
  }, [syncError, conflictCount, resolveMsg]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  // Don't show if dismissed or not visible
  if (!isVisible || isDismissed) {
    return null;
  }

  // Only show for important notifications or active sync states
  const shouldShow = status === 'syncing' || syncError || conflictCount > 0 || resolveMsg;
  if (!shouldShow) {
    return null;
  }

  const getStatusConfig = () => {
    if (syncError) {
      return {
        color: '#ef4444',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        border: '#fecaca',
        icon: '❌',
      };
    }
    if (conflictCount > 0) {
      return {
        color: '#f59e0b',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        border: '#fed7aa',
        icon: '⚠️',
      };
    }
    if (status === 'syncing') {
      return {
        color: '#3b82f6',
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        border: '#bfdbfe',
        icon: '🔄',
      };
    }
    return {
      color: '#10b981',
      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      border: '#a7f3d0',
      icon: '✅',
    };
  };

  const config = getStatusConfig();

  return (
    <div
      style={{
        width: '100%',
        background: config.background,
        borderBottom: `1px solid ${config.border}`,
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 14,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1001,
        minHeight: 48,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        animation: 'slideDown 0.3s ease-out',
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 18 }}>{config.icon}</span>
        <div>
          {status === 'syncing' && (
            <span style={{ color: config.color, fontWeight: 600 }}>Syncing your journal...</span>
          )}
          {conflictCount > 0 && (
            <span style={{ color: config.color, fontWeight: 600 }}>
              {conflictCount} unresolved conflict{conflictCount > 1 ? 's' : ''} detected
              {onShowConflicts && (
                <button
                  style={{
                    marginLeft: 12,
                    padding: '4px 12px',
                    background: config.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={onShowConflicts}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Review Now
                </button>
              )}
            </span>
          )}
          {syncError && (
            <span style={{ color: config.color, fontWeight: 600 }} role="alert">
              Sync Error: {syncError}
            </span>
          )}
          {resolveMsg && <span style={{ color: config.color, fontWeight: 600 }}>{resolveMsg}</span>}
        </div>
      </div>

      <button
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: config.color,
          cursor: 'pointer',
          padding: 8,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          opacity: 0.7,
        }}
        onMouseOver={e => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.opacity = '0.7';
          e.currentTarget.style.background = 'none';
        }}
        aria-label="Dismiss notification"
        title="Dismiss"
      >
        ✕
      </button>

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
