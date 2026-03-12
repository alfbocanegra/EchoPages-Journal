import { Request, Response, RequestHandler } from 'express';
import { TOTPService } from '../../services/auth/TOTPService';
import { User } from '@echopages/shared';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user: User;
}

// In-memory store for demo; replace with DB in production
const userTOTPSecrets: Record<string, { secret: string; enabled: boolean }> = {};

export class TOTPController {
  static setup: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user?.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const userId = authReq.user.id;
    const secretObj = TOTPService.generateSecret(userId);
    userTOTPSecrets[userId] = { secret: secretObj.base32, enabled: false };

    try {
      const qr = await TOTPService.getQRCodeDataURL(secretObj.otpauth_url || '');
      res.json({ secret: secretObj.base32, otpauth_url: secretObj.otpauth_url, qr });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  };

  static verify: RequestHandler = (req: Request, res: Response): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user?.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const userId = authReq.user.id;
    const { token } = req.body;
    const record = userTOTPSecrets[userId];
    if (!record) {
      res.status(400).json({ error: 'No TOTP setup in progress' });
      return;
    }
    const valid = TOTPService.verifyToken(record.secret, token);
    if (!valid) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    userTOTPSecrets[userId].enabled = true;
    res.json({ success: true });
  };

  static disable: RequestHandler = (req: Request, res: Response): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user?.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const userId = authReq.user.id;
    if (userTOTPSecrets[userId]) {
      userTOTPSecrets[userId].enabled = false;
    }
    res.json({ success: true });
  };

  static status: RequestHandler = (req: Request, res: Response): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user?.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const userId = authReq.user.id;
    const enabled = !!userTOTPSecrets[userId]?.enabled;
    res.json({ enabled });
  };
}
