import React, { useState } from 'react';
import { View, Text, Image, Platform, StyleSheet } from 'react-native';
// @ts-ignore: No type declarations for expo-local-authentication
import * as LocalAuthentication from 'expo-local-authentication';
import {
  generateEncryptionKey,
  storeEncryptionKey,
  getEncryptionKey,
} from '../utils/SecureKeyStorage';
import { ThemeButton } from '../components/common/ThemeButton';
import { useTheme } from '../styles/ThemeContext';

// TODO: Implement passkey registration/login when platform APIs are available
const isPasskeySupported = false; // Stub for now

interface AuthScreenProps {
  onAuthSuccess: () => void;
  setProgressMessage: (msg: string) => void;
}

export default function AuthScreen({ onAuthSuccess, setProgressMessage }: AuthScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  // Biometric authentication flow
  const handleBiometricAuth = async () => {
    setProgressMessage('Authenticating with biometrics...');
    setLoading(true);
    setError(null);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) {
        setError(
          'No biometrics enrolled. Please set up Face ID or Touch ID in your device settings.'
        );
        setProgressMessage('Biometric authentication unavailable.');
        setLoading(false);
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to unlock your journal',
      });
      if (result.success) {
        setProgressMessage('Securing your device encryption key...');
        let key = await getEncryptionKey();
        if (!key) {
          key = await generateEncryptionKey();
          await storeEncryptionKey(key);
        }
        setProgressMessage('Authentication successful!');
        onAuthSuccess();
      } else {
        setError('Biometric authentication failed.');
        setProgressMessage('Biometric authentication failed.');
      }
    } catch (e) {
      setError('Biometric authentication error.');
      setProgressMessage('Biometric authentication error.');
    }
    setLoading(false);
  };

  // Passkey authentication flow (stub)
  const handlePasskeyAuth = async () => {
    setProgressMessage('Checking for passkey support...');
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setError('Passkey authentication is not yet supported on this device.');
      setProgressMessage('Passkey authentication unavailable.');
      setLoading(false);
    }, 1000);
  };

  // Fallback: Email magic link
  const handleMagicLink = async () => {
    setProgressMessage('Sending magic link email...');
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setError('Magic link authentication is not yet implemented.');
      setProgressMessage('Magic link authentication unavailable.');
      setLoading(false);
    }, 1000);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      accessible
      accessibilityLabel="Authentication screen"
    >
      {/* Logo placeholder */}
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        accessibilityLabel="EchoPages Journal logo"
        accessible
      />
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.onSurface,
            fontSize: theme.typography.fontSize.heading,
            fontFamily: theme.typography.fontFamily,
          },
        ]}
        accessibilityRole="header"
      >
        Welcome to EchoPages
      </Text>
      <Text
        style={[
          styles.subtitle,
          {
            color: theme.colors.onSurface,
            fontSize: theme.typography.fontSize.body,
            fontFamily: theme.typography.fontFamily,
          },
        ]}
        accessibilityLabel="Fast, secure, and passwordless authentication"
      >
        Fast, secure, and passwordless authentication
      </Text>
      <Text
        style={[
          styles.onboarding,
          {
            color: theme.colors.onSurface,
            fontSize: theme.typography.fontSize.body,
            fontFamily: theme.typography.fontFamily,
          },
        ]}
        accessibilityLabel="Your journal is protected with the latest security standards. Only you can unlock it."
      >
        Your journal is protected with the latest security standards. Only you can unlock it.
      </Text>
      <ThemeButton
        title="Sign in with Face/Touch ID"
        onPress={handleBiometricAuth}
        disabled={loading}
        variant="primary"
        accessibilityLabel="Sign in with Face or Touch ID"
      />
      {isPasskeySupported && (
        <ThemeButton
          title="Sign in with Passkey"
          onPress={handlePasskeyAuth}
          disabled={loading}
          variant="secondary"
          accessibilityLabel="Sign in with Passkey"
        />
      )}
      <ThemeButton
        title="Sign in with Magic Link (Email)"
        onPress={handleMagicLink}
        disabled={loading}
        variant="outline"
        accessibilityLabel="Sign in with Magic Link (Email)"
      />
      {error && (
        <Text
          style={[
            styles.error,
            {
              color: theme.colors.error,
              fontSize: theme.typography.fontSize.body,
              fontFamily: theme.typography.fontFamily,
            },
          ]}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
      {loading && (
        <Text
          style={[
            styles.loading,
            {
              color: theme.colors.accent,
              fontSize: theme.typography.fontSize.body,
              fontFamily: theme.typography.fontFamily,
            },
          ]}
          accessibilityLiveRegion="polite"
        >
          Authenticating...
        </Text>
      )}
      <Text
        style={[
          styles.info,
          {
            color: theme.colors.outline,
            fontSize: theme.typography.fontSize.caption,
            fontFamily: theme.typography.fontFamily,
          },
        ]}
        accessibilityLabel="We never use passwords or SMS codes. Your credentials stay on your device."
      >
        We never use passwords or SMS codes. Your credentials stay on your device.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
    borderRadius: 20,
    backgroundColor: '#e0e0e0', // Placeholder background
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  onboarding: {
    fontSize: 15,
    marginBottom: 28,
    textAlign: 'center',
    maxWidth: 320,
  },
  error: {
    marginTop: 18,
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 320,
  },
  loading: {
    marginTop: 18,
    fontSize: 15,
    textAlign: 'center',
  },
  info: {
    marginTop: 32,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 320,
  },
});
