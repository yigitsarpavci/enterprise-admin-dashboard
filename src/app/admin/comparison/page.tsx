import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { AdminChartCard } from '@/components/AdminCharts';
import { parseLocalDate } from '@/lib/date';
import { getTranslation } from '@/lib/server-translations';
import HistoryFilters from '@/components/HistoryFilters';

export default async function ComparisonPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();
  const t = await getTranslation();
  const params = await searchParams;

  const department = params.department as string;
  const range = params.range as string || '30days';
  const startParam = params.start as string;
  const endParam = params.end as string;

  const today = new Date();
  let startDate: Date;
  let endDate: Date = new Date();

  if (range === 'today') {
    startDate = new Date(today);
    startDate.setHours(0,0,0,0);
  } else if (range === '7days') {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 7);
  } else if (range === '30days') {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 30);
  } else if (range === 'custom' && startParam && endParam) {
    startDate = parseLocalDate(startParam);
    endDate = parseLocalDate(endParam);
    endDate.setHours(23, 59, 59, 999);
  } else {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 30);
  }

  const departments = await prisma.employeeProfile.findMany({
    select: { department: true },
    distinct: ['department'],
    where: { department: { not: null } },
  });

  const routineItems = await prisma.routineItem.findMany({ where: { isActive: true } });

  const users = await prisma.user.findMany({
    where: {
      role: 'USER',
      employeeProfile: department ? { department } : undefined
    },
    include: {
      employeeProfile: true,
      dailyReports: {
        where: { date: { gte: startDate, lte: endDate } },
        include: { workLogs: true, routineChecks: true }
      },
      tasks: {
        where: { status: 'COMPLETED', updatedAt: { gte: startDate, lte: endDate } }
      }
    }
  });

  const comparisons = users.map(user => {
    const totalMinutes = user.dailyReports.reduce((acc, r) => acc + r.workLogs.reduce((lAcc, l) => lAcc + l.minutes, 0), 0);
    const activeDays = user.dailyReports.length;
    const completedTasks = user.tasks.length;
    const routineChecks = user.dailyReports.flatMap(r => r.routineChecks);
    const totalChecked = routineChecks.filter(c => c.checked).length;
    const totalPossible = user.dailyReports.length * (routineItems.length || 1);
    const overallRoutinePercent = totalPossible > 0 ? (totalChecked / totalPossible) * 100 : 0;

    return {
      id: user.id,
      name: user.name,
      department: user.employeeProfile?.department || 'General',
      totalMinutes: Math.round(totalMinutes),
      activeDays,
      completedTasks,
      overallRoutinePercent,
    };
  });

  const rankedWorkTime = [...comparisons].sort((a, b) => b.totalMinutes - a.totalMinutes);
  const rankedRoutine = [...comparisons].sort((a, b) => b.overallRoutinePercent - a.overallRoutinePercent);
  const companyAvgMinutes = rankedWorkTime.length > 0 ? rankedWorkTime.reduce((acc, c) => acc + c.totalMinutes, 0) / rankedWorkTime.length : 0;
  const topEmployee = rankedWorkTime[0] || null;

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 fade-in">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-20">
        <div>
          <h1 className="text-4xl heading-premium text-zinc-900 dark:text-white uppercase tracking-tight">
            {t('efficiency')} <span className="text-zinc-400">{t('leaderboard')}</span>
          </h1>
          <p className="mt-4 subheading-premium">
            {t('competitiveAnalysis')} &bull; {t('benchmarkingDescription')}
          </p>
        </div>
        <Link href="/admin" className="btn-secondary">{t('adminConsole')}</Link>
      </div>

      <div className="flex flex-col gap-8 mb-20">
        <HistoryFilters />
        <div className="flex flex-wrap items-center gap-3">
          <span className="subheading-premium !mb-0 !tracking-[0.1em]">{t('department')}:</span>
          <Link href="/admin/comparison" className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${!department ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 shadow-lg' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400'}`}>{t('allDepartments')}</Link>
          {departments.map(d => (
            <Link key={d.department} href={`/admin/comparison?department=${d.department}`} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${department === d.department ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 shadow-lg' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400'}`}>{d.department}</Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        <ProfessionalStat label={t('peakPerformer')} value={topEmployee?.name || 'N/A'} subValue={`${Math.floor((topEmployee?.totalMinutes || 0) / 60)}h ${t('totalEffort')}`} />
        <ProfessionalStat label={t('companyBaseline')} value={`${Math.floor(companyAvgMinutes / 60)}h`} subValue={t('avgEfficiency')} />
        <ProfessionalStat label={t('bestDiscipline')} value={rankedRoutine[0]?.name || 'N/A'} subValue={`%${rankedRoutine[0]?.overallRoutinePercent.toFixed(0) || 0} ${t('routineDiscipline')}`} />
      </div>

      <div className="clean-card overflow-hidden">
        <div className="px-10 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">{t('timeBasedRanking')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-10 py-6 subheading-premium !tracking-[0.1em]">{t('rank')}</th>
                <th className="px-10 py-6 subheading-premium !tracking-[0.1em]">{t('employee')}</th>
                <th className="px-10 py-6 subheading-premium !tracking-[0.1em] text-center">{t('totalTime')}</th>
                <th className="px-10 py-6 subheading-premium !tracking-[0.1em] text-center">{t('discipline')} %</th>
                <th className="px-10 py-6 subheading-premium !tracking-[0.1em] text-right">{t('missions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
              {rankedWorkTime.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center subheading-premium opacity-30">{t('noMissionsHistory')}</td>
                </tr>
              ) : rankedWorkTime.map((entry, index) => (
                <tr key={entry.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors group">
                  <td className="px-10 py-6">
                    <span className="text-2xl font-black italic text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                      #{index + 1}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <Link href={`/admin/employees/${entry.id}`} className="text-sm font-black italic text-zinc-900 dark:text-zinc-100 hover:underline">{entry.name}</Link>
                    <p className="subheading-premium !text-[8px] !mb-0 !mt-1 opacity-50">{entry.department}</p>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className="text-sm font-black italic text-zinc-900 dark:text-zinc-100">{Math.floor(entry.totalMinutes / 60)}h {entry.totalMinutes % 60}m</span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div className="flex items-center justify-center gap-4">
                       <div className="w-20 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 bg-zinc-900 dark:bg-zinc-100`} style={{ width: `${entry.overallRoutinePercent}%` }} />
                       </div>
                       <span className="text-[10px] font-black italic text-zinc-500">%{entry.overallRoutinePercent.toFixed(0)}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <span className="text-sm font-black italic text-zinc-900 dark:text-zinc-100">{entry.completedTasks}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center pt-32 border-t border-zinc-100 dark:border-zinc-800 mt-20">
         <p className="subheading-premium !tracking-[1em] opacity-30">{t('nexusManagementProtocol')} &bull; PERFORMANCE_ANALYTICS_OK</p>
      </div>
    </div>
  );
}

function ProfessionalStat({ label, value, subValue }: { label: string; value: string | number; subValue: string }) {
  return (
    <div className="clean-card p-10">
      <p className="subheading-premium mb-8 !tracking-[0.2em] text-zinc-400">{label}</p>
      <p className="text-5xl font-black italic tracking-tighter mb-4 text-zinc-900 dark:text-white">{value}</p>
      <p className="subheading-premium !tracking-[0.1em] text-[9px] opacity-40">{subValue}</p>
    </div>
  );
}
