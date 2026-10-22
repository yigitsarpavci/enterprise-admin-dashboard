'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageProvider';

export default function LiveSync({ interval = 10000 }: { interval?: number }) {
  const { t } = useLanguage();
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setLastSync(new Date());

    const timer = setInterval(() => {
      setLastSync(new Date());
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  if (!isMounted) return null;

  return (
    <div className="fixed bottom-10 right-10 z-[60] pointer-events-none">
      <div className="glass px-4 py-2 rounded-full flex items-center gap-3 border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping absolute inset-0" />
          <div className="w-2 h-2 rounded-full bg-cyan-500 relative z-10" />
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-white uppercase tracking-widest">{t('liveSyncActive')}</span>
          <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest">
            {t('lastUpdate')}: {lastSync?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) || '---'}
          </span>
        </div>
      </div>
    </div>
  );
}

