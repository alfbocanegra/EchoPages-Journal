import { Request, Response } from 'express';
import { WebAuthnService } from '../../services/auth/WebAuthnService';
import { BiometricType } from '@echopages/shared';
import { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/server';

// Extend session interface for WebAuthn
declare module 'express-session' {
  interface SessionData {
    webAuthnChallengeId?: string;
  }
}

export class WebAuthnController {
  constructor(private webAuthnService: WebAuthnService) {}

  /**
   * Start WebAuthn registration process
   * @route POST /auth/webauthn/register/start
   */
  async startRegistration(req: Request, res: Response) {
    try {
      const { userId, deviceName, biometricType } = req.body;

      if (!userId || !deviceName || !biometricType) {
        return res.status(400).json({
          error: 'Missing required fields: userId, deviceName, biometricType',
        });
      }

      if (!Object.values(BiometricType).includes(biometricType)) {
        return res.status(400).json({
          error: 'Invalid biometric type',
        });
      }

      const options = await this.webAuthnService.generateRegistrationOptions(
        userId,
        deviceName,
        biometricType
      );

      return res.json(options);
    } catch (error) {
      console.error('WebAuthn registration start failed:', error);
      return res.status(500).json({
        error: 'Failed to start registration',
      });
    }
  }

  /**
   * Complete WebAuthn registration process
   * @route POST /auth/webauthn/register/complete
   */
  async completeRegistration(req: Request, res: Response) {
    try {
      const { userId, deviceName, biometricType, response } = req.body;

      if (!userId || !deviceName || !biometricType || !response) {
        return res.status(400).json({
          error: 'Missing required fields: userId, deviceName, biometricType, response',
        });
      }

      if (!Object.values(BiometricType).includes(biometricType)) {
        return res.status(400).json({
          error: 'Invalid biometric type',
        });
      }

      const credential = await this.webAuthnService.verifyRegistration(
        userId,
        response as RegistrationResponseJSON,
        deviceName,
        biometricType
      );

      return res.json({
        message: 'Registration successful',
        credential,
      });
    } catch (error) {
      console.error('WebAuthn registration completion failed:', error);
      return res.status(500).json({
        error: 'Failed to complete registration',
      });
    }
  }

  /**
   * Start WebAuthn authentication process
   * @route POST /auth/webauthn/authenticate/start
   */
  async startAuthentication(req: Request, res: Response) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          error: 'Missing required field: userId',
        });
      }

      const { options, challengeId } = await this.webAuthnService.generateAuthenticationOptions(
        userId
      );

      // Store challengeId in session for verification
      req.session.webAuthnChallengeId = challengeId;

      return res.json(options);
    } catch (error) {
      console.error('WebAuthn authentication start failed:', error);
      return res.status(500).json({
        error: 'Failed to start authentication',
      });
    }
  }

  /**
   * Complete WebAuthn authentication process
   * @route POST /auth/webauthn/authenticate/complete
   */
  async completeAuthentication(req: Request, res: Response) {
    try {
      const { userId, response } = req.body;
      const challengeId = req.session.webAuthnChallengeId;

      if (!userId || !response || !challengeId) {
        return res.status(400).json({
          error: 'Missing required fields: userId, response, or invalid session',
        });
      }

      const verified = await this.webAuthnService.verifyAuthentication(
        userId,
        response as AuthenticationResponseJSON,
        challengeId
      );

      if (verified) {
        // Clear the challenge from session
        delete req.session.webAuthnChallengeId;

        return res.json({
          message: 'Authentication successful',
        });
      }

      return res.status(401).json({
        error: 'Authentication failed',
      });
    } catch (error) {
      console.error('WebAuthn authentication completion failed:', error);
      return res.status(500).json({
        error: 'Failed to complete authentication',
      });
    }
  }
}
