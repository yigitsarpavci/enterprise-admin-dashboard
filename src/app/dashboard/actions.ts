'use server';

import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getTodayLocal } from '@/lib/date';

export async function updateTaskStatusAction(taskId: string, newStatus: string) {
  try {
    const user = await requireAuth();

    const task = await prisma.employeeTask.findUnique({
      where: { id: taskId },
    });

    if (!task || task.employeeId !== user.id) {
      return { error: 'Unauthorized or mission not found.' };
    }

    await prisma.employeeTask.update({
      where: { id: taskId },
      data: { status: newStatus },
    });

    revalidatePath('/dashboard');
    return { success: 'Status synchronized.' };
  } catch (error) {
    console.error('Update status error:', error);
    return { error: 'Failed to sync status.' };
  }
}

export async function createReportAction(logs: Array<{ id?: string; description: string; minutes: number; taskId?: string }>) {
  try {
    const user = await requireAuth();
    const today = getTodayLocal();

    if (!logs || logs.length === 0) {
      return { error: 'Operational logs required.' };
    }

    const report = await prisma.dailyReport.upsert({
      where: {
        employeeId_date: {
          employeeId: user.id,
          date: today,
        },
      },
      update: {}, 
      create: {
        employeeId: user.id,
        date: today,
      },
    });

    // Strategy: Upsert existing, create new, delete missing is complex. 
    // Simplified: Delete non-provided ones and upsert the rest.
    const providedIds = logs.map(l => l.id).filter(Boolean) as string[];
    
    await prisma.workLogEntry.deleteMany({
      where: {
        dailyReportId: report.id,
        id: { notIn: providedIds }
      }
    });

    for (const log of logs) {
      if (log.id) {
        await prisma.workLogEntry.update({
          where: { id: log.id },
          data: {
            description: log.description,
            minutes: Number(log.minutes),
            taskId: log.taskId || null
          }
        });
      } else {
        await prisma.workLogEntry.create({
          data: {
            dailyReportId: report.id,
            description: log.description,
            minutes: Number(log.minutes),
            taskId: log.taskId || null
          }
        });
      }
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Create report error:', error);
    return { error: 'Failed to synchronize logs.' };
  }
}

export async function deleteWorkLogAction(id: string) {
  try {
    const user = await requireAuth();
    
    const log = await prisma.workLogEntry.findUnique({
      where: { id },
      include: { dailyReport: true }
    });

    if (!log || log.dailyReport.employeeId !== user.id) {
      return { error: 'Unauthorized.' };
    }

    await prisma.workLogEntry.delete({
      where: { id }
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Delete log error:', error);
    return { error: 'Deletion failed.' };
  }
}

export async function toggleRoutineAction(routineItemId: string, checked: boolean) {
  try {
    const user = await requireAuth();
    const today = getTodayLocal();

    const report = await prisma.dailyReport.upsert({
      where: {
        employeeId_date: {
          employeeId: user.id,
          date: today,
        },
      },
      update: {},
      create: {
        employeeId: user.id,
        date: today,
      },
    });

    await prisma.dailyRoutineCheck.upsert({
      where: {
        dailyReportId_routineItemId: {
          dailyReportId: report.id,
          routineItemId,
        },
      },
      update: { checked },
      create: {
        dailyReportId: report.id,
        routineItemId,
        checked,
      },
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Toggle routine error:', error);
    return { error: 'Failed to update routine.' };
  }
}
