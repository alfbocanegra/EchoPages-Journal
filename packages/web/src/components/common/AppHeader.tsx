import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeButton from './ThemeButton';
import { SyncStatusIndicator } from './SyncStatusIndicator';

interface AppHeaderProps {
  stats?: { totalEntries: number; totalWords: number };
  showSyncStatus?: boolean;
  showEncryption?: boolean;
  style?: React.CSSProperties;
}

const navButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  fontWeight: 600,
  fontSize: 14,
  padding: '0 20px',
  height: 40,
  minHeight: 40,
  minWidth: 80,
  margin: 0,
  outline: 'none',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const AppHeader: React.FC<AppHeaderProps> = ({ stats, showSyncStatus, showEncryption, style }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: 16,
        padding: '16px 24px',
        border: '1px solid rgba(255,255,255,0.2)',
        ...style,
      }}
    >
      {/* Left: Logo and App Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <img
          src="/favicon-48x48.png"
          alt="EchoPages"
          style={{ width: 32, height: 32 }}
          onError={e => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        <div>
          <span
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #fff, #e3f2fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'block',
            }}
          >
            EchoPages
          </span>
        </div>
        {showSyncStatus && (
          <div style={{ marginLeft: 16 }}>
            <SyncStatusIndicator />
          </div>
        )}
        {showEncryption && (
          <div
            style={{
              marginLeft: 12,
              padding: '0 16px',
              borderRadius: 12,
              background: 'linear-gradient(45deg, #10b981, #14b8a6)',
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              height: 40,
              minHeight: 40,
            }}
          >
            <span role="img" aria-label="encryption">
              🔒
            </span>
            Encryption: Enabled
          </div>
        )}
      </div>
      {/* Right: Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ThemeButton title="Journal" onClick={() => navigate('/entries')} style={navButtonStyle}>
          Journal
        </ThemeButton>
        <ThemeButton title="Editor" onClick={() => navigate('/editor')} style={navButtonStyle}>
          Editor
        </ThemeButton>
        <ThemeButton
          title="Sign Out"
          onClick={() => {
            localStorage.removeItem('jwt');
            window.location.href = '/';
          }}
          style={navButtonStyle}
        >
          Sign Out
        </ThemeButton>
        <ThemeButton title="Settings" onClick={() => navigate('/settings')} style={navButtonStyle}>
          Settings
        </ThemeButton>
      </div>
    </div>
  );
};

export default AppHeader;
