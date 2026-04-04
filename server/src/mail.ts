import nodemailer from 'nodemailer';
import {
  buildPasswordResetEmailContent,
  formatPasswordResetTtl,
} from './mail/password-reset-html.js';

function resolveFromAddress(): string | null {
  const single = process.env.SMTP_FROM?.trim();
  if (single) return single;
  const email = process.env.SMTP_FROM_EMAIL?.trim();
  if (!email) return null;
  const name = (process.env.SMTP_FROM_NAME?.trim() || 'Estou Vivo').replace(/"/g, '');
  return `${name} <${email}>`;
}

export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST?.trim() && resolveFromAddress());
}

function smtpSecureForPort(port: number): boolean {
  const v = process.env.SMTP_SECURE?.trim().toLowerCase();
  if (v === 'true' || v === '1') return true;
  if (v === 'false' || v === '0') return false;
  return port === 465;
}

/**
 * Envia e-mail de redefinição de senha.
 * Variáveis: SMTP_HOST; SMTP_FROM ou (SMTP_FROM_EMAIL + opcional SMTP_FROM_NAME);
 * SMTP_PORT (587); SMTP_USER / SMTP_PASSWORD ou SMTP_PASS; opcional SMTP_SECURE.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();
  const from = resolveFromAddress();
  if (!host || !from) {
    throw new Error('SMTP não configurado (SMTP_HOST e SMTP_FROM ou SMTP_FROM_EMAIL)');
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD ?? process.env.SMTP_PASS;
  const secure = smtpSecureForPort(port);

  const ttlMs = Number(process.env.PASSWORD_RESET_TTL_MS ?? 3600000);
  const ttlLabel = formatPasswordResetTtl(ttlMs);
  const { html, text } = buildPasswordResetEmailContent(resetUrl, ttlLabel);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    ...(user ? { auth: { user, pass: String(pass ?? '') } } : {}),
  });

  await transporter.sendMail({
    from,
    to,
    subject: 'Estou Vivo — redefinir a sua palavra-passe',
    text,
    html,
  });
}
