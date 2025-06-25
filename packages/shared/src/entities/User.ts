import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import type { AuthProvider } from '../types/auth';
import { Entry } from './Entry';
import { Folder } from './Folder';
import { Tag } from './Tag';
import { UserSettings } from './UserSettings';
import { BiometricCredential } from './BiometricCredential';
import { BaseEntity } from './BaseEntity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum OAuthProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
  MICROSOFT = 'microsoft',
}

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true, length: 50 })
  username!: string;

  @Column({
    name: 'auth_provider',
    type: 'enum',
    enum: ['google', 'apple', 'microsoft'],
    nullable: true,
  })
  authProvider?: AuthProvider;

  @Column({ name: 'auth_provider_id', nullable: true })
  authProviderId?: string;

  @Column({ name: 'auth_provider_data', type: 'jsonb', default: {} })
  authProviderData!: Record<string, any>;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken?: string;

  @Column({ name: 'full_name', length: 100, nullable: true })
  fullName?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Column({
    name: 'oauth_provider',
    type: 'enum',
    enum: OAuthProvider,
    nullable: true,
  })
  oauthProvider?: OAuthProvider;

  @Column({ name: 'oauth_id', nullable: true })
  oauthId?: string;

  @Column({ name: 'last_login_at', type: 'timestamp with time zone', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  @OneToOne(() => UserSettings, settings => settings.user)
  settings!: UserSettings;

  @OneToMany(() => Entry, entry => entry.user)
  entries!: Entry[];

  @OneToMany(() => Folder, folder => folder.user)
  folders!: Folder[];

  @OneToMany(() => Tag, tag => tag.user)
  tags!: Tag[];

  @OneToMany(() => BiometricCredential, credential => credential.user)
  biometricCredentials!: BiometricCredential[];
}
