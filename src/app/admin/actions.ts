'use server';

import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { getTranslation } from '@/lib/server-translations';

export async function createUserAction(prevState: any, formData: FormData) {
  const t = await getTranslation();
  try {
    await requireAdmin();

    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;
    const department = formData.get('department') as string;
    const position = formData.get('position') as string;

    // Simple validation
    if (!name || !password || !role) {
      return { error: t('errorRequired') };
    }

    // Check for duplicate username
    const existingUser = await prisma.user.findUnique({
      where: { name },
    });

    if (existingUser) {
      return { error: t('errorUserExists') };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and profile
    const emailSlug = name.toLowerCase().trim().replace(/\s+/g, '.');
    
    await prisma.user.create({
      data: {
        name,
        email: `${emailSlug}@company.com`, // Slugified email to prevent invalid formats
        passwordHash,
        role,
        employeeProfile: (department || position) ? {
          create: {
            department,
            position,
          }
        } : undefined,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/employees');
    return { success: t('successUserCreated') };
  } catch (error) {
    console.error('Create user error:', error);
    return { error: t('errorUserCreateFailed') };
  }
}

export async function deleteUserAction(userId: string) {
  const t = await getTranslation();
  try {
    const admin = await requireAdmin();

    // Prevent self-deletion
    if (admin.id === userId) {
      return { error: t('errorSelfTerminate') };
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/employees');
    return { success: t('successUserTerminated') };
  } catch (error) {
    console.error('Delete user error:', error);
    return { error: t('errorUserTerminateFailed') };
  }
}

export async function createTaskAction(prevState: any, formData: FormData) {
  const t = await getTranslation();
  try {
    await requireAdmin();

    const employeeId = formData.get('employeeId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const status = formData.get('status') as string;
    const deadlineString = formData.get('deadline') as string;

    if (!employeeId || !title || !status) {
      return { error: t('errorTaskParams') };
    }

    // Duplicate check: prevent exact same task for same user
    const existingTask = await prisma.employeeTask.findFirst({
      where: {
        employeeId,
        title,
        status: { not: 'COMPLETED' } // Allow if previous was completed
      }
    });

    if (existingTask) {
      return { error: t('errorTaskConflict') };
    }

    const deadline = deadlineString ? new Date(deadlineString) : null;

    await prisma.employeeTask.create({
      data: {
        employeeId,
        title,
        description,
        status,
        deadline,
      },
    });


    revalidatePath('/admin');
    revalidatePath('/admin/tasks');
    return { success: t('successTaskDeployed') };
  } catch (error) {
    console.error('Create task error:', error);
    return { error: t('errorTaskDeployFailed') };
  }
}

export async function bulkCreateTaskAction(employeeIds: string[], formData: FormData) {
  const t = await getTranslation();
  try {
    await requireAdmin();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const status = formData.get('status') as string;
    const deadlineString = formData.get('deadline') as string;

    if (!employeeIds.length || !title || !status) {
      return { error: t('errorTaskParams') };
    }

    const deadline = deadlineString ? new Date(deadlineString) : null;

    // Create tasks for all selected employees
    await prisma.employeeTask.createMany({
      data: employeeIds.map(id => ({
        employeeId: id,
        title,
        description,
        status,
        deadline,
      })),
    });

    revalidatePath('/admin');
    revalidatePath('/admin/tasks');
    revalidatePath('/admin/employees');
    return { success: t('successTaskDeployed') };
  } catch (error) {
    console.error('Bulk create task error:', error);
    return { error: t('errorTaskDeployFailed') };
  }
}

export async function bulkDeleteUsersAction(userIds: string[]) {
  const t = await getTranslation();
  try {
    const admin = await requireAdmin();

    // Prevent deleting self or empty list
    const filteredIds = userIds.filter(id => id !== admin.id);
    if (filteredIds.length === 0) {
      return { error: t('errorSelfTerminate') };
    }

    await prisma.user.deleteMany({
      where: { id: { in: filteredIds } },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/employees');
    return { success: t('successUserTerminated') };
  } catch (error) {
    console.error('Bulk delete users error:', error);
    return { error: t('errorUserTerminateFailed') };
  }
}



