import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTodayLocal, parseLocalDate, formatLocalDate } from '@/lib/date';
import { getTranslation } from '@/lib/server-translations';

export default async function EmployeeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();
  const t = await getTranslation();
  const { id } = await params;
  const sParams = await searchParams;

  const todayStr = formatLocalDate(new Date());
  const startDateStr = sParams.start as string || formatLocalDate(new Date(new Date().setDate(new Date().getDate() - 30)));
  const endDateStr = sParams.end as string || todayStr;

  const startDate = parseLocalDate(startDateStr);
  const endDate = parseLocalDate(endDateStr);
  const endDateInclusive = new Date(endDate);
  endDateInclusive.setUTCHours(23, 59, 59, 999);

  const employee = await prisma.user.findUnique({
    where: { id },
    include: {
      employeeProfile: true,
      tasks: {
        where: {
          createdAt: {
            gte: startDate,
            lte: endDateInclusive,
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      dailyReports: {
        where: {
          date: {
            gte: startDate,
            lte: endDateInclusive,
          }
        },
        include: {
          workLogs: { include: { task: true } },
          routineChecks: true,
        },
        orderBy: { date: 'desc' }
      }
    }
  });


  if (!employee) {
    notFound();
  }

  // Calculate Metrics
  const totalReports = employee.dailyReports.length;
  const totalMinutes = employee.dailyReports.reduce((acc, r) => 
    acc + r.workLogs.reduce((lAcc, l) => lAcc + l.minutes, 0), 0
  );
  const avgMinutes = totalReports > 0 ? totalMinutes / totalReports : 0;
  
  const allRoutineItems = await prisma.routineItem.findMany({ where: { isActive: true } });
  const totalChecksPossible = totalReports * allRoutineItems.length;
  const totalChecksDone = employee.dailyReports.reduce((acc, r) => 
    acc + r.routineChecks.filter(c => c.checked).length, 0
  );
  const routineSuccessRate = totalChecksPossible > 0 ? (totalChecksDone / totalChecksPossible) * 100 : 0;

  const taskStats = {
    total: employee.tasks.length,
    completed: employee.tasks.filter(t => t.status === 'COMPLETED').length,
    inProgress: employee.tasks.filter(t => t.status === 'IN_PROGRESS').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
       <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
       
       {/* Breadcrumbs & Header */}
       <div className="mb-12 relative z-10">
          <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">
             <Link href="/admin" className="hover:text-white transition-colors">{t('adminConsole')}</Link>
             <span>/</span>
             <span className="text-zinc-400">{t('personnel')}</span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
             <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[32px] bg-zinc-900 border border-white/5 flex items-center justify-center text-3xl font-black text-zinc-500">
                   {(employee.name || 'U').substring(0, 1).toUpperCase()}
                </div>
                <div>
                   <h1 className="text-4xl font-black text-white tracking-tighter italic mb-2">{employee.name}</h1>
                   <div className="flex flex-wrap gap-3">
                      <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        {employee.employeeProfile?.department || t('allDepartments')}
                      </span>
                      <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-[10px] font-bold text-cyan-500 uppercase tracking-widest">
                        {employee.employeeProfile?.position || t('operator')}
                      </span>
                      <span className="px-3 py-1 bg-zinc-900 border border-white/5 rounded-lg text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                        {t('assigned')} {new Date(employee.createdAt).toLocaleDateString(t('locale'))}
                      </span>
                   </div>
                </div>
             </div>
             
             {/* Filter Form */}
             <form className="flex gap-4 p-2 bg-zinc-950 border border-white/5 rounded-2xl">
                <input 
                   type="date" 
                   name="start" 
                   defaultValue={startDateStr} 
                   className="bg-transparent border-none text-[10px] font-bold text-zinc-400 outline-none focus:ring-0 px-2"
                />
                <span className="text-zinc-800 self-center">-</span>
                <input 
                   type="date" 
                   name="end" 
                   defaultValue={endDateStr} 
                   className="bg-transparent border-none text-[10px] font-bold text-zinc-400 outline-none focus:ring-0 px-2"
                />
                <button type="submit" className="px-4 py-2 bg-white text-zinc-950 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all">
                   {t('sync')}
                </button>
             </form>
          </div>
       </div>

       {/* Metrics Cards */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative z-10">
          <DetailStatCard label={t('totalEffort')} value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`} subValue={`${totalReports} ${t('operationalDays')}`} color="zinc" />
          <DetailStatCard label={t('dailyAvg')} value={`${Math.floor(avgMinutes / 60)}h ${Math.round(avgMinutes % 60)}m`} subValue={t('activeDays')} color="zinc" />
          <DetailStatCard label={t('missionSuccess')} value={`${taskStats.completed}/${taskStats.total}`} subValue={t('assignedMissions')} color="cyan" />
          <DetailStatCard label={t('routineDiscipline')} value={`%${routineSuccessRate.toFixed(0)}`} subValue={t('highestCompliance')} color="purple" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-12">
             
             {/* Assigned Mission List */}
             <section>
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,1)]" />
                   <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">{t('strategicMissions')}</h2>
                </div>
                <div className="space-y-4">
                   {employee.tasks.length === 0 ? (
                      <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest text-center py-10 bg-zinc-900/20 rounded-3xl border border-white/5">{t('noActiveMissions')}</p>
                   ) : employee.tasks.map((task) => (
                      <div key={task.id} className="p-6 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl flex justify-between items-center group hover:border-cyan-500/20 transition-all">
                         <div>
                            <h3 className="text-sm font-black text-white italic mb-1">{task.title}</h3>
                            <div className="flex items-center gap-3">
                               <span className={`text-[9px] font-black uppercase tracking-widest ${
                                  task.status === 'COMPLETED' ? 'text-green-500' : 
                                  task.status === 'IN_PROGRESS' ? 'text-cyan-400' : 'text-zinc-600'
                               }`}>
                                 {task.status}
                               </span>
                               {task.deadline && (
                                 <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">
                                   {t('deadline')}: {new Date(task.deadline).toLocaleDateString(t('locale'))}
                                 </span>
                               )}
                            </div>
                         </div>
                         <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-cyan-500 transition-all" />
                      </div>
                   ))}
                </div>
             </section>

             {/* Daily Timeline */}
             <section>
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,1)]" />
                   <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">{t('operationalTimeline')}</h2>
                </div>
                <div className="space-y-8">
                   {employee.dailyReports.length === 0 ? (
                      <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest text-center py-10 bg-zinc-900/20 rounded-3xl border border-white/5">{t('noActivityToday')}</p>
                   ) : employee.dailyReports.map((report) => (
                      <div key={report.id} className="relative pl-12">
                         <div className="absolute left-3 top-0 bottom-0 w-px bg-white/5" />
                         <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                         </div>
                         
                         <div className="p-8 bg-zinc-900/30 rounded-[32px] border border-white/5">
                            <div className="flex justify-between items-center mb-6">
                               <h3 className="text-sm font-black text-white italic">{new Date(report.date).toLocaleDateString(t('locale'), { day: '2-digit', month: 'long' })}</h3>
                               <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-400/5 px-3 py-1 rounded-lg border border-cyan-400/10">
                                 {report.workLogs.reduce((acc, l) => acc + l.minutes, 0)}m
                               </span>
                            </div>
                            <div className="space-y-3">
                               {report.workLogs.map((log) => (
                                 <div key={log.id} className="flex justify-between gap-6 group/item">
                                    <p className="text-xs font-medium text-zinc-400 group-hover/item:text-zinc-200 transition-colors leading-relaxed">{log.description}</p>
                                    <span className="text-[9px] font-black text-zinc-700 uppercase whitespace-nowrap">{log.minutes}m</span>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </section>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-10">
             <section className="p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[40px]">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-8">{t('routineComplianceTable')}</h3>
                <div className="space-y-4">
                   {allRoutineItems.map((item) => {
                      const itemChecks = employee.dailyReports.flatMap(r => r.routineChecks).filter(c => c.routineItemId === item.id);
                      const checkedCount = itemChecks.filter(c => c.checked).length;
                      const percent = totalReports > 0 ? (checkedCount / totalReports) * 100 : 0;
                      
                      return (
                        <div key={item.id} className="space-y-2">
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                              <span className="text-zinc-400">{item.label}</span>
                              <span className={percent === 100 ? 'text-cyan-500' : 'text-zinc-600'}>%{percent.toFixed(0)}</span>
                           </div>
                           <div className="h-1 bg-zinc-950 rounded-full overflow-hidden">
                              <div 
                                 className={`h-full transition-all duration-1000 ${percent === 100 ? 'bg-cyan-500' : 'bg-zinc-800'}`} 
                                 style={{ width: `${percent}%` }} 
                              />
                           </div>
                        </div>
                      );
                   })}
                </div>
             </section>

             <div className="p-8 bg-zinc-950/50 border border-white/5 border-dashed rounded-[40px] text-center">
                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-4">{t('profileIntelligence')}</p>
                <p className="text-[10px] font-medium text-zinc-500 leading-relaxed italic">
                  {t('dataDerivedFrom', { totalReports, totalMinutes })}
                </p>
             </div>
          </div>
       </div>
    </div>
  );
}

function DetailStatCard({ label, value, subValue, color }: { label: string; value: string; subValue: string; color: 'cyan' | 'purple' | 'zinc' }) {
  const colorMap = {
    cyan: 'text-cyan-400 border-cyan-500/10 bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.05)]',
    purple: 'text-purple-400 border-purple-500/10 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.05)]',
    zinc: 'text-zinc-400 border-white/5 bg-white/5',
  };

  const glowMap = {
    cyan: 'bg-cyan-500',
    purple: 'bg-purple-500',
    zinc: 'bg-zinc-600',
  };

  return (
    <div className={`p-8 rounded-[40px] border ${colorMap[color]} transition-all duration-300 hover:scale-[1.02]`}>
      <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-50">{label}</p>
      <p className="text-3xl font-black italic tracking-tighter mb-2">{value}</p>
      <div className="flex items-center gap-2">
         <div className={`w-1 h-1 rounded-full ${glowMap[color]}`} />
         <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{subValue}</p>
      </div>
    </div>
  );
}
