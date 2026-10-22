import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt, deleteSession } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  
  if (!sessionCookie) return null;

  const session = await decrypt(sessionCookie);
  if (!session?.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('[auth] getCurrentUser database error:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return user;
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
