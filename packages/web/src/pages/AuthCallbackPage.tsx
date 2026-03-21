import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthProvider, setJWT } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      console.error('OAuth error:', error);
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (token && provider) {
      try {
        // Store the token
        localStorage.setItem('jwt', token);

        // Set the auth provider
        setAuthProvider(provider);

        // Simulate user data based on provider
        const _mockUser = {
          id: `${provider}_user_${Date.now()}`,
          email: `user@${
            provider === 'google'
              ? 'gmail.com'
              : provider === 'apple'
              ? 'icloud.com'
              : provider === 'microsoft'
              ? 'outlook.com'
              : 'dropbox.com'
          }`,
          name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
          provider,
          cloudProvider:
            provider === 'google'
              ? 'google_drive'
              : provider === 'apple'
              ? 'icloud'
              : provider === 'microsoft'
              ? 'onedrive'
              : 'dropbox',
        };

        // Set the JWT token
        setJWT(token);

        setStatus('success');

        // Redirect immediately since router will detect auth state change
        setTimeout(() => navigate('/entries'), 500);
      } catch (err) {
        console.error('Failed to process authentication:', err);
        setStatus('error');
        setTimeout(() => navigate('/'), 3000);
      }
    } else {
      setStatus('error');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [searchParams, navigate, setAuthProvider, setJWT]);

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
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: 20,
          padding: 48,
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          maxWidth: 400,
        }}
      >
        {status === 'processing' && (
          <>
            <div
              style={{
                width: 48,
                height: 48,
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 24px',
              }}
            />
            <h2 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 12px 0', color: '#333' }}>
              Completing Sign In...
            </h2>
            <p style={{ color: '#666', fontSize: 16, margin: 0 }}>
              Please wait while we finalize your authentication.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: 64, marginBottom: 24 }}>✅</div>
            <h2 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 12px 0', color: '#28a745' }}>
              Successfully Signed In!
            </h2>
            <p style={{ color: '#666', fontSize: 16, margin: 0 }}>
              Welcome to EchoPages. Redirecting you to your journal...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 64, marginBottom: 24 }}>❌</div>
            <h2 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 12px 0', color: '#dc3545' }}>
              Authentication Failed
            </h2>
            <p style={{ color: '#666', fontSize: 16, margin: 0 }}>
              Something went wrong during sign in. Redirecting back to login...
            </p>
          </>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `,
        }}
      />
    </div>
  );
};
