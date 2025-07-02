import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@echopages/shared';
import fetch from 'node-fetch';
import { UserRepository } from '../repositories/UserRepository';
import { OAuthService } from '../services/auth/OAuthService';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Helper to verify Google ID token
async function verifyGoogleToken(token: string) {
  // Google's tokeninfo endpoint (for dev/demo; for prod, use public keys)
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
  if (!res.ok) throw new Error('Invalid Google ID token');
  const data = await res.json() as { sub: string; email: string; name?: string };
  // data.sub is the user's unique Google ID
  return { id: data.sub, email: data.email, name: data.name, provider: 'google', raw: data };
}

// Helper to verify Dropbox token (scaffold)
async function verifyDropboxToken(token: string) {
  // Dropbox token introspection endpoint (not public, so just fetch user info for now)
  const res = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Invalid Dropbox token');
  const data = await res.json() as any;
  return { id: data.account_id, email: data.email, name: data.name?.display_name, provider: 'dropbox', raw: data };
}

// Helper to verify Apple token (scaffold)
async function verifyAppleToken(token: string) {
  // In production, verify Apple ID token signature and claims
  // For now, just decode the JWT and trust it (NOT SECURE)
  const [header, payload] = token.split('.');
  if (!payload) throw new Error('Invalid Apple token');
  const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as { sub: string; email?: string; name?: string };
  return { id: data.sub, email: data.email, name: data.name, provider: 'apple', raw: data };
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const provider = req.body.provider || req.query.provider;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Get UserRepository and OAuthService from app context
    const userRepository: UserRepository = req.app.get('userRepository');
    const oauthService: OAuthService = req.app.get('oauthService');

    let user: any = null;
    if (provider === 'dropbox') {
      const dropboxUser = await verifyDropboxToken(token);
      user = await oauthService.handleOAuthUser({
        id: dropboxUser.id,
        email: dropboxUser.email || '',
        name: dropboxUser.name,
        provider: 'dropbox',
        raw: dropboxUser.raw,
      });
    } else if (provider === 'apple') {
      const appleUser = await verifyAppleToken(token);
      user = await oauthService.handleOAuthUser({
        id: appleUser.id,
        email: appleUser.email || '',
        name: appleUser.name,
        provider: 'apple',
        raw: appleUser.raw,
      });
    } else if (token.split('.').length === 3) {
      try {
        const googleUser = await verifyGoogleToken(token);
        user = await oauthService.handleOAuthUser({
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          provider: 'google',
          raw: googleUser.raw,
        });
      } catch (e) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
          user = await userRepository.findOne({ where: { id: decoded.userId } });
        } catch (jwtErr) {
          throw new Error('Invalid token');
        }
      }
    } else {
      throw new Error('Invalid token format');
    }

    if (!user) throw new Error('Authentication failed');
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};
