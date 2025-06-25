import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user';

export enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACE = 'face',
  IRIS = 'iris',
  TOUCH_ID = 'touch_id',
  FACE_ID = 'face_id',
  WINDOWS_HELLO = 'windows_hello',
}

export interface BiometricMetadata {
  enrolledAt: string;
  lastVerified: string | null;
}

@Entity('biometric_credentials')
export class BiometricCredential {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, user => user.biometricCredentials)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'device_id' })
  deviceId!: string;

  @Column({
    type: 'enum',
    enum: BiometricType,
    name: 'biometric_type',
  })
  biometricType!: BiometricType;

  @Column({ name: 'biometric_key_hash' })
  biometricKeyHash!: string;

  @Column({ name: 'public_key', nullable: true })
  publicKey?: string;

  @Column({ name: 'key_handle', nullable: true })
  keyHandle?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: BiometricMetadata;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'last_used_at', nullable: true })
  lastUsedAt?: Date;
}

export interface BiometricEnrollRequest {
  userId: string;
  deviceId: string;
  biometricType: BiometricType;
  publicKey: string;
  keyHandle: string;
}

export interface BiometricAuthRequest {
  userId: string;
  deviceId: string;
  biometricType: BiometricType;
  challenge: string;
  signature: string;
}
