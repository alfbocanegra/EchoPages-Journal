import express, { Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Google OAuth
router.get('/google', (req: Request, res: Response) => {
  // Force mock authentication in development mode
  if (process.env.NODE_ENV !== 'production') {
    const mockUser = {
      id: 'google_user_' + Date.now(),
      provider: 'google',
      email: 'user@gmail.com',
      name: 'Google User',
      cloudProvider: 'google_drive',
    };
    const token = jwt.sign({ userId: mockUser.id }, process.env.JWT_SECRET || 'changeme', {
      expiresIn: '7d',
    });
    res.redirect(`http://localhost:3000/auth/callback?token=${token}&provider=google`);
    return;
  }

  // Use Google OAuth if credentials are configured (production only)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
    return;
  }

  // Fallback error for production without credentials
  res.status(500).json({ error: 'Google OAuth not configured' });
});

router.get('/google/callback', (req: Request, res: Response): void => {
  // Force mock authentication in development mode
  if (process.env.NODE_ENV !== 'production') {
    const mockUser = {
      id: 'google_user_' + Date.now(),
      provider: 'google',
      email: 'user@gmail.com',
      name: 'Google User',
      cloudProvider: 'google_drive',
    };
    const token = jwt.sign({ userId: mockUser.id }, process.env.JWT_SECRET || 'changeme', {
      expiresIn: '7d',
    });
    res.redirect(`http://localhost:3000/auth/callback?token=${token}&provider=google`);
    return;
  }

  // Use Google OAuth callback if credentials are configured (production only)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.authenticate('google', { failureRedirect: '/login', session: false })(req, res, () => {
      if (!req.user) {
        res.redirect(`http://localhost:3000/auth/callback?error=auth_failed&provider=google`);
        return;
      }
      const token = jwt.sign({ userId: (req.user as any).id }, process.env.JWT_SECRET!, {
        expiresIn: '7d',
      });
      res.redirect(`http://localhost:3000/auth/callback?token=${token}&provider=google`);
    });
    return;
  }

  // Fallback error for production without credentials
  res.status(500).json({ error: 'Google OAuth not configured' });
});

// Apple OAuth
router.get('/apple', (req: Request, res: Response) => {
  // For development - simulate Apple OAuth success
  if (process.env.NODE_ENV !== 'production') {
    const mockUser = {
      id: 'apple_user_' + Date.now(),
      provider: 'apple',
      email: 'user@icloud.com',
      name: 'Apple User',
      cloudProvider: 'icloud',
    };
    const token = jwt.sign({ userId: mockUser.id }, process.env.JWT_SECRET || 'changeme', {
      expiresIn: '7d',
    });
    res.redirect(`http://localhost:3000/auth/callback?token=${token}&provider=apple`);
    return;
  }
  // Production: Use passport authentication
  passport.authenticate('apple')(req, res);
});
router.get('/apple/callback', (req: Request, res: Response): void => {
  // For development - simulate successful callback
  if (process.env.NODE_ENV !== 'production') {
    const mockUser = {
      id: 'apple_user_' + Date.now(),
      provider: 'apple',
      email: 'user@icloud.com',
      name: 'Apple User',
      cloudProvider: 'icloud',
    };
    const token = jwt.sign({ userId: mockUser.id }, process.env.JWT_SECRET || 'changeme', {
      expiresIn: '7d',
    });
    res.redirect(`http://localhost:3000/auth/callback?token=${token}&provider=apple`);
    return;
  }

  // Production: Use passport authentication
  passport.authenticate('apple', { failureRedirect: '/login', session: false })(req, res, () => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication failed' });
      return;
    }
    const token = jwt.sign({ userId: (req.user as any).id }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });
    res.json({ user: req.user, token });
  });
});

// Dropbox OAuth
router.get('/dropbox', (req: Request, res: Response) => {
  // Force mock authentication in development mode
  if (process.env.NODE_ENV !== 'production') {
    const mockUser = {
      id: 'dropbox_user_' + Date.now(),
      provider: 'dropbox',
      email: 'user@dropbox.com',
      name: 'Dropbox User',
      cloudProvider: 'dropbox',
    };
    const token = jwt.sign({ userId: mockUser.id }, process.env.JWT_SECRET || 'changeme', {
      expiresIn: '7d',
    });
    res.redirect(`http://localhost:3000/auth/callback?token=${token}&provider=dropbox`);
    return;
  }

  // Use Dropbox OAuth if credentials are configured (production only)
  if (process.env.DROPBOX_CLIENT_ID && process.env.DROPBOX_CLIENT_SECRET) {
    const authUrl =
      `https://www.dropbox.com/oauth2/authorize?` +
      `client_id=${process.env.DROPBOX_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent('http://localhost:3001/auth/oauth/dropbox/callback')}&` +
      `response_type=code&` +
      `state=${Date.now()}`;
    res.redirect(authUrl);
    return;
  }

  // Fallback error for production without credentials
  res.status(500).json({ error: 'Dropbox OAuth not configured' });
});

router.get('/dropbox/callback', async (req: Request, res: Response) => {
  // Force mock authentication in development mode
  if (process.env.NODE_ENV !== 'production') {
    const mockUser = {
      id: 'dropbox_user_' + Date.now(),
      provider: 'dropbox',
      email: 'user@dropbox.com',
      name: 'Dropbox User',
      cloudProvider: 'dropbox',
    };
    const token = jwt.sign({ userId: mockUser.id }, process.env.JWT_SECRET || 'changeme', {
      expiresIn: '7d',
    });
    res.redirect(`http://localhost:3000/auth/callback?token=${token}&provider=dropbox`);
    return;
  }

  // Use Dropbox OAuth callback if credentials are configured (production only)
  if (process.env.DROPBOX_CLIENT_ID && process.env.DROPBOX_CLIENT_SECRET) {
    const { code, error } = req.query;

    if (error) {
      res.redirect(`http://localhost:3000/auth/callback?error=${error}&provider=dropbox`);
      return;
    }

    if (!code) {
      res.redirect(`http://localhost:3000/auth/callback?error=no_code&provider=dropbox`);
      return;
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: code as string,
          grant_type: 'authorization_code',
          client_id: process.env.DROPBOX_CLIENT_ID,
          client_secret: process.env.DROPBOX_CLIENT_SECRET,
          redirect_uri: 'http://localhost:3001/auth/oauth/dropbox/callback',
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error((tokenData as any).error_description || 'Token exchange failed');
      }

      // Get user info
      const userResponse = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${(tokenData as any).access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const user = {
        id: `dropbox_${(userData as any).account_id}`,
        provider: 'dropbox',
        email: (userData as any).email,
        name: (userData as any).name.display_name,
        cloudProvider: 'dropbox',
        accessToken: (tokenData as any).access_token,
      };

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'changeme', {
        expiresIn: '7d',
      });

      res.redirect(`http://localhost:3000/auth/callback?token=${token}&provider=dropbox`);
    } catch (error) {
      console.error('Dropbox OAuth error:', error);
      res.redirect(`http://localhost:3000/auth/callback?error=oauth_failed&provider=dropbox`);
    }
    return;
  }

  // Fallback error for production without credentials
  res.status(500).json({ error: 'Dropbox OAuth not configured' });
});

export default router;
