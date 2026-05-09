import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import CreateUserForm from '@/components/CreateUserForm';
import { getTranslation } from '@/lib/server-translations';
import EmployeeListClient from './EmployeeListClient';

export default async function AdminEmployeesPage() {
  await requireAdmin();
  const t = await getTranslation();

  const users = await prisma.user.findMany({
    include: { employeeProfile: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 fade-in">
      
      {/* --- Simplified Minimal Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div>
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {t('personnel')}
          </h1>
          <p className="mt-2 text-sm font-medium text-zinc-500 uppercase tracking-widest">{t('profileIntelligence')}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="btn-secondary"
          >
            {t('adminConsole')}
          </Link>
        </div>
      </div>

      {/* --- Simplified Registration Section --- */}
      <div className="mb-16">
        <CreateUserForm />
      </div>

      {/* --- Minimalist Task Nodes with Bulk Actions --- */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] whitespace-nowrap">{t('activeNodes')}</h2>
          <div className="h-px flex-grow bg-zinc-100 dark:bg-zinc-800" />
        </div>

        <EmployeeListClient users={users} />
      </div>

      <div className="text-center pt-24 border-t border-zinc-100 dark:border-zinc-800 mt-20">
        <p className="text-[10px] font-bold text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.8em]">
          {t('nexusIntelligentSystems')} &bull; OPERATIONAL SYNC OK
        </p>
      </div>
    </div>
  );
}
