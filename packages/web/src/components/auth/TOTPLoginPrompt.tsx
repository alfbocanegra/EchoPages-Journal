import React, { useState } from 'react';
import ThemeButton from '../common/ThemeButton';
import ThemeInput from '../common/ThemeInput';

interface TOTPLoginPromptProps {
  onSuccess: () => void;
  onError: (msg: string) => void;
}

const TOTPLoginPrompt: React.FC<TOTPLoginPromptProps> = ({ onSuccess, onError }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch('/auth/totp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token: code }),
    });
    if (res.ok) {
      onSuccess();
    } else {
      const data = await res.json();
      setError(data.error || 'Invalid code.');
      onError(data.error || 'Invalid code.');
    }
    setLoading(false);
  };

  return (
    <div style={{ textAlign: 'center', padding: 16 }}>
      <h3>Two-Factor Authentication</h3>
      <p>Enter the 6-digit code from your authenticator app.</p>
      <a
        href="https://support.google.com/accounts/answer/185834?hl=en"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#0288d1',
          textDecoration: 'underline',
          fontSize: 14,
          display: 'block',
          marginBottom: 8,
        }}
      >
        Lost access to your authenticator app?
      </a>
      <ThemeInput
        label="TOTP Code"
        value={code}
        onChange={e => setCode(e.target.value)}
        maxLength={6}
        style={{ marginBottom: 8, maxWidth: 200, marginLeft: 'auto', marginRight: 'auto' }}
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
      />
      <ThemeButton
        title={loading ? 'Verifying...' : 'Verify'}
        onClick={handleVerify}
        disabled={loading || code.length !== 6}
      />
      {error && (
        <div style={{ color: 'red', marginTop: 8 }} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default TOTPLoginPrompt;
