import { SignJWT, jwtVerify } from 'jose';

export type SessionClaims = { userId: string; role: string; expiresAt: string };

/**
 * Resolved lazily so that `next build` (NODE_ENV=production) does not fail at import time;
 * signing or verifying in production without SESSION_SECRET is a hard error.
 */
function getKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET must be set in production.');
    }
    return new TextEncoder().encode('dev-only-insecure-session-secret');
  }
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getKey());
}

export async function decrypt(session: string | undefined = ''): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(session, getKey(), { algorithms: ['HS256'] });
    return payload as unknown as SessionClaims;
  } catch {
    return null;
  }
}
