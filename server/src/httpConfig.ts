import cors from 'cors';
import type { Application } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

/** Atrás de Cloudflare, nginx ou outro proxy (necessário para rate limit por IP real). */
export function configureTrustProxy(app: Application): void {
  const v = process.env.TRUST_PROXY?.trim().toLowerCase();
  if (v === '1' || v === 'true' || v === 'yes') {
    app.set('trust proxy', 1);
  }
}

export function getCorsOrigin(): cors.CorsOptions['origin'] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw || raw === '*') return '*';
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (list.length === 0) return '*';
  return list.length === 1 ? list[0]! : list;
}

export function corsMiddleware() {
  return cors({ origin: getCorsOrigin() });
}

/** Cabeçalhos básicos; CSP desligado (HTML legal usa estilo inline). */
export function securityHeaders() {
  return helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });
}

/** Falhas de login (401) contam; acerto não consome o limite. */
export const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Math.max(5, Number(process.env.AUTH_LOGIN_RATE_LIMIT_MAX ?? 20)),
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente de novo daqui a pouco.' },
});

/** Novas contas por IP (inclui tentativas falhadas). */
export const authRegisterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Math.max(1, Number(process.env.AUTH_REGISTER_RATE_LIMIT_MAX ?? 8)),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitos registros a partir deste endereço. Tente mais tarde.' },
});

/** Pedidos de recuperação de senha por IP. */
export const authForgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Math.max(3, Number(process.env.AUTH_FORGOT_RATE_LIMIT_MAX ?? 10)),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitos pedidos de recuperação. Tente mais tarde.' },
});
