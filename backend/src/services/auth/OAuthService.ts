import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as AppleStrategy } from 'passport-apple';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import { Profile as AppleProfile } from 'passport-apple';
import { Profile as MicrosoftProfile } from 'passport-microsoft';
import { User } from '@echopages/shared';
import { AuthProvider, OAuthProfile } from '@echopages/shared';
import { UserRepository } from '../../repositories/UserRepository';
import { VerifyCallback } from 'passport-oauth2';
import { AuthProvider as AuthProviderType } from '@echopages/shared/types';

export class OAuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  configureGoogleStrategy(): GoogleStrategy {
    return new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email']
      },
      async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: VerifyCallback) => {
        try {
          const user = await this.handleOAuthUser({
            id: profile.id,
            email: profile.emails?.[0]?.value!,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value,
            provider: 'google',
            raw: profile._json
          });
          done(null, user);
        } catch (error) {
          done(error as Error);
        }
      }
    );
  }

  configureAppleStrategy(): typeof AppleStrategy {
    return new AppleStrategy(
      {
        clientID: process.env.APPLE_CLIENT_ID!,
        teamID: process.env.APPLE_TEAM_ID!,
        keyID: process.env.APPLE_KEY_ID!,
        privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION!,
        callbackURL: process.env.APPLE_CALLBACK_URL,
        scope: ['email', 'name'],
        passReqToCallback: false
      },
      async (accessToken: string, refreshToken: string, profile: AppleProfile, done: VerifyCallback) => {
        try {
          // Handle Apple OAuth verification
          const user = await this.handleOAuthUser('apple', profile);
          done(null, user);
        } catch (error) {
          done(error as Error);
        }
      }
    );
  }

  configureMicrosoftStrategy(): MicrosoftStrategy {
    return new MicrosoftStrategy(
      {
        clientID: process.env.MICROSOFT_CLIENT_ID!,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
        callbackURL: process.env.MICROSOFT_CALLBACK_URL,
        scope: ['user.read', 'user.email']
      },
      async (accessToken: string, refreshToken: string, profile: MicrosoftProfile, done: VerifyCallback) => {
        try {
          const user = await this.handleOAuthUser({
            id: profile.id,
            email: profile.emails?.[0]?.value!,
            name: profile.displayName,
            picture: profile._json.picture,
            provider: 'microsoft',
            raw: profile._json
          });
          done(null, user);
        } catch (error) {
          done(error as Error);
        }
      }
    );
  }

  private async handleOAuthUser(profile: OAuthProfile): Promise<User> {
    let user = await this.userRepository.findOne({
      where: {
        authProvider: profile.provider,
        authProviderId: profile.id
      }
    });

    if (!user) {
      // Check if user exists with the same email
      user = await this.userRepository.findOne({
        where: { email: profile.email }
      });

      if (user) {
        // If user exists but with different auth method, update their auth info
        user.authProvider = profile.provider;
        user.authProviderId = profile.id;
        user.authProviderData = profile.raw || {};
      } else {
        // Create new user
        user = this.userRepository.create({
          email: profile.email,
          username: this.generateUsername(profile.email),
          fullName: profile.name,
          avatarUrl: profile.picture,
          authProvider: profile.provider,
          authProviderId: profile.id,
          authProviderData: profile.raw || {}
        });
      }

      await this.userRepository.save(user);
    }

    return user;
  }

  private generateUsername(email: string): string {
    // Generate a username from email and add random numbers if needed
    const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${baseUsername}${randomSuffix}`;
  }
} 