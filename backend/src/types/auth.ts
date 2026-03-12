export type AuthProvider = 'google' | 'apple' | 'microsoft' | 'dropbox';
export type BiometricType = 'face_id' | 'touch_id' | 'windows_hello' | 'fingerprint';
export type AuthMethod = 'oauth' | 'biometric';

export interface OAuthProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  locale?: string;
  provider: AuthProvider;
  raw?: any;
}

export interface BiometricCredential {
  id: string;
  userId: string;
  deviceId: string;
  biometricType: BiometricType;
  biometricKeyHash: string;
  publicKey?: string;
  keyHandle?: string;
  metadata: Record<string, any>;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  deviceInfo: Record<string, any>;
  authMethod: AuthMethod;
  biometricCredentialId?: string;
  expiresAt: Date;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn: number;
}

export interface BiometricAuthRequest {
  userId: string;
  deviceId: string;
  biometricType: BiometricType;
  challenge: string;
  signature: string;
}

export interface BiometricEnrollRequest {
  userId: string;
  deviceId: string;
  biometricType: BiometricType;
  publicKey: string;
  keyHandle?: string;
}
