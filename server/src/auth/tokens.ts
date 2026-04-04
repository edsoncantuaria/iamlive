import { SignJWT, jwtVerify } from 'jose';

const alg = 'HS256';

export type AccessClaims = {
  sub: string;
  email: string | null;
};

export async function signAccessToken(
  userId: string,
  email: string | null,
  secret: string,
): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('60d')
    .sign(new TextEncoder().encode(secret));
}

export async function verifyAccessToken(
  token: string,
  secret: string,
): Promise<AccessClaims> {
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
    algorithms: ['HS256'],
  });
  const sub = payload.sub;
  if (typeof sub !== 'string') throw new Error('invalid sub');
  const email = payload.email;
  return {
    sub,
    email: typeof email === 'string' ? email : null,
  };
}
