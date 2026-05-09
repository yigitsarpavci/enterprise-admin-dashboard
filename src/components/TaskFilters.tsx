'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from './LanguageProvider';

interface TaskFiltersProps {
  employees: { id: string; name: string }[];
  departments: string[];
}

export default function TaskFilters({ employees, departments }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/tasks?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div className="space-y-1.5">
        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">{t('filterEmployee')}</label>
        <select
          value={searchParams.get('employee') || ''}
          onChange={(e) => updateFilter('employee', e.target.value)}
          className="w-full px-4 py-2 bg-zinc-950/50 border border-white/5 rounded-xl text-xs font-bold text-zinc-400 focus:ring-1 focus:ring-cyan-500/50 outline-none appearance-none cursor-pointer"
        >
          <option value="">{t('allEmployees')}</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">{t('filterSector')}</label>
        <select
          value={searchParams.get('department') || ''}
          onChange={(e) => updateFilter('department', e.target.value)}
          className="w-full px-4 py-2 bg-zinc-950/50 border border-white/5 rounded-xl text-xs font-bold text-zinc-400 focus:ring-1 focus:ring-cyan-500/50 outline-none appearance-none cursor-pointer"
        >
          <option value="">{t('allDepartments')}</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">{t('filterStatus')}</label>
        <select
          value={searchParams.get('status') || ''}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="w-full px-4 py-2 bg-zinc-950/50 border border-white/5 rounded-xl text-xs font-bold text-zinc-400 focus:ring-1 focus:ring-cyan-500/50 outline-none appearance-none cursor-pointer"
        >
          <option value="">{t('allStatuses')}</option>
          <option value="TODO">{t('todo')}</option>
          <option value="IN_PROGRESS">{t('inProgress')}</option>
          <option value="COMPLETED">{t('completed')}</option>
          <option value="CANCELLED">{t('cancelled')}</option>
        </select>
      </div>
    </div>
  );
}
