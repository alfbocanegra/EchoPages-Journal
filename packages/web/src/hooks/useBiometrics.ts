import { useCallback } from 'react';

// Placeholder for biometric authentication
// In production, use WebAuthn (web), or platform APIs (mobile/desktop)
export function useBiometrics() {
  const authenticate = useCallback(async () => {
    // Simulate biometric auth (always succeeds)
    return Promise.resolve(true);
  }, []);

  return { authenticate };
} 