import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'UserId required' }, { status: 400 });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  try {
    // 1. Total Effort
    const reports = await prisma.dailyReport.findMany({
      where: {
        employeeId: userId,
        date: { gte: sevenDaysAgo }
      },
      select: { 
        workLogs: {
          select: { minutes: true }
        }
      }
    });
    
    let totalMinutes = 0;
    reports.forEach(r => {
      r.workLogs.forEach(log => {
        totalMinutes += log.minutes;
      });
    });

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const effortStr = hours > 0 ? `${hours}h ${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;

    // 2. Routine Discipline
    const latestReport = await prisma.dailyReport.findFirst({
      where: { employeeId: userId },
      orderBy: { date: 'desc' },
      include: {
        routineChecks: true
      }
    });

    let discipline = 0;
    if (latestReport && latestReport.routineChecks.length > 0) {
      const checked = latestReport.routineChecks.filter(c => c.checked).length;
      discipline = Math.round((checked / latestReport.routineChecks.length) * 100);
    }

    // 3. Mission Success
    const totalTasks = await prisma.employeeTask.count({ where: { employeeId: userId } });
    const completedTasks = await prisma.employeeTask.count({ where: { employeeId: userId, status: 'COMPLETED' } });
    const missionSuccess = `${completedTasks}/${totalTasks}`;

    // 4. Last Sync (Precision Turkey Time Calibration)
    const lastSyncStr = new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Istanbul'
    }).format(new Date());

    return NextResponse.json({
      totalEffort: effortStr,
      routineDiscipline: discipline,
      missionSuccess,
      lastSync: lastSyncStr
    });
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
