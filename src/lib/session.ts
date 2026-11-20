import { cookies } from 'next/headers';
import { encrypt, decrypt } from './session-token';

export { encrypt, decrypt } from './session-token';

export async function createSession(userId: string, role: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ userId, role, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    expires: expiresAt,
    maxAge: 7 * 24 * 60 * 60,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: 0,
    expires: new Date(0),
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  return await decrypt(session);
}
