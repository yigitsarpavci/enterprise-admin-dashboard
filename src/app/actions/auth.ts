'use server';

import { logout as authLogout, getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function logoutAction() {
  await authLogout();
}

export async function heartbeatAction() {
  const user = await getCurrentUser();
  if (!user) return;

  const now = new Date().toISOString();
  await prisma.$executeRaw`
    UPDATE User SET lastActiveAt = ${now} WHERE id = ${user.id}
  `;
}



