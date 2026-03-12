import React from 'react';

interface OAuthLoginProps {
  onProviderSelect: (provider: string) => void;
}

const providers = [
  {
    name: 'Google',
    color: '#4285F4',
    storage: 'Google Drive',
    description: 'Your journal will sync to Google Drive',
    icon: '🗄️',
  },
  {
    name: 'Apple',
    color: '#000000',
    storage: 'iCloud',
    description: 'Your journal will sync to iCloud',
    icon: '☁️',
  },
  {
    name: 'Dropbox',
    color: '#0061FF',
    storage: 'Dropbox',
    description: 'Your journal will sync to Dropbox',
    icon: '📦',
  },
];

export const OAuthLogin: React.FC<OAuthLoginProps> = ({ onProviderSelect }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {providers.map(p => (
      <div key={p.name} style={{ position: 'relative' }}>
        <button
          style={{
            width: '100%',
            background: p.color,
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '16px 20px',
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
          onMouseDown={e => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          onMouseUp={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          aria-label={`Sign in with ${p.name} - ${p.description}`}
          onClick={() => onProviderSelect(p.name)}
        >
          {/* Subtle shine effect */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              transition: 'left 0.5s ease',
              pointerEvents: 'none',
            }}
          />

          <span style={{ fontSize: 20 }}>{p.icon}</span>
          <span style={{ flex: 1, textAlign: 'left' }}>Continue with {p.name}</span>
          <span
            style={{
              fontSize: 12,
              opacity: 0.8,
              fontWeight: 400,
            }}
          >
            →
          </span>
        </button>

        {/* Storage info tooltip */}
        <div
          style={{
            fontSize: 11,
            color: '#888',
            textAlign: 'center',
            marginTop: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <span>{p.icon}</span>
          <span>Syncs to {p.storage}</span>
        </div>
      </div>
    ))}

    <div
      style={{
        marginTop: 16,
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        border: '1px solid #e9ecef',
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        lineHeight: 1.4,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginBottom: 8,
        }}
      >
        <span>🔒</span>
        <span style={{ fontWeight: 500, color: '#333' }}>Privacy & Security</span>
      </div>
      Your journal entries are encrypted with your personal passphrase before being stored in the
      cloud. Only you can read your data.
    </div>
  </div>
);
