import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
  type AuthenticatorTransport,
  type VerifiedRegistrationResponse,
} from '@simplewebauthn/server';
import { BiometricCredential, BiometricType } from '@echopages/shared';
import { UserRepository } from '../../repositories/UserRepository';
import { randomBytes } from 'crypto';

export interface WebAuthnConfig {
  rpName: string;
  rpID: string;
  origin: string;
  expectedOrigin?: string;
  timeout?: number;
}

export class WebAuthnService {
  private userRepository: UserRepository;
  private config: WebAuthnConfig;

  constructor(userRepository: UserRepository, config: WebAuthnConfig) {
    this.userRepository = userRepository;
    this.config = {
      ...config,
      expectedOrigin: config.expectedOrigin || config.origin,
      timeout: config.timeout || 60000,
    };
  }

  async generateRegistrationOptions(
    userId: string,
    deviceName: string,
    biometricType: BiometricType
  ) {
    // Get user and their existing credentials
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['biometricCredentials'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get existing authenticators
    const existingCredentials = user.biometricCredentials || [];

    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName: this.config.rpName,
      rpID: this.config.rpID,
      userID: Buffer.from(userId),
      userName: user.email,
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
      timeout: this.config.timeout,
      excludeCredentials: existingCredentials
        .filter(
          (cred): cred is BiometricCredential & { keyHandle: string } =>
            cred.keyHandle !== undefined
        )
        .map(cred => ({
          id: cred.keyHandle,
          transports: ['internal'] as AuthenticatorTransport[],
        })),
    });

    // Store challenge for verification
    const challenge = options.challenge;

    // Create temporary credential for challenge verification
    const tempCredential = new BiometricCredential();
    tempCredential.userId = userId;
    tempCredential.deviceId = deviceName;
    tempCredential.biometricType = biometricType;
    tempCredential.biometricKeyHash = '';
    tempCredential.metadata = {
      enrolledAt: new Date().toISOString(),
      lastVerified: null,
      challenge,
      temporary: true,
    };

    await this.userRepository.manager.save(BiometricCredential, tempCredential);

    return options;
  }

  async verifyRegistration(
    userId: string,
    response: RegistrationResponseJSON,
    deviceName: string,
    biometricType: BiometricType
  ) {
    // Find the temporary credential with the challenge
    const tempCredential = await this.userRepository.manager.findOne(BiometricCredential, {
      where: {
        userId,
        deviceId: deviceName,
        biometricType,
      },
    });

    if (!tempCredential?.metadata?.challenge || !tempCredential.metadata.temporary) {
      throw new Error('Invalid registration session');
    }

    try {
      // Verify the registration response
      const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: tempCredential.metadata.challenge,
        expectedOrigin: this.config.expectedOrigin!,
        expectedRPID: this.config.rpID,
        requireUserVerification: true,
      });

      if (verification.verified && verification.registrationInfo) {
        // Create the verified credential
        const credential = new BiometricCredential();
        credential.userId = userId;
        credential.deviceId = deviceName;
        credential.biometricType = biometricType;

        // Get credential data from verification
        const credentialId = Buffer.from(verification.registrationInfo.credential.id).toString(
          'base64'
        );
        const publicKey = Buffer.from(verification.registrationInfo.credential.publicKey).toString(
          'base64'
        );

        credential.keyHandle = credentialId;
        credential.publicKey = publicKey;
        credential.biometricKeyHash = '';
        credential.metadata = {
          enrolledAt: new Date().toISOString(),
          lastVerified: null,
          currentChallenge: '',
          challengeId: '',
        };

        // Save the new credential and remove the temporary one
        await this.userRepository.manager.transaction(async manager => {
          await manager.remove(tempCredential);
          await manager.save(BiometricCredential, credential);
        });

        return credential;
      }
    } catch (error) {
      console.error('WebAuthn registration verification failed:', error);
      throw new Error('Registration verification failed');
    }

    throw new Error('Registration verification failed');
  }

  async generateAuthenticationOptions(userId: string) {
    // Get user's credentials
    const credentials = await this.userRepository.manager.find(BiometricCredential, {
      where: { userId },
    });

    if (!credentials.length) {
      throw new Error('No registered credentials found');
    }

    // Generate authentication options
    const options = await generateAuthenticationOptions({
      rpID: this.config.rpID,
      timeout: this.config.timeout,
      allowCredentials: credentials
        .filter(
          (cred): cred is BiometricCredential & { keyHandle: string } =>
            cred.keyHandle !== undefined
        )
        .map(cred => ({
          id: cred.keyHandle,
          transports: ['internal'] as AuthenticatorTransport[],
        })),
      userVerification: 'preferred',
    });

    // Store challenge
    const challenge = options.challenge;
    const challengeId = randomBytes(32).toString('hex');

    // Update all user's credentials with the challenge
    await Promise.all(
      credentials.map(cred => {
        if (cred.metadata) {
          cred.metadata = {
            ...cred.metadata,
            currentChallenge: challenge,
            challengeId,
          };
          return this.userRepository.manager.save(BiometricCredential, cred);
        }
        return Promise.resolve();
      })
    );

    return { options, challengeId };
  }

  async verifyAuthentication(
    userId: string,
    response: AuthenticationResponseJSON,
    challengeId: string
  ) {
    // Find the credential used for authentication
    const credential = await this.userRepository.manager.findOne(BiometricCredential, {
      where: {
        userId,
        keyHandle: response.id,
      },
    });

    if (
      !credential?.metadata?.currentChallenge ||
      credential.metadata.challengeId !== challengeId
    ) {
      throw new Error('Invalid authentication session');
    }

    try {
      // Verify the authentication response
      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: credential.metadata.currentChallenge,
        expectedOrigin: this.config.expectedOrigin!,
        expectedRPID: this.config.rpID,
        requireUserVerification: true,
        credential: {
          id: credential.keyHandle || '',
          publicKey: credential.publicKey || '',
          counter: 0,
        } as any,
      });

      if (verification.verified) {
        // Update the credential's last verified timestamp
        credential.metadata = {
          ...credential.metadata,
          lastVerified: new Date().toISOString(),
          currentChallenge: '',
          challengeId: '',
        };

        await this.userRepository.manager.save(BiometricCredential, credential);
        return true;
      }
    } catch (error) {
      console.error('WebAuthn authentication verification failed:', error);
      throw new Error('Authentication verification failed');
    }

    return false;
  }
}
