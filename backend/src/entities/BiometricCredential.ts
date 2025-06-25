import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BiometricType } from '@echopages/shared';
import { User } from './User';

@Entity('biometric_credentials')
export class BiometricCredential {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'device_id' })
  deviceId!: string;

  @Column({
    name: 'biometric_type',
    type: 'enum',
    enum: ['face_id', 'touch_id', 'windows_hello', 'fingerprint'],
  })
  biometricType!: BiometricType;

  @Column({ name: 'biometric_key_hash' })
  biometricKeyHash!: string;

  @Column({ name: 'public_key', nullable: true })
  publicKey?: string;

  @Column({ name: 'key_handle', nullable: true })
  keyHandle?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  @Column({ name: 'last_used_at', type: 'timestamp with time zone', nullable: true })
  lastUsedAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user: User) => user.biometricCredentials)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
