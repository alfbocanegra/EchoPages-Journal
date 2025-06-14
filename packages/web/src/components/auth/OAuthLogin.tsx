import React from 'react';

interface OAuthLoginProps {
  onProviderSelect: (provider: string) => void;
}

const providers = [
  { name: 'Google', color: '#4285F4' },
  { name: 'Apple', color: '#000000' },
  { name: 'Facebook', color: '#1877F3' },
  { name: 'Twitter', color: '#1DA1F2' },
];

export const OAuthLogin: React.FC<OAuthLoginProps> = ({ onProviderSelect }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
    <h2>Sign in with Social Media</h2>
    {providers.map((p) => (
      <button
        key={p.name}
        style={{
          background: p.color,
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          padding: '12px 24px',
          fontSize: 16,
          cursor: 'pointer',
          width: 240,
        }}
        aria-label={`Sign in with ${p.name}`}
        onClick={() => onProviderSelect(p.name)}
      >
        Sign in with {p.name}
      </button>
    ))}
  </div>
); 