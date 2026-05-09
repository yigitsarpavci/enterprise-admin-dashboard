import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { AdminChartCard } from '@/components/AdminCharts';
import { formatLocalDate, parseLocalDate } from '@/lib/date';
import { getTranslation } from '@/lib/server-translations';
import HistoryFilters from '@/components/HistoryFilters';

export default async function AdminDailyReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();
  const t = await getTranslation();
  const params = await searchParams;

  const employeeId = params.employeeId as string;
  const department = params.department as string;
  const range = params.range as string || '7days';
  const startParam = params.start as string;
  const endParam = params.end as string;

  const today = new Date();
  let startDate: Date;
  let endDate: Date = new Date();

  // Unified Date Filter Logic
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
    startDate.setDate(today.getDate() - 7);
  }

  // Fetch filters data
  const employees = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  const allRoutineItems = await prisma.routineItem.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  // Fetch reports in range
  const reports = await prisma.dailyReport.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      employeeId: employeeId || undefined,
      employee: department ? {
        employeeProfile: {
          department: department
        }
      } : undefined
    },
    include: {
      employee: {
        include: { employeeProfile: true }
      },
      workLogs: {
        include: { task: true }
      },
      routineChecks: true,
    },
    orderBy: { date: 'desc' },
  });

  // Calculate Metrics
  const totalWorkMinutes = reports.reduce((acc, r) => 
    acc + r.workLogs.reduce((lAcc, l) => lAcc + l.minutes, 0), 0
  );
  
  const totalChecks = reports.reduce((acc, r) => acc + r.routineChecks.filter(c => c.checked).length, 0);
  const possibleChecks = reports.length * (allRoutineItems.length || 1);
  const routinePercentage = possibleChecks > 0 ? (totalChecks / possibleChecks) * 100 : 0;

  // Prepare Daily Trend Data
  const dailyDataMap: Record<string, number> = {};
  reports.forEach(r => {
    const dStr = new Date(r.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    dailyDataMap[dStr] = (dailyDataMap[dStr] || 0) + r.workLogs.reduce((acc, l) => acc + l.minutes, 0);
  });
  const dailyTrendData = Object.entries(dailyDataMap).map(([date, minutes]) => ({ date, minutes })).reverse();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 fade-in">
      
      {/* --- Minimalist Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div>
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {t('dailyActivityReports')} <span className="text-zinc-400">{t('operationalAudit')}</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-zinc-500 uppercase tracking-widest leading-relaxed">
            {t('auditDescription')}
          </p>
        </div>
        <Link href="/admin" className="btn-secondary">
          {t('returnToConsole')}
        </Link>
      </div>

      <div className="mb-12">
        <HistoryFilters />
      </div>

      {/* --- Dynamic Range Metrics --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <MinimalStatCard 
          label={`${t('totalOperationalTime')} (${t(range)})`} 
          value={`${Math.floor(totalWorkMinutes / 60)}h`} 
          subValue={`${reports.length} ${t('nodesSynced')}`} 
        />
        <MinimalStatCard 
          label={`${t('routineCompliance')} (${t(range)})`} 
          value={`%${routinePercentage.toFixed(1)}`} 
          subValue={t('dailyRoutineChecklist')} 
        />
        <MinimalStatCard 
          label={t('employeeFilter')} 
          value={employees.length} 
          subValue={t('totalNodes')} 
          highlight 
        />
      </div>

      {/* --- Visual Analysis --- */}
      <div className="mb-16">
        <AdminChartCard 
          title={t('workEffortTrend')} 
          data={dailyTrendData} 
          dataKey="minutes" 
          nameKey="date" 
          type="area"
          color="#18181b"
        />
      </div>

      {/* --- Professional Report List --- */}
      <div className="space-y-6">
        {reports.length === 0 ? (
          <div className="py-24 text-center clean-card border-dashed">
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">{t('noMissionsHistory')}</p>
          </div>
        ) : reports.map((report) => {
          const totalMins = report.workLogs.reduce((acc, l) => acc + l.minutes, 0);
          return (
            <div key={report.id} className="clean-card overflow-hidden">
               <div className="px-10 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-black text-zinc-500">
                        {(report.employee.name || 'U').substring(0, 1).toUpperCase()}
                     </div>
                     <div>
                        <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">{report.employee.name}</h3>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                          {report.employee.employeeProfile?.department} &bull; {new Date(report.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                        </p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mr-2">{t('totalEffort')}:</span>
                        <span className="text-xs font-black text-zinc-900 dark:text-white italic">{Math.floor(totalMins / 60)}h {totalMins % 60}m</span>
                     </div>
                  </div>
               </div>

               <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-8 space-y-6">
                     <h4 className="text-[10px] font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-widest">{t('activityTimeline')}</h4>
                     <div className="space-y-4">
                        {report.workLogs.map((log) => (
                          <div key={log.id} className="flex justify-between items-start gap-4 pb-4 border-b border-zinc-50 dark:border-zinc-900 last:border-0">
                             <div>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">{log.description}</p>
                                {log.task && <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Mission: {log.task.title}</p>}
                             </div>
                             <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{log.minutes}m</span>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div className="lg:col-span-4 space-y-6">
                     <h4 className="text-[10px] font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-widest">{t('routineAudit')}</h4>
                     <div className="flex flex-wrap gap-2">
                        {allRoutineItems.map((item) => {
                          const isChecked = report.routineChecks.find(c => c.routineItemId === item.id)?.checked;
                          return (
                            <div key={item.id} className={`px-3 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest ${isChecked ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-100' : 'bg-white dark:bg-zinc-900 text-zinc-300 border-zinc-100 dark:border-zinc-800'}`}>
                              {item.label}
                            </div>
                          );
                        })}
                     </div>
                  </div>
               </div>
            </div>
          );
        })}
      </div>
      
      <div className="text-center pt-24 border-t border-zinc-100 dark:border-zinc-800 mt-20">
         <p className="text-[10px] font-bold text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.8em]">
          {t('nexusManagementProtocol')} &bull; OPERATIONAL AUDIT OK
         </p>
      </div>
    </div>
  );
}

function MinimalStatCard({ label, value, subValue, highlight }: { label: string; value: string | number; subValue: string; highlight?: boolean }) {
  return (
    <div className={`clean-card p-8 ${highlight ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100' : ''}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${highlight ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-500'}`}>{label}</p>
      <p className="text-4xl font-black italic tracking-tighter mb-2">{value}</p>
      <p className={`text-[9px] font-bold uppercase tracking-widest ${highlight ? 'text-zinc-500' : 'text-zinc-400'}`}>{subValue}</p>
    </div>
  );
}
