import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import type { AppDb, UserRow } from '../db.js';
import {
  authForgotPasswordLimiter,
  authLoginLimiter,
  authRegisterLimiter,
} from '../httpConfig.js';
import { isMailConfigured, sendPasswordResetEmail } from '../mail.js';
import { signAccessToken, verifyAccessToken } from './tokens.js';
import { passwordResetPageHtml } from './reset-page-html.js';

async function tokenResponse(dbUser: UserRow, jwtSecret: string) {
  const accessToken = await signAccessToken(dbUser.id, dbUser.email, jwtSecret);
  return {
    accessToken,
    user: { id: dbUser.id, email: dbUser.email },
  };
}

export function createAuthRouter(db: AppDb, jwtSecret: string, publicOrigin: string) {
  const origin = publicOrigin.replace(/\/$/, '');
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

  r.post('/forgot-password', authForgotPasswordLimiter, async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    await db.deleteExpiredPasswordResets(Date.now());

    const respondOk = () =>
      res.json({
        ok: true,
        message:
          'Se existir uma conta com este e-mail, enviámos instruções para redefinir a senha.',
      });

    if (!email.includes('@')) {
      respondOk();
      return;
    }

    const user = await db.findByEmail(email);
    if (!user?.password_hash || !user.email) {
      respondOk();
      return;
    }

    await db.deletePasswordResetsForUser(user.id);
    const plain = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(plain).digest('hex');
    const ttlMs = Number(process.env.PASSWORD_RESET_TTL_MS ?? 3600000);
    await db.insertPasswordReset(user.id, tokenHash, Date.now() + ttlMs);

    const resetUrl = `${origin}/auth/reset-page?token=${encodeURIComponent(plain)}`;

    try {
      if (isMailConfigured()) {
        await sendPasswordResetEmail(user.email, resetUrl);
      } else {
        console.warn(
          '[auth] SMTP não configurado — link de recuperação (não expor em produção sem e-mail):',
          resetUrl,
        );
      }
    } catch (e) {
      console.error('[auth] Erro ao enviar e-mail de recuperação', e);
    }

    respondOk();
  });

  r.post('/reset-password', async (req, res) => {
    const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (token.length < 16 || password.length < 8) {
      res.status(400).json({ error: 'Token ou senha inválidos' });
      return;
    }
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const now = Date.now();
    const row = await db.findValidPasswordResetByTokenHash(tokenHash, now);
    if (!row) {
      res.status(400).json({ error: 'Link inválido ou expirado. Peça um novo.' });
      return;
    }
    const rounds = Math.min(12, Math.max(10, Number(process.env.BCRYPT_ROUNDS ?? 10)));
    const password_hash = await bcrypt.hash(password, rounds);
    await db.setUserPasswordHash(row.userId, password_hash);
    await db.markPasswordResetUsed(row.id, now);
    await db.deletePasswordResetsForUser(row.userId);
    res.json({ ok: true });
  });

  r.get('/reset-page', (req, res) => {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    res.type('html').send(passwordResetPageHtml(origin, token));
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
