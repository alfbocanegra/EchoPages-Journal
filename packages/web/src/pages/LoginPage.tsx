import React, { useState } from 'react';
import { OAuthLogin } from '../components/auth/OAuthLogin';
import { useBiometrics } from '../hooks/useBiometrics';

import ThemeButton from '../components/common/ThemeButton';
import ThemeCard from '../components/common/ThemeCard';
import TOTPLoginPrompt from '../components/auth/TOTPLoginPrompt';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'oauth' | 'biometric' | 'totp' | 'done'>('oauth');
  const [provider, setProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { authenticate } = useBiometrics();
  const { setAuthProvider, cloudStorage } = useAuth();
  const [_totpRequired, setTotpRequired] = useState(false);

  const checkTOTP = async () => {
    // Check if TOTP is enabled for the user
    const res = await fetch('/auth/totp/status', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (data.enabled) {
        setTotpRequired(true);
        setStep('totp');
        return true;
      }
    }
    return false;
  };

  const handleOAuth = async (prov: string) => {
    setProvider(prov);
    setAuthProvider(prov); // Set the auth provider in context

    try {
      // Redirect to backend OAuth endpoint
      const provider = prov.toLowerCase();
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const redirectUrl = `${baseURL}/auth/oauth/${provider}`;

      console.log('OAuth redirect URL:', redirectUrl);
      console.log('Provider:', provider);
      console.log('Base URL:', baseURL);

      // Add a small delay to ensure state is set
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 100);
    } catch (err) {
      console.error('OAuth error:', err);
      setError('OAuth login failed');
      setStep('oauth');
      return;
    }
  };

  const handleBiometric = async () => {
    const success = await authenticate();
    if (success) {
      const needsTOTP = await checkTOTP();
      if (!needsTOTP) {
        setStep('done');
        onLoginSuccess();
      }
    } else {
      setError('Biometric authentication failed. Please try again.');
      setStep('oauth');
    }
  };

  const handleTOTPDone = () => {
    setStep('done');
    onLoginSuccess();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 1px, transparent 1px),
          radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 1px, transparent 1px),
          radial-gradient(circle at 40% 20%, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
          backgroundSize: '100px 100px, 80px 80px, 120px 120px',
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 480,
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <img
              src="/icon-192.png"
              alt="EchoPages"
              style={{
                width: 80,
                height: 80,
                borderRadius: 16,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
              }}
            />
          </div>
          <h1
            style={{
              fontSize: 48,
              fontWeight: 700,
              margin: 0,
              background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              letterSpacing: '-1px',
            }}
          >
            EchoPages
          </h1>
          <p
            style={{
              fontSize: 20,
              margin: '8px 0 0 0',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 300,
            }}
          >
            Your Personal Journal
          </p>
          <p
            style={{
              fontSize: 16,
              margin: '16px 0 0 0',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.5,
              maxWidth: 360,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Capture your thoughts, preserve your memories, and sync seamlessly across all your
            devices with encrypted cloud storage.
          </p>
        </div>

        {/* Main Login Card */}
        <ThemeCard
          style={{
            padding: 32,
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            background: 'rgba(255,255,255,0.95)',
          }}
        >
          {error && (
            <div
              style={{
                color: '#dc3545',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: 8,
                padding: 12,
                marginBottom: 20,
                fontSize: 14,
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          {/* Show cloud storage info if provider is selected */}
          {provider && cloudStorage && (
            <div
              style={{
                marginBottom: 20,
                padding: 16,
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: 10,
                fontSize: 14,
                textAlign: 'center',
                color: '#155724',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>✅ Cloud Storage Connected</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>
                Your journal will sync to {cloudStorage.getProvider().replace('-', ' ')}
              </div>
            </div>
          )}

          {step === 'oauth' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    margin: '0 0 8px 0',
                    color: '#333',
                  }}
                >
                  Welcome Back
                </h2>
                <p
                  style={{
                    color: '#666',
                    fontSize: 15,
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  Sign in to access your journal and start writing
                </p>
              </div>

              <OAuthLogin onProviderSelect={handleOAuth} />
            </div>
          )}

          {step === 'biometric' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  margin: '0 0 12px 0',
                  color: '#333',
                }}
              >
                Biometric Authentication
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: '#666',
                  marginBottom: 24,
                  lineHeight: 1.4,
                }}
              >
                Complete your login with biometric authentication for enhanced security.
              </p>
              <ThemeButton
                title="Use Biometric Authentication"
                onClick={handleBiometric}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  fontSize: 16,
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              />
              <ThemeButton
                title="Back to login options"
                variant="outline"
                onClick={() => setStep('oauth')}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  fontSize: 14,
                  borderRadius: 8,
                }}
              />
            </div>
          )}

          {step === 'totp' && <TOTPLoginPrompt onSuccess={handleTOTPDone} onError={setError} />}

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h3
                style={{
                  color: '#28a745',
                  fontSize: 20,
                  fontWeight: 600,
                  margin: '0 0 12px 0',
                }}
              >
                Login Successful!
              </h3>
              <p
                style={{
                  color: '#666',
                  fontSize: 15,
                  margin: 0,
                }}
              >
                Welcome to your journal. Redirecting...
              </p>
            </div>
          )}
        </ThemeCard>

        {/* Feature Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 16,
            marginTop: 8,
          }}
        >
          <div
            style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.9)',
              fontSize: 14,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
            <div style={{ fontWeight: 500 }}>End-to-End Encrypted</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Your privacy protected</div>
          </div>
          <div
            style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.9)',
              fontSize: 14,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>☁️</div>
            <div style={{ fontWeight: 500 }}>Cloud Sync</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Access anywhere</div>
          </div>
          <div
            style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.9)',
              fontSize: 14,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>📱</div>
            <div style={{ fontWeight: 500 }}>Cross-Platform</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Web, iOS, Android</div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: 'rgba(255,255,255,0.6)',
            marginTop: 16,
          }}
        >
          Your thoughts, your words, your story.
        </div>
      </div>
    </div>
  );
};
