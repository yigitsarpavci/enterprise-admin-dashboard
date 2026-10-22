import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import LogoutButton from '@/components/LogoutButton';
import Link from 'next/link';
import { getTodayLocal } from '@/lib/date';
import { Metadata } from 'next';
import LiveSync from '@/components/LiveSync';
import { getTranslation } from '@/lib/server-translations';
import { AdminChartCard } from '@/components/AdminCharts';
import HistoryFilters from '@/components/HistoryFilters';

import { getAdminStats } from '@/lib/stats';

export const metadata: Metadata = {
  title: 'Admin Console | Performo',
  description: 'Enterprise intelligence and personnel management.',
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const t = await getTranslation();
  await requireAdmin();
  const today = getTodayLocal();

  // Parse search params
  const params = await searchParams;
  const range = params.range as string || '7days';
  const startParam = params.start as string;
  const endParam = params.end as string;

  // Fetch Centralized Stats
  const {
    totalEmployees,
    onlineEmployees,
    currentWorkMins,
    currentRoutinePercent,
    currentTasks,
    workTrend,
    taskTrend,
    routineTrend,
    rangeReportsCount,
    dateFilter
  } = await getAdminStats(range, startParam, endParam);

  // Insights Heuristics
  const alerts = [];
  if (onlineEmployees < totalEmployees * 0.5) alerts.push({ type: 'warning', msg: t('lowActivityAlert') || 'LOW_NODE_ACTIVITY_DETECTED' });
  if (currentRoutinePercent < 70) alerts.push({ type: 'danger', msg: t('routineDisciplineLow') || 'CRITICAL_ROUTINE_DRIFT' });
  if (workTrend > 10) alerts.push({ type: 'success', msg: t('productivityUp') || 'EFFICIENCY_SURGE_DETECTED' });

  // Weekly Trend Chart
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 7);
  const weeklyReports = await prisma.dailyReport.findMany({
    where: { date: { gte: weekStart } },
    include: { workLogs: true }
  });
  const dailyStats: Record<string, number> = {};
  weeklyReports.forEach(r => {
    const dStr = new Date(r.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    dailyStats[dStr] = (dailyStats[dStr] || 0) + r.workLogs.reduce((acc, l) => acc + l.minutes, 0);
  });
  const trendData = Object.entries(dailyStats).map(([date, minutes]) => ({ date, minutes })).reverse();

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 fade-in">
      <LiveSync />
      
      {/* --- Intelligent Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-20">
        <div>
          <h1 className="text-5xl heading-premium text-zinc-900 dark:text-white">
            {t('adminConsole')}
          </h1>
          <p className="mt-4 subheading-premium">
            {t('operationalOverview')} &bull; {t('nexusManagementProtocol')}
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm">
           <Link href="/admin/employees" className="btn-secondary py-3 px-6 text-[9px] !rounded-2xl">{t('addPersonnel')}</Link>
           <Link href="/admin/tasks" className="btn-primary py-3 px-6 text-[9px] !rounded-2xl">{t('assignTask')}</Link>
        </div>
      </div>

      {/* --- Smart Insights Panel --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        <div className="lg:col-span-8">
           <HistoryFilters />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-4">
           {alerts.map((alert, i) => (
             <div key={i} className={`px-6 py-4 rounded-[20px] border flex items-center gap-4 animate-pulse ${
               alert.type === 'danger' ? 'bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-500/20 text-red-600' :
               alert.type === 'warning' ? 'bg-orange-50 dark:bg-orange-500/5 border-orange-100 dark:border-orange-500/20 text-orange-600' :
               'bg-green-50 dark:bg-green-500/5 border-green-100 dark:border-green-500/20 text-green-600'
             }`}>
               <div className={`w-2 h-2 rounded-full ${
                 alert.type === 'danger' ? 'bg-red-500' : alert.type === 'warning' ? 'bg-orange-500' : 'bg-green-500'
               }`} />
               <span className="subheading-premium !mb-0 !tracking-[0.1em] !text-[9px] font-black">{alert.msg}</span>
             </div>
           ))}
        </div>
      </div>

      {/* --- Trend-Aware Metrics Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
        <MinimalTrendStat 
          label={t('nodesOnline')} 
          value={onlineEmployees} 
          subValue={`${totalEmployees} ${t('totalNodes')}`} 
          trend={0} 
          highlight 
        />
        <MinimalTrendStat 
          label={`${t('totalEffort')} (${t(range)})`} 
          value={`${Math.floor(currentWorkMins / 60)}h`} 
          subValue={`${rangeReportsCount} ${t('nodesSynced')}`} 
          trend={workTrend}
        />
        <MinimalTrendStat 
          label={`${t('routineDiscipline')} (${t(range)})`} 
          value={`%${currentRoutinePercent.toFixed(0)}`} 
          subValue={t('dailyRoutineChecklist')} 
          trend={routineTrend}
          unit="pt"
        />
        <MinimalTrendStat 
          label={`${t('strategicMissions')} (${t(range)})`} 
          value={currentTasks} 
          subValue={t('tasksCompleted')} 
          trend={taskTrend}
        />
      </div>

      {/* --- Action & Chart Matrix --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-24">
        <div className="lg:col-span-3 grid grid-cols-1 gap-4">
           <QuickAction href="/admin/employees" label={t('personnel')} desc="Node Management" />
           <QuickAction href="/admin/tasks" label={t('missions')} desc="Strategic Goals" />
           <QuickAction href="/admin/comparison" label={t('comparison')} desc="Peer Analysis" />
           <QuickAction href="/admin/daily-reports" label={t('operationalHistory')} desc="Full Logbook" />
        </div>
        <div className="lg:col-span-9">
          <AdminChartCard 
            title={t('workEffortTrend')} 
            data={trendData} 
            dataKey="minutes" 
            nameKey="date" 
            type="area" 
            color="#18181b"
          />
        </div>
      </div>

      <div className="text-center pt-32 border-t border-zinc-100 dark:border-zinc-800">
        <p className="subheading-premium !tracking-[1em] opacity-30">
          {t('nexusManagementProtocol')} &bull; INTELLIGENCE_CORE_ACTIVE
        </p>
      </div>
    </div>
  );
}

function QuickAction({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <Link href={href} className="clean-card p-8 group hover:border-zinc-900 dark:hover:border-white transition-all">
      <h4 className="heading-premium text-sm text-zinc-900 dark:text-white uppercase mb-1">{label}</h4>
      <p className="subheading-premium !text-[8px] opacity-40">{desc}</p>
    </Link>
  );
}

function MinimalTrendStat({ label, value, subValue, trend, unit = '%', highlight }: { label: string; value: string | number; subValue: string; trend: number; unit?: string; highlight?: boolean }) {
  const isPositive = trend > 0;
  const isNegative = trend < 0;

  return (
    <div className={`clean-card p-10 relative overflow-hidden ${highlight ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-2xl' : ''}`}>
      <p className={`subheading-premium mb-6 !tracking-[0.2em] ${highlight ? 'text-zinc-400 dark:text-zinc-500' : ''}`}>{label}</p>
      <div className="flex items-baseline gap-4 mb-4">
         <p className="text-5xl font-black italic tracking-tighter">{value}</p>
         {trend !== 0 && (
           <div className={`flex items-center gap-1 text-[10px] font-black italic ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(0)}{unit}
           </div>
         )}
      </div>
      <p className={`subheading-premium !tracking-[0.1em] text-[9px] ${highlight ? 'text-zinc-500' : 'text-zinc-400'}`}>{subValue}</p>
      
      {/* Background Micro-Trend Sparkline (Visual only) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
         <div className={`h-full transition-all duration-1000 ${highlight ? 'bg-white/20' : isPositive ? 'bg-green-500/20' : isNegative ? 'bg-red-500/20' : 'bg-zinc-200'}`} style={{ width: '100%' }} />
      </div>
    </div>
  );
}
