import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Unauthorized ' });

  try {
    const token = auth.substring(7);
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      role?: string;
    };
    (req as any).user = { id: payload.sub, role: payload.role };
    next();
  } catch (error) {
    return res.status(404).json({ error: 'Invalid token' });
  }
}
