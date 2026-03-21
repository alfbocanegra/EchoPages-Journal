import React, { useState } from 'react';

export const PasswordlessFallback: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'email' | 'sms' | 'local'>('local');
  const [value, setValue] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = () => {
    if (!value) {
      setError(`Please enter your ${mode === 'email' ? 'email address' : 'phone number'}.`);
      return;
    }
    setSent(true);
    setError(null);
    // Simulate sending magic link or SMS code
  };

  const handleVerify = () => {
    if (code === '123456') {
      setError(null);
      onSuccess();
    } else {
      setError('Invalid code. Try 123456.');
    }
  };

  const handleLocalAccess = () => {
    // Skip authentication and go directly to local-only mode
    onSuccess();
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔓</div>
      <h3
        style={{
          fontSize: 20,
          fontWeight: 600,
          margin: '0 0 12px 0',
          color: '#333',
        }}
      >
        Alternative Access
      </h3>
      <p
        style={{
          fontSize: 15,
          color: '#666',
          marginBottom: 24,
          lineHeight: 1.4,
        }}
      >
        Choose how you&apos;d like to access your journal
      </p>

      {/* Mode Selection */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          backgroundColor: '#f8f9fa',
          borderRadius: 8,
          padding: 4,
        }}
      >
        <button
          onClick={() => setMode('local')}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            backgroundColor: mode === 'local' ? '#007bff' : 'transparent',
            color: mode === 'local' ? 'white' : '#666',
            transition: 'all 0.2s ease',
          }}
        >
          Local Only
        </button>
        <button
          onClick={() => setMode('email')}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            backgroundColor: mode === 'email' ? '#007bff' : 'transparent',
            color: mode === 'email' ? 'white' : '#666',
            transition: 'all 0.2s ease',
          }}
        >
          Email
        </button>
        <button
          onClick={() => setMode('sms')}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            backgroundColor: mode === 'sms' ? '#007bff' : 'transparent',
            color: mode === 'sms' ? 'white' : '#666',
            transition: 'all 0.2s ease',
          }}
        >
          SMS
        </button>
      </div>

      {mode === 'local' && (
        <div>
          <div
            style={{
              padding: 16,
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 14,
              color: '#856404',
            }}
          >
            <div style={{ fontWeight: 500, marginBottom: 4 }}>📱 Local Storage Only</div>
            Your journal will be saved locally on this device. No cloud sync or account required.
          </div>
          <button
            onClick={handleLocalAccess}
            style={{
              width: '100%',
              padding: '14px 24px',
              fontSize: 16,
              fontWeight: 500,
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#0056b3')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#007bff')}
          >
            Continue Locally
          </button>
        </div>
      )}

      {(mode === 'email' || mode === 'sms') && !sent && (
        <div>
          <input
            type={mode === 'email' ? 'email' : 'tel'}
            placeholder={mode === 'email' ? 'Enter your email address' : 'Enter your phone number'}
            value={value}
            onChange={e => setValue(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              marginBottom: 16,
              border: '1px solid #ddd',
              borderRadius: 8,
              fontSize: 16,
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={e => (e.target.style.borderColor = '#007bff')}
            onBlur={e => (e.target.style.borderColor = '#ddd')}
          />
          <button
            onClick={handleSend}
            style={{
              width: '100%',
              padding: '14px 24px',
              fontSize: 16,
              fontWeight: 500,
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#1e7e34')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#28a745')}
          >
            Send {mode === 'email' ? 'Magic Link' : 'Verification Code'}
          </button>
        </div>
      )}

      {(mode === 'email' || mode === 'sms') && sent && (
        <div>
          <div
            style={{
              padding: 16,
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 14,
              color: '#155724',
            }}
          >
            <div style={{ fontWeight: 500, marginBottom: 4 }}>✅ Code Sent!</div>
            Check your {mode === 'email' ? 'email' : 'messages'} for the verification code.
          </div>
          <input
            type="text"
            placeholder="Enter verification code (try 123456)"
            value={code}
            onChange={e => setCode(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              marginBottom: 16,
              border: '1px solid #ddd',
              borderRadius: 8,
              fontSize: 16,
              outline: 'none',
              textAlign: 'center',
              letterSpacing: 2,
              transition: 'border-color 0.2s ease',
            }}
            onFocus={e => (e.target.style.borderColor = '#007bff')}
            onBlur={e => (e.target.style.borderColor = '#ddd')}
          />
          <button
            onClick={handleVerify}
            style={{
              width: '100%',
              padding: '14px 24px',
              fontSize: 16,
              fontWeight: 500,
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#0056b3')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#007bff')}
          >
            Verify & Continue
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            color: '#dc3545',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: 8,
            padding: 12,
            marginTop: 16,
            fontSize: 14,
          }}
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
};
