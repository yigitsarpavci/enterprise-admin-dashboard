import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { getTranslation } from '@/lib/server-translations';

export default async function ProductivityPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();
  const t = await getTranslation();
  const params = await searchParams;

  const department = params.department as string;
  const startDate = params.start as string || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
  const endDate = params.end as string || new Date().toISOString().split('T')[0];

  // Fetch data
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
        where: {
          date: { gte: new Date(startDate), lte: new Date(endDate) }
        },
        include: { workLogs: true, routineChecks: true }
      },
      tasks: {
        where: {
          createdAt: { gte: new Date(startDate), lte: new Date(endDate) }
        }
      }
    }
  });

  // Calculate raw metrics
  const rawMetrics = users.map(user => {
    const totalMinutes = user.dailyReports.reduce((acc, r) => 
      acc + r.workLogs.reduce((lAcc, l) => lAcc + l.minutes, 0), 0
    );
    const totalChecked = user.dailyReports.flatMap(r => r.routineChecks).filter(c => c.checked).length;
    const totalPossibleRoutines = user.dailyReports.length * routineItems.length;
    const completedTasks = user.tasks.filter(t => t.status === 'COMPLETED').length;
    const totalTasks = user.tasks.length;

    return {
      id: user.id,
      name: user.name,
      department: user.employeeProfile?.department || t('general'),
      totalMinutes,
      totalChecked,
      totalPossibleRoutines,
      completedTasks,
      totalTasks,
      hasActivity: user.dailyReports.length > 0
    };
  });

  // Normalize and score
  const maxMinutes = Math.max(...rawMetrics.map(m => m.totalMinutes), 1);
  
  const scoredData = rawMetrics.map(m => {
    const workTimeScore = (m.totalMinutes / maxMinutes) * 100;
    const routineScore = m.totalPossibleRoutines > 0 ? (m.totalChecked / m.totalPossibleRoutines) * 100 : 0;
    const taskScore = m.totalTasks > 0 ? (m.completedTasks / m.totalTasks) * 100 : (m.hasActivity ? 100 : 0);

    const overallScore = (0.4 * workTimeScore) + (0.4 * routineScore) + (0.2 * taskScore);

    return {
      ...m,
      workTimeScore,
      routineScore,
      taskScore,
      overallScore
    };
  });

  const rankedData = [...scoredData].sort((a, b) => b.overallScore - a.overallScore);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
       
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,1)]" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">{t('analyticInsight')}</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter italic">
            {t('productivity')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600">{t('overview')}</span>
          </h1>
          <p className="mt-4 text-zinc-500 font-bold uppercase tracking-widest text-xs">
            {t('productivityDescription')}
          </p>
        </div>
      </div>

      {/* Info Note */}
      <div className="mb-12 p-6 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl relative z-10">
         <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 flex-shrink-0 border border-cyan-500/20">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
               </svg>
            </div>
            <div>
               <h4 className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-2">{t('calculationLogic')}</h4>
               <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  {t('calculationLogicDescription')}
               </p>
            </div>
         </div>
      </div>

      {/* Filters */}
      <div className="clean-card p-8 mb-16 relative z-10">
        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">{t('startDate')}</label>
            <input type="date" name="start" defaultValue={startDate} className="w-full px-4 py-3 bg-[var(--accent)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--foreground)] outline-none focus:ring-1 focus:ring-[var(--foreground)]/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">{t('endDate')}</label>
            <input type="date" name="end" defaultValue={endDate} className="w-full px-4 py-3 bg-[var(--accent)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--foreground)] outline-none focus:ring-1 focus:ring-[var(--foreground)]/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">{t('department')}</label>
            <select name="department" defaultValue={department} className="w-full px-4 py-3 bg-[var(--accent)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--foreground)] outline-none focus:ring-1 focus:ring-[var(--foreground)]/20 appearance-none cursor-pointer">
              <option value="">{t('allDepartments')}</option>
              {departments.map(d => <option key={d.department} value={d.department!}>{d.department}</option>)}
            </select>
          </div>
          <div className="flex items-end">
             <button type="submit" className="w-full py-3 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md">
               {t('syncAnalytics')}
             </button>
          </div>
        </form>
      </div>

      {/* Score Matrix Table */}
      <div className="bg-zinc-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 overflow-hidden relative z-10 shadow-2xl">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                     <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('rank')}</th>
                     <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('employee')}</th>
                     <th className="px-6 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center">{t('effortScore')}</th>
                     <th className="px-6 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center">{t('disciplineScore')}</th>
                     <th className="px-6 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center">{t('objectiveScore')}</th>
                     <th className="px-8 py-6 text-[10px] font-black text-cyan-400 uppercase tracking-widest text-right">{t('overallIndex')}</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {rankedData.map((row, index) => (
                    <tr key={row.id} className="hover:bg-white/[0.01] transition-colors group">
                       <td className="px-8 py-8">
                          <span className={`text-2xl font-black italic ${index === 0 ? 'text-cyan-400' : index < 3 ? 'text-zinc-300' : 'text-zinc-700'}`}>
                             #{index + 1}
                          </span>
                       </td>
                       <td className="px-8 py-8">
                          <Link href={`/admin/employees/${row.id}`} className="text-sm font-black text-white italic hover:text-cyan-400 transition-colors">
                             {row.name}
                          </Link>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">{row.department}</p>
                       </td>
                       <td className="px-6 py-8 text-center">
                          <span className="text-xs font-bold text-zinc-400">{row.workTimeScore.toFixed(0)}</span>
                       </td>
                       <td className="px-6 py-8 text-center text-xs font-bold text-zinc-400">
                          {row.routineScore.toFixed(0)}
                       </td>
                       <td className="px-6 py-8 text-center text-xs font-bold text-zinc-400">
                          {row.taskScore.toFixed(0)}
                       </td>
                       <td className="px-8 py-8 text-right">
                          <div className="inline-flex flex-col items-end">
                             <span className={`text-xl font-black italic ${row.overallScore > 80 ? 'text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'text-zinc-300'}`}>
                                {row.overallScore.toFixed(1)}
                             </span>
                             <div className="w-16 h-1 bg-zinc-950 rounded-full mt-2 overflow-hidden">
                                <div className={`h-full ${row.overallScore > 80 ? 'bg-cyan-500' : 'bg-zinc-700'}`} style={{ width: `${row.overallScore}%` }} />
                             </div>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <div className="mt-20 text-center">
         <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em]">{t('systemProductivityIndex')} &bull; {t('internalProtocol')}</p>
      </div>
    </div>
  );
}
