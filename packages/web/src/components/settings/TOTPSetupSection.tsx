import React, { useState, useEffect } from 'react';
import ThemeButton from '../common/ThemeButton';
import ThemeInput from '../common/ThemeInput';

const TOTPSetupSection: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setup, setSetup] = useState<{ secret: string; otpauth_url: string; qr: string } | null>(
    null
  );
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetch('/auth/totp/status', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setEnabled(data.enabled);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const startSetup = async () => {
    setError(null);
    setSuccess(null);
    setSetup(null);
    setCode('');
    const res = await fetch('/auth/totp/setup', { method: 'POST', credentials: 'include' });
    if (res.ok) setSetup(await res.json());
    else setError('Failed to start 2FA setup.');
  };

  const verify = async () => {
    setVerifying(true);
    setError(null);
    setSuccess(null);
    const res = await fetch('/auth/totp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token: code }),
    });
    if (res.ok) {
      setSuccess('Two-factor authentication enabled!');
      setEnabled(true);
      setSetup(null);
      setCode('');
    } else {
      const data = await res.json();
      setError(data.error || 'Invalid code.');
    }
    setVerifying(false);
  };

  const disable = async () => {
    setError(null);
    setSuccess(null);
    const res = await fetch('/auth/totp/disable', { method: 'POST', credentials: 'include' });
    if (res.ok) {
      setEnabled(false);
      setSuccess('Two-factor authentication disabled.');
    } else {
      setError('Failed to disable 2FA.');
    }
  };

  if (loading) return <div>Loading 2FA status...</div>;

  return (
    <div>
      {enabled ? (
        <>
          <div style={{ color: 'green', marginBottom: 8 }} role="status">
            Two-factor authentication is <b>enabled</b> on your account.
          </div>
          <ThemeButton title="Disable 2FA" variant="danger" onClick={disable} />
        </>
      ) : setup ? (
        <>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            <span>
              To enable two-factor authentication, scan the QR code below with your authenticator
              app (such as Google Authenticator, Authy, or Microsoft Authenticator).
            </span>
            <br />
            <a
              href="https://support.google.com/accounts/answer/1066447?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0288d1', textDecoration: 'underline', fontSize: 14 }}
            >
              What is an authenticator app?
            </a>
          </div>
          <img
            src={setup.qr}
            alt="TOTP QR code for authenticator app"
            style={{ width: 180, height: 180, marginBottom: 8 }}
          />
          <div style={{ marginBottom: 8, fontSize: 15 }}>
            <b>Can&apos;t scan the QR code?</b> Enter this code manually in your app:
            <br />
            <code style={{ fontSize: 16 }}>{setup.secret}</code>
          </div>
          <ThemeInput
            label="Enter 6-digit code from your app"
            value={code}
            onChange={e => setCode(e.target.value)}
            maxLength={6}
            style={{ marginBottom: 8, maxWidth: 200 }}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
          />
          <ThemeButton
            title={verifying ? 'Verifying...' : 'Verify & Enable 2FA'}
            onClick={verify}
            disabled={verifying || code.length !== 6}
          />
          <ThemeButton
            title="Cancel"
            variant="outline"
            onClick={() => setSetup(null)}
            style={{ marginLeft: 8 }}
          />
        </>
      ) : (
        <ThemeButton title="Enable Two-Factor Authentication" onClick={startSetup} />
      )}
      {error && (
        <div style={{ color: 'red', marginTop: 8 }} role="alert">
          {error}
        </div>
      )}
      {success && (
        <div style={{ color: 'green', marginTop: 8 }} role="status">
          {success}
        </div>
      )}
    </div>
  );
};

export default TOTPSetupSection;
