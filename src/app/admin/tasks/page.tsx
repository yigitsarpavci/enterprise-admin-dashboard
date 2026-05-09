import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import CreateTaskForm from '@/components/CreateTaskForm';
import TaskFilters from '@/components/TaskFilters';
import { getTranslation } from '@/lib/server-translations';
import MotionWrapper from '@/components/MotionWrapper';

export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();
  const t = await getTranslation();
  const params = await searchParams;

  const employeeFilter = params.employee as string;
  const statusFilter = params.status as string;
  const departmentFilter = params.department as string;

  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    include: { employeeProfile: true },
    orderBy: { name: 'asc' },
  });

  const tasks = await prisma.employeeTask.findMany({
    where: {
      employeeId: employeeFilter || undefined,
      status: statusFilter || undefined,
      employee: departmentFilter ? {
        employeeProfile: {
          department: departmentFilter
        }
      } : undefined
    },
    include: {
      employee: { include: { employeeProfile: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const departments = Array.from(new Set(users.map(u => u.employeeProfile?.department).filter(Boolean))) as string[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      <MotionWrapper>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-6 animate-pulse-glow">
              <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,1)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-400">{t('adminCommandCenter')}</span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter italic leading-none">
              {t('strategicMissions')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-800">{t('intelligence')}</span>
            </h1>
            <p className="mt-6 text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">{t('strategicMissionsDescription')} &bull; {t('operationalReadiness')}</p>
          </div>
          <Link 
            href="/admin" 
            className="group flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white hover:border-white/20 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            {t('adminConsole')}
          </Link>
        </div>
      </MotionWrapper>

      <MotionWrapper delay={0.1}>
        <div className="mb-16">
          <CreateTaskForm employees={users} />
        </div>
      </MotionWrapper>

      <MotionWrapper delay={0.2}>
        <div className="mb-16">
          <TaskFilters employees={users} departments={departments} />
        </div>
      </MotionWrapper>

      <div className="space-y-8 relative z-10 pb-24">
        <MotionWrapper delay={0.3}>
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.5em] whitespace-nowrap">{t('activeMissions')}</h2>
            <div className="h-px flex-grow bg-white/5" />
          </div>
        </MotionWrapper>

        {tasks.length === 0 ? (
          <MotionWrapper delay={0.4}>
            <div className="py-32 text-center nexus-glass rounded-[48px] border-dashed">
              <p className="text-zinc-800 font-black uppercase tracking-[0.5em] text-[11px]">{t('noActiveMissions')}</p>
            </div>
          </MotionWrapper>
        ) : tasks.map((task, index) => (
          <MotionWrapper key={task.id} delay={0.3 + (index * 0.05)}>
            <div className="nexus-glass rounded-[40px] p-12 hover:nexus-glass-heavy transition-all duration-500 group relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${
                task.status === 'COMPLETED' ? 'from-green-500 to-transparent' : 
                task.status === 'IN_PROGRESS' ? 'from-cyan-500 to-transparent' : 'from-zinc-500 to-transparent'
              } opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              <div className="flex flex-col lg:flex-row justify-between gap-12">
                <div className="flex-grow space-y-8">
                  <div className="flex items-start gap-8">
                    <div className="w-16 h-16 rounded-[24px] bg-zinc-950 border border-white/10 flex items-center justify-center text-xl font-black text-zinc-600 italic shadow-inner shrink-0">
                      {(task.employee.name || 'U').substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white italic tracking-tighter group-hover:neon-text-cyan transition-all mb-2">{task.title}</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{task.employee.name}</span>
                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{task.employee.employeeProfile?.department || 'UNIT_UNSET'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-3xl p-8 border border-white/5 group-hover:border-white/10 transition-colors">
                    <p className="text-zinc-400 text-sm font-medium leading-relaxed italic">{task.description || 'MISSION_DATA_EMPTY'}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col justify-between lg:justify-start items-center lg:items-end gap-8 min-w-[200px] lg:border-l border-white/5 lg:pl-12">
                  <div className="flex flex-col items-center lg:items-end">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">{t('executionStatus')}</span>
                    <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border ${
                      task.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      task.status === 'IN_PROGRESS' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]' :
                      'bg-zinc-800 text-zinc-500 border-white/5'
                    }`}>
                      {t(task.status.toLowerCase().replace('_', '-'))}
                    </span>
                  </div>

                  <div className="flex flex-col items-center lg:items-end">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">{t('deadline')}</span>
                    <span className="text-sm font-black text-zinc-300 italic tracking-tight">
                      {task.deadline ? new Date(task.deadline).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'EST_UNKNOWN'}
                    </span>
                  </div>

                  <div className="flex flex-col items-center lg:items-end">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">{t('assigned')}</span>
                    <span className="text-xs font-bold text-zinc-500">
                      {new Date(task.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </MotionWrapper>
        ))}
      </div>

      <MotionWrapper delay={1}>
        <div className="text-center pt-24 border-t border-white/5">
          <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.8em] animate-pulse-glow">
            {t('nexusIntelligentSystems')} &bull; {t('missionIntegrityVerified')}
          </p>
        </div>
      </MotionWrapper>
    </div>
  );
}
