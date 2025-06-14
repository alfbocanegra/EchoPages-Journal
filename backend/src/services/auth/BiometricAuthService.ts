import { randomBytes, createHash } from 'crypto';
import { BiometricType, BiometricAuthRequest, BiometricEnrollRequest, BiometricCredential } from '@echopages/shared';
import { UserRepository } from '../../repositories/UserRepository';
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';

export class BiometricAuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async enrollDevice(request: BiometricEnrollRequest): Promise<BiometricCredential> {
    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: request.userId },
      relations: ['biometricCredentials']
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if device is already enrolled
    const existingCredential = user.biometricCredentials?.find(
      (cred: BiometricCredential) => cred.deviceId === request.deviceId && cred.biometricType === request.biometricType
    );

    if (existingCredential) {
      throw new Error('Device already enrolled for this biometric type');
    }

    // Generate a secure key hash
    const keyHash = this.generateKeyHash(request.publicKey);

    // Create new biometric credential
    const credential = new BiometricCredential();
    credential.userId = request.userId;
    credential.deviceId = request.deviceId;
    credential.biometricType = request.biometricType;
    credential.biometricKeyHash = keyHash;
    credential.publicKey = request.publicKey;
    credential.keyHandle = request.keyHandle;
    credential.metadata = {
      enrolledAt: new Date().toISOString(),
      lastVerified: null
    };

    // Save to database
    await this.userRepository.manager.save(BiometricCredential, credential);

    return credential;
  }

  async verifyBiometric(request: BiometricAuthRequest): Promise<boolean> {
    // Find the credential
    const where: FindOptionsWhere<BiometricCredential> = {
      userId: request.userId,
      deviceId: request.deviceId,
      biometricType: request.biometricType
    };

    const credential = await this.userRepository.manager.findOne(BiometricCredential, {
      where
    });

    if (!credential) {
      throw new Error('Biometric credential not found');
    }

    // Verify the signature
    const isValid = await this.verifySignature(
      request.challenge,
      request.signature,
      credential.publicKey!
    );

    if (isValid) {
      // Update last used timestamp in metadata
      credential.metadata = {
        ...credential.metadata,
        lastVerified: new Date().toISOString()
      };
      await this.userRepository.manager.save(BiometricCredential, credential);
    }

    return isValid;
  }

  async removeDevice(userId: string, deviceId: string, biometricType: BiometricType): Promise<void> {
    const where: FindOptionsWhere<BiometricCredential> = {
      userId,
      deviceId,
      biometricType
    };

    const result = await this.userRepository.manager.delete(BiometricCredential, where);

    if (result.affected === 0) {
      throw new Error('Biometric credential not found');
    }
  }

  async listDevices(userId: string): Promise<BiometricCredential[]> {
    const where: FindOptionsWhere<BiometricCredential> = { userId };
    const order: FindOptionsOrder<BiometricCredential> = { createdAt: 'DESC' };

    return this.userRepository.manager.find(BiometricCredential, {
      where,
      order
    });
  }

  private generateKeyHash(publicKey: string): string {
    const salt = randomBytes(32).toString('hex');
    const hash = createHash('sha256')
      .update(salt + publicKey)
      .digest('hex');
    return `${salt}:${hash}`;
  }

  private async verifySignature(challenge: string, signature: string, publicKey: string): Promise<boolean> {
    // This is a placeholder for actual signature verification
    // In a real implementation, this would use platform-specific crypto libraries
    // to verify the biometric signature using the stored public key
    
    // For example, using WebAuthn/FIDO2:
    // return await webauthn.verifySignature({
    //   challenge: Buffer.from(challenge, 'base64'),
    //   signature: Buffer.from(signature, 'base64'),
    //   publicKey: Buffer.from(publicKey, 'base64')
    // });

    // For now, return true for testing
    return true;
  }
} 