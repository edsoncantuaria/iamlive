import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import type { AppDb } from '../db.js';
import { verifyAccessToken } from '../auth/tokens.js';
import { parseSyncPayload } from './payload.js';

type AuthedRequest = Request & { userId: string };

function bearerAuth(jwtSecret: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
    try {
      const claims = await verifyAccessToken(h.slice(7), jwtSecret);
      (req as AuthedRequest).userId = claims.sub;
      next();
    } catch {
      res.status(401).json({ error: 'unauthorized' });
    }
  };
}

export function createSyncRouter(db: AppDb, jwtSecret: string) {
  const r = Router();
  r.use(bearerAuth(jwtSecret));

  r.get('/state', async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const row = await db.getUserSyncState(userId);
    if (!row) {
      res.status(404).json({ error: 'no_state' });
      return;
    }
    res.json({
      updatedAt: row.updatedAt,
      ...row.payload,
    });
  });

  r.put('/state', async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const parsed = parseSyncPayload(req.body);
    if (!parsed) {
      res.status(400).json({ error: 'Payload inválido' });
      return;
    }
    const updatedAt = Date.now();
    await db.upsertUserSyncState(userId, parsed, updatedAt);
    res.json({ ok: true, updatedAt });
  });

  return r;
}
