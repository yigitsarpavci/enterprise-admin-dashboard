'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useLanguage } from './LanguageProvider';

export default function HistoryFilters() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentRange = searchParams.get('range') || '7days';

  const updateRange = (range: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', range);
    if (range !== 'custom') {
      params.delete('start');
      params.delete('end');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const updateCustomDates = (start?: string, end?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', 'custom');
    if (start) params.set('start', start);
    if (end) params.set('end', end);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <FilterBtn active={currentRange === 'today'} onClick={() => updateRange('today')}>{t('today')}</FilterBtn>
        <FilterBtn active={currentRange === '7days'} onClick={() => updateRange('7days')}>{t('sevenDays')}</FilterBtn>
        <FilterBtn active={currentRange === '30days'} onClick={() => updateRange('30days')}>{t('thirtyDays')}</FilterBtn>
        <FilterBtn active={currentRange === 'custom'} onClick={() => updateRange('custom')}>{t('custom')}</FilterBtn>
      </div>

      {currentRange === 'custom' && (
        <div className="flex items-center gap-2 fade-in">
          <input
            type="date"
            value={searchParams.get('start') || ''}
            onChange={(e) => updateCustomDates(e.target.value, searchParams.get('end') || undefined)}
            className="input-clean py-1.5 px-3 text-[10px] font-bold w-auto"
          />
          <span className="text-zinc-400 font-bold text-[9px] uppercase tracking-widest">{t('to')}</span>
          <input
            type="date"
            value={searchParams.get('end') || ''}
            onChange={(e) => updateCustomDates(searchParams.get('start') || undefined, e.target.value)}
            className="input-clean py-1.5 px-3 text-[10px] font-bold w-auto"
          />
        </div>
      )}
    </div>
  );
}

function FilterBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
        active 
          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' 
          : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
      }`}
    >
      {children}
    </button>
  );
}
