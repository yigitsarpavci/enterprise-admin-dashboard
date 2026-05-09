'use client';

import { logoutAction } from '@/app/actions/auth';
import { useLanguage } from './LanguageProvider';

export default function LogoutButton() {
  const { t } = useLanguage();
  return (
    <button
      onClick={() => logoutAction()}
      className="inline-flex items-center justify-center px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl transition-all active:scale-95 cursor-pointer group"
    >
      <span className="group-hover:mr-1 transition-all">{t('terminateSession')}</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-0 h-3 opacity-0 group-hover:w-3 group-hover:opacity-100 transition-all">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
      </svg>
    </button>
  );
}
