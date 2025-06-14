import React, { useState } from 'react';
import { OAuthLogin } from '../components/auth/OAuthLogin';
import { useBiometrics } from '../hooks/useBiometrics';
import { loginWithOAuth } from '../services/authService';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'oauth' | 'biometric' | 'done'>('oauth');
  const [provider, setProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { authenticate } = useBiometrics();

  const handleOAuth = async (prov: string) => {
    setProvider(prov);
    setStep('biometric');
    // Simulate OAuth code exchange
    try {
      // In a real app, redirect to provider and get code
      const fakeCode = 'dummy-oauth-code';
      await loginWithOAuth(prov, fakeCode);
    } catch (err) {
      setError('OAuth login failed');
      setStep('oauth');
      return;
    }
  };

  const handleBiometric = async () => {
    const success = await authenticate();
    if (success) {
      setStep('done');
      onLoginSuccess();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 64 }}>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      {step === 'oauth' && <OAuthLogin onProviderSelect={handleOAuth} />}
      {step === 'biometric' && (
        <div>
          <h3>Authenticate with Biometrics</h3>
          <button onClick={handleBiometric} style={{ padding: '12px 24px', fontSize: 16 }}>
            Use Biometrics
          </button>
        </div>
      )}
      {step === 'done' && <div>Login successful! Redirecting...</div>}
    </div>
  );
}; 