import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

export enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACE = 'face',
  IRIS = 'iris',
  WEBAUTHN = 'webauthn'
}

export interface BiometricMetadata {
  enrolledAt: string;
  lastVerified: string | null;
  challenge?: string;
  temporary?: boolean;
  currentChallenge?: string;
  challengeId?: string;
}

@Entity('biometric_credentials')
export class BiometricCredential extends BaseEntity {
  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'device_id' })
  deviceId!: string;

  @Column({
    name: 'biometric_type',
    type: 'enum',
    enum: BiometricType
  })
  biometricType!: BiometricType;

  @Column({ name: 'key_handle', nullable: true })
  keyHandle?: string;

  @Column({ name: 'public_key', nullable: true })
  publicKey?: string;

  @Column({ name: 'biometric_key_hash' })
  biometricKeyHash!: string;

  @Column({ name: 'metadata', type: 'jsonb' })
  metadata!: BiometricMetadata;

  @ManyToOne(() => User, user => user.biometricCredentials)
  @JoinColumn({ name: 'user_id' })
  user!: User;
} 