import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { AuthProvider, Entry, Folder, Tag, UserSettings } from '@echopages/shared/dist';
import { BiometricCredential } from './BiometricCredential';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true, length: 50 })
  username!: string;

  @Column({ name: 'auth_provider', type: 'enum', enum: ['google', 'apple', 'microsoft'], nullable: true })
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

  @Column({ name: 'last_login_at', type: 'timestamp with time zone', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  @OneToOne(() => UserSettings, (settings: UserSettings) => settings.user)
  settings!: UserSettings;

  @OneToMany(() => Entry, (entry: Entry) => entry.user)
  entries!: Entry[];

  @OneToMany(() => Folder, (folder: Folder) => folder.user)
  folders!: Folder[];

  @OneToMany(() => Tag, (tag: Tag) => tag.user)
  tags!: Tag[];

  @OneToMany(() => BiometricCredential, (credential: BiometricCredential) => credential.user)
  biometricCredentials!: BiometricCredential[];
} 