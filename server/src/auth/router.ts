import { Router } from 'express';
import type { AppDb, UserRow } from '../db.js';
import { authLoginLimiter, authRegisterLimiter } from '../httpConfig.js';
import { signAccessToken, verifyAccessToken } from './tokens.js';

async function tokenResponse(dbUser: UserRow, jwtSecret: string) {
  const accessToken = await signAccessToken(dbUser.id, dbUser.email, jwtSecret);
  return {
    accessToken,
    user: { id: dbUser.id, email: dbUser.email },
  };
}

export function createAuthRouter(db: AppDb, jwtSecret: string) {
  const r = Router();

  r.post('/register', authRegisterLimiter, async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email.includes('@') || email.length > 254) {
      res.status(400).json({ error: 'E-mail inválido' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres' });
      return;
    }
    if (await db.findByEmail(email)) {
      res.status(409).json({ error: 'Este e-mail já está cadastrado' });
      return;
    }
    const user = await db.createWithPassword(email, password);
    res.json(await tokenResponse(user, jwtSecret));
  });

  r.post('/login', authLoginLimiter, async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const user = await db.findByEmail(email);
    if (!user || !user.password_hash) {
      res.status(401).json({ error: 'E-mail ou senha incorretos' });
      return;
    }
    const ok = await db.verifyPassword(user, password);
    if (!ok) {
      res.status(401).json({ error: 'E-mail ou senha incorretos' });
      return;
    }
    res.json(await tokenResponse(user, jwtSecret));
  });

  r.get('/me', async (req, res) => {
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
    try {
      const claims = await verifyAccessToken(h.slice(7), jwtSecret);
      res.json({ user: { id: claims.sub, email: claims.email } });
    } catch {
      res.status(401).json({ error: 'unauthorized' });
    }
  });

  return r;
}
