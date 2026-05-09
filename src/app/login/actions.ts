'use server';

import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { createSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getTranslation } from '@/lib/server-translations';

export async function loginAction(prevState: any, formData: FormData) {
  const t = await getTranslation();
  const name = formData.get('name') as string;
  const password = formData.get('password') as string;
  const redirectTo = formData.get('redirectTo') as string;

  if (!name || !password) {
    return { error: t('errorLoginRequired') };
  }

  // Find the user by name
  const user = await prisma.user.findFirst({
    where: { name },
  });

  if (!user) {
    return { error: t('errorInvalidCredentials') };
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return { error: t('errorInvalidCredentials') };
  }

  // Create secure session
  await createSession(user.id, user.role);

  // Redirect to intended destination or default based on role
  if (redirectTo && redirectTo.startsWith('/')) {
    redirect(redirectTo);
  } else if (user.role === 'ADMIN') {
    redirect('/admin');
  } else {
    redirect('/dashboard');
  }
}

