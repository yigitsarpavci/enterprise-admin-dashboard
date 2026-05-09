import prisma from './prisma';
import { getTodayLocal } from './date';

export async function getAdminStats(range: string = '7days', startParam?: string, endParam?: string) {
  const today = getTodayLocal();
  
  // Date Filter Logic
  let dateFilter: any = {};
  let prevDateFilter: any = {};
  
  if (range === 'today') {
    dateFilter = { gte: today };
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    prevDateFilter = { gte: yesterday, lt: today };
  } else if (range === '7days') {
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    dateFilter = { gte: sevenDaysAgo };
    const prevSevenDaysAgo = new Date(sevenDaysAgo);
    prevSevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    prevDateFilter = { gte: prevSevenDaysAgo, lt: sevenDaysAgo };
  } else if (range === '30days') {
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    dateFilter = { gte: thirtyDaysAgo };
    const prevThirtyDaysAgo = new Date(thirtyDaysAgo);
    prevThirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    prevDateFilter = { gte: prevThirtyDaysAgo, lt: thirtyDaysAgo };
  } else if (range === 'custom' && startParam && endParam) {
    const startDate = new Date(startParam);
    startDate.setHours(0,0,0,0);
    const endDate = new Date(endParam);
    endDate.setHours(23,59,59,999);
    dateFilter = { gte: startDate, lte: endDate };
    prevDateFilter = dateFilter;
  } else {
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    dateFilter = { gte: sevenDaysAgo };
  }

  const totalEmployees = await prisma.user.count({ where: { role: 'USER' } });
  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
  const onlineEmployees = await prisma.user.count({ 
    where: { role: 'USER', lastActiveAt: { gte: fiveMinsAgo } } 
  });

  const rangeReports = await prisma.dailyReport.findMany({
    where: { date: dateFilter },
    include: { workLogs: true, routineChecks: true }
  });

  const currentWorkMins = rangeReports.reduce((acc, r) => 
    acc + r.workLogs.reduce((lAcc, l) => lAcc + l.minutes, 0), 0
  );

  const routineItems = await prisma.routineItem.findMany({ where: { isActive: true } });
  const totalPossibleRoutines = rangeReports.length * (routineItems.length || 1);
  const totalCheckedRoutines = rangeReports.flatMap(r => r.routineChecks).filter(c => c.checked).length;
  const currentRoutinePercent = totalPossibleRoutines > 0 ? (totalCheckedRoutines / totalPossibleRoutines) * 100 : 0;

  const currentTasks = await prisma.employeeTask.count({
    where: { status: 'COMPLETED', updatedAt: dateFilter }
  });

  const prevReports = await prisma.dailyReport.findMany({
    where: { date: prevDateFilter },
    include: { workLogs: true, routineChecks: true }
  });

  const prevWorkMins = prevReports.reduce((acc, r) => 
    acc + r.workLogs.reduce((lAcc, l) => lAcc + l.minutes, 0), 0
  );

  const prevPossibleRoutines = prevReports.length * (routineItems.length || 1);
  const prevCheckedRoutines = prevReports.flatMap(r => r.routineChecks).filter(c => c.checked).length;
  const prevRoutinePercent = prevPossibleRoutines > 0 ? (prevCheckedRoutines / prevPossibleRoutines) * 100 : 0;

  const prevTasks = await prisma.employeeTask.count({
    where: { status: 'COMPLETED', updatedAt: prevDateFilter }
  });

  return {
    totalEmployees,
    onlineEmployees,
    currentWorkMins,
    currentRoutinePercent,
    currentTasks,
    workTrend: prevWorkMins > 0 ? ((currentWorkMins - prevWorkMins) / prevWorkMins) * 100 : 0,
    taskTrend: prevTasks > 0 ? ((currentTasks - prevTasks) / prevTasks) * 100 : 0,
    routineTrend: currentRoutinePercent - prevRoutinePercent,
    rangeReportsCount: rangeReports.length,
    dateFilter
  };
}

export async function getUserDashboardStats(userId: string) {
  const today = getTodayLocal();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const effortReports = await prisma.dailyReport.findMany({
    where: {
      employeeId: userId,
      date: { gte: sevenDaysAgo }
    },
    include: { workLogs: true }
  });

  let totalMinutes = 0;
  effortReports.forEach(r => {
    r.workLogs.forEach(log => {
      totalMinutes += log.minutes;
    });
  });

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const effortStr = hours > 0 ? `${hours}h ${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;

  return {
    effortStr,
    totalMinutes
  };
}
