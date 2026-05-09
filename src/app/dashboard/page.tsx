import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getTranslation } from '@/lib/server-translations';
import { getTodayLocal } from '@/lib/date';
import DailyReportForm from '@/components/DailyReportForm';
import UserTaskItem from '@/components/UserTaskItem';
import DailyRoutineChecklist from '@/components/DailyRoutineChecklist';
import DashboardStats from '@/components/DashboardStats';
import { getUserDashboardStats } from '@/lib/stats';

// Force absolute dynamic rendering for real-time integrity
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || typeof session.userId !== 'string') redirect('/login');

  const t = await getTranslation();
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      tasks: {
        orderBy: { createdAt: 'desc' }
      },
      dailyReports: {
        where: {
          date: {
            gte: getTodayLocal()
          }
        },
        include: {
          routineChecks: true,
          workLogs: true
        }
      }
    }
  });

  if (!user) redirect('/login');

  // Unified Stat Engine
  const { effortStr } = await getUserDashboardStats(user.id);

  const lastSyncStr = new Intl.DateTimeFormat(t('locale') || 'tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul'
  }).format(new Date());

  const routineItems = await prisma.routineItem.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
  });

  const checkedRoutineIds = user.dailyReports[0]?.routineChecks
    .filter(c => c.checked)
    .map(c => c.routineItemId) || [];

  return (
    <div className="max-w-[1750px] mx-auto px-8 md:px-12 py-12 space-y-12 fade-in">
      
      {/* 
         Integrated Stats Banner - 
         Moved to a more subtle top-bar position since identity is in Navbar 
      */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pb-10 border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
           <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.4em] opacity-60">
             {t('operationalIntegrityEstablished') || 'OPERATIONAL_INTEGRITY_ESTABLISHED'}
           </span>
        </div>

        <div className="flex items-center gap-12 lg:gap-16">
           <div className="flex flex-col items-end">
              <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] mb-1 opacity-40">{t('totalEffort')}</span>
              <DashboardStats value={effortStr} />
           </div>
           <div className="w-px h-8 bg-[var(--border)]" />
           <div className="flex flex-col items-end">
              <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] mb-1 opacity-40">{t('lastSync')}</span>
              <DashboardStats value={lastSyncStr} />
           </div>
           <div className="w-px h-8 bg-[var(--border)]" />
           <div className="flex flex-col items-end">
              <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] mb-1 opacity-40">{t('status')}</span>
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-[0.3em]">{t('activeSession')}</span>
           </div>
        </div>
      </div>

      {/* Main Content - High Density 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-12 gap-12">
        
        {/* Column 1: Routine (xl:3) */}
        <div className="xl:col-span-3 space-y-8">
           <div className="flex items-center gap-3">
              <div className="w-1 h-1 bg-[var(--foreground)] rounded-full" />
              <h2 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.4em]">{t('dailyRoutineChecklist')}</h2>
           </div>
           <DailyRoutineChecklist 
             items={routineItems.map(r => ({ id: r.id, label: r.label }))} 
             checkedIds={checkedRoutineIds} 
           />
        </div>

        {/* Column 2: Missions (xl:5) */}
        <div className="xl:col-span-5 space-y-8">
           <div className="flex items-center gap-3">
              <div className="w-1 h-1 bg-[var(--foreground)] rounded-full" />
              <h2 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.4em]">{t('missionProgress')}</h2>
           </div>
           <div className="space-y-4">
             {user.tasks.length === 0 ? (
               <div className="clean-card p-16 text-center border-dashed">
                 <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">{t('noActiveMissions')}</p>
               </div>
             ) : (
               user.tasks.map(task => (
                 <UserTaskItem key={task.id} task={task} />
               ))
             )}
           </div>
        </div>

        {/* Column 3: Reports (xl:4) */}
        <div className="xl:col-span-4 space-y-8">
           <div className="flex items-center gap-3">
              <div className="w-1 h-1 bg-[var(--foreground)] rounded-full" />
              <h2 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.4em]">{t('dailyActivityReport')}</h2>
           </div>
           <div className="clean-card p-8">
             <DailyReportForm 
               userId={user.id} 
               tasks={user.tasks} 
               initialLogs={user.dailyReports[0]?.workLogs.map(log => ({
                 id: log.id,
                 description: log.description,
                 minutes: log.minutes,
                 taskId: log.taskId || undefined
               })) || []} 
             />
           </div>
           
           <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--accent)]/10">
              <p className="text-[10px] font-medium leading-relaxed text-[var(--muted)] opacity-50 italic">
                 {t('benchmarkingDescription')}
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}
