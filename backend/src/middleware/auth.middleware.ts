import { Request, Response, NextFunction } from 'express';

const API_TOKEN = process.env.API_TOKEN || 'dev-token';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  if (token !== API_TOKEN) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }

  next();
}
