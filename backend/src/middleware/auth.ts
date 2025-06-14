import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@echopages/shared';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // Add user to request for use in route handlers
    req.user = { id: decoded.userId } as User;

    next();
  } catch (error) {
    console.error('Authentication failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}; 