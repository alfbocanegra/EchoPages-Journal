import express, { Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication failed' });
    return;
  }
  // Issue JWT
  const token = jwt.sign({ userId: (req.user as any).id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  // TODO: Set JWT as secure cookie for production
  res.json({ user: req.user, token });
});

// Apple OAuth
router.get('/apple', passport.authenticate('apple'));
router.get('/apple/callback', passport.authenticate('apple', { failureRedirect: '/login', session: false }), (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication failed' });
    return;
  }
  const token = jwt.sign({ userId: (req.user as any).id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  res.json({ user: req.user, token });
});

// Facebook OAuth (placeholder)
router.get('/facebook', (req: Request, res: Response) => {
  res.status(501).json({ error: 'Facebook OAuth not implemented yet.' });
});
router.get('/facebook/callback', (req: Request, res: Response) => {
  res.status(501).json({ error: 'Facebook OAuth not implemented yet.' });
});

// Twitter OAuth (placeholder)
router.get('/twitter', (req: Request, res: Response) => {
  res.status(501).json({ error: 'Twitter OAuth not implemented yet.' });
});
router.get('/twitter/callback', (req: Request, res: Response) => {
  res.status(501).json({ error: 'Twitter OAuth not implemented yet.' });
});

export default router; 