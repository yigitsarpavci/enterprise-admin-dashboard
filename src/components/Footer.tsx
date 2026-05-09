'use client';

import { useLanguage } from './LanguageProvider';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 w-full h-8 glass border-t border-white/5 z-50 px-6 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse-glow" />
          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">{t('systemOnline')}</span>
        </div>
        <div className="w-px h-3 bg-white/5" />
        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em]">Nexus Core v1.4.2</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em]">{t('operationalIntegrity')}: Verified</span>
        <div className="w-px h-3 bg-white/5" />
        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">Lat: 39.9N Lon: 32.8E</span>
      </div>
    </div>
  );
}
