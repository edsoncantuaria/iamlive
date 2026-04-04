import { SERVER_URL } from '../config';

export type MeResponse = { user: { id: string; email: string | null } };
export type AuthOkResponse = { accessToken: string; user: { id: string; email: string | null } };
export type AuthErrResponse = { error: string };

export async function authMe(accessToken: string): Promise<MeResponse> {
  const r = await fetch(`${SERVER_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) throw new Error('Sessão inválida');
  return r.json() as Promise<MeResponse>;
}

export async function authLogin(email: string, password: string): Promise<AuthOkResponse> {
  const r = await fetch(`${SERVER_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = (await r.json()) as AuthOkResponse | AuthErrResponse;
  if (!r.ok) throw new Error('error' in j ? j.error : 'Falha no login');
  return j as AuthOkResponse;
}

export async function authRegister(email: string, password: string): Promise<AuthOkResponse> {
  const r = await fetch(`${SERVER_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = (await r.json()) as AuthOkResponse | AuthErrResponse;
  if (!r.ok) throw new Error('error' in j ? j.error : 'Não foi possível criar a conta');
  return j as AuthOkResponse;
}

export type ForgotPasswordResponse = { ok: boolean; message?: string };

export async function authForgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const r = await fetch(`${SERVER_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
  });
  return r.json() as Promise<ForgotPasswordResponse>;
}

export async function authResetPassword(token: string, password: string): Promise<void> {
  const r = await fetch(`${SERVER_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: token.trim(), password }),
  });
  const j = (await r.json()) as { ok?: boolean; error?: string };
  if (!r.ok) throw new Error(j.error ?? 'Não foi possível redefinir a senha');
}
