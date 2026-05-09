import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { getTranslation } from '@/lib/server-translations';
import HistoryFilters from '@/components/HistoryFilters';
import { parseLocalDate } from '@/lib/date';

export default async function RoutineReportsPage({
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

  // Fetch all routine items
  const routineItems = await prisma.routineItem.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  // Fetch range reports
  const reports = await prisma.dailyReport.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      employeeId: employeeId || undefined,
      employee: department ? {
        employeeProfile: { department }
      } : undefined
    },
    include: {
      employee: { include: { employeeProfile: true } },
      routineChecks: true,
    },
  });

  // Calculate Routine Stats per Item
  const routineStats = routineItems.map(item => {
    const checks = reports.flatMap(r => r.routineChecks).filter(c => c.routineItemId === item.id);
    const checked = checks.filter(c => c.checked).length;
    const totalPossible = reports.length;
    const percentage = totalPossible > 0 ? (checked / totalPossible) * 100 : 0;

    return {
      id: item.id,
      label: item.label,
      checked,
      totalPossible,
      percentage,
    };
  });

  // Calculate Employee Matrix
  const matrix = reports.reduce((acc: any, r) => {
    if (!acc[r.employeeId]) {
      acc[r.employeeId] = {
        name: r.employee.name,
        dept: r.employee.employeeProfile?.department || 'General',
        checks: {},
        totalChecked: 0,
        totalPossible: 0,
      };
    }
    const entry = acc[r.employeeId];
    routineItems.forEach(item => {
      const check = r.routineChecks.find(c => c.routineItemId === item.id);
      if (!entry.checks[item.id]) entry.checks[item.id] = { c: 0, t: 0 };
      entry.checks[item.id].t++;
      entry.totalPossible++;
      if (check?.checked) {
        entry.checks[item.id].c++;
        entry.totalChecked++;
      }
    });
    return acc;
  }, {});

  const matrixList = Object.values(matrix).sort((a: any, b: any) => (b.totalChecked / b.totalPossible) - (a.totalChecked / a.totalPossible));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 fade-in">
      
      {/* --- Minimalist Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div>
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {t('routineDiscipline')} <span className="text-zinc-400">{t('routineComplianceAudit')}</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-zinc-500 uppercase tracking-widest leading-relaxed">
            {t('routineAuditDescription')}
          </p>
        </div>
        <Link href="/admin/daily-reports" className="btn-secondary">
          {t('backToReports')}
        </Link>
      </div>

      <div className="mb-12">
        <HistoryFilters />
      </div>

      {/* --- Itemized Discipline Units --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {routineStats.map((stat) => (
          <div key={stat.id} className="clean-card p-8 group hover:border-zinc-400 transition-all">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">{stat.label}</p>
            <p className="text-3xl font-black italic tracking-tighter mb-2">%{stat.percentage.toFixed(0)}</p>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{stat.checked}/{stat.totalPossible} {t('checks')}</span>
              <div className="w-16 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-900 dark:bg-zinc-100" style={{ width: `${stat.percentage}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Professional Compliance Matrix --- */}
      <div className="clean-card overflow-hidden">
        <div className="px-10 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">{t('complianceMatrixByEmployee')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('employee')}</th>
                {routineItems.map(item => (
                  <th key={item.id} className="px-6 py-5 text-[9px] font-bold text-zinc-400 uppercase tracking-widest text-center whitespace-nowrap">{item.label}</th>
                ))}
                <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">{t('overall')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
              {matrixList.length === 0 ? (
                <tr>
                  <td colSpan={routineItems.length + 2} className="px-8 py-20 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]">{t('noMissionsHistory')}</td>
                </tr>
              ) : matrixList.map((emp: any, i) => (
                <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{emp.name}</p>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{emp.dept}</p>
                  </td>
                  {routineItems.map(item => {
                    const stats = emp.checks[item.id];
                    const percent = stats.t > 0 ? (stats.c / stats.t) * 100 : 0;
                    return (
                      <td key={item.id} className="px-6 py-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${percent === 100 ? 'bg-green-500' : percent > 50 ? 'bg-zinc-400' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                          <span className="text-[9px] font-bold text-zinc-500">%{percent.toFixed(0)}</span>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-8 py-6 text-right">
                    <span className={`text-sm font-black italic ${emp.totalChecked === emp.totalPossible ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
                      %{((emp.totalChecked / emp.totalPossible) * 100).toFixed(0)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center pt-24 border-t border-zinc-100 dark:border-zinc-800 mt-20">
         <p className="text-[10px] font-bold text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.8em]">
          {t('nexusManagementProtocol')} &bull; ROUTINE AUDIT SYNC OK
         </p>
      </div>
    </div>
  );
}
