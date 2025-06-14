import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BiometricCredential } from './biometric';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export enum OAuthProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
  MICROSOFT = 'microsoft'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ name: 'first_name', nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: OAuthProvider,
    nullable: true,
    name: 'oauth_provider'
  })
  oauthProvider?: OAuthProvider;

  @Column({ name: 'oauth_id', nullable: true })
  oauthId?: string;

  @Column({ name: 'oauth_access_token', nullable: true })
  oauthAccessToken?: string;

  @Column({ name: 'oauth_refresh_token', nullable: true })
  oauthRefreshToken?: string;

  @Column({ name: 'oauth_expires_at', nullable: true })
  oauthExpiresAt?: Date;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Column({ default: false })
  verified!: boolean;

  @Column({ name: 'verification_token', nullable: true })
  verificationToken?: string;

  @Column({ name: 'reset_token', nullable: true })
  resetToken?: string;

  @Column({ name: 'reset_token_expires_at', nullable: true })
  resetTokenExpiresAt?: Date;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => BiometricCredential, credential => credential.user)
  biometricCredentials?: BiometricCredential[];
} 