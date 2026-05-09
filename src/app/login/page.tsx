'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';

export default function LoginPage() {
  const { t, language, setLanguage } = useLanguage();
  const [state, action, isPending] = useActionState(loginAction, undefined);
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '';

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-8 transition-colors duration-500">
      
      {/* Brand Header - Natural & Balanced */}
      <div className="mb-16 text-center fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--foreground)] rounded-[28px] mb-8 shadow-xl transition-transform hover:scale-105 duration-500">
          <span className="text-[var(--background)] font-bold text-3xl italic tracking-tighter">P</span>
        </div>
        <h1 className="text-3xl heading-premium uppercase tracking-tight">
          {t('welcomeBack') || 'WELCOME TO NEXUS'}
        </h1>
        <p className="subheading-premium !tracking-[0.3em] mt-4 opacity-50">
          {t('authorizedAccess') || 'AUTHORIZED ACCESS ONLY'}
        </p>
      </div>

      {/* Main Login Portal - Natural Elite Standard */}
      <div className="w-full max-w-[420px] clean-card p-12">
        <form action={action} className="space-y-10">
          <input type="hidden" name="redirectTo" value={callbackUrl} />
          
          {state?.error && (
            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-500 text-[11px] font-bold uppercase tracking-widest text-center">
              {state.error}
            </div>
          )}

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="block subheading-premium ml-1">
                {t('identity') || 'IDENTITY / USERNAME'}
              </label>
              <input
                name="name"
                type="text"
                required
                autoFocus
                placeholder="USER_ID"
                className="input-clean !bg-[var(--accent)] !border-[var(--border)] focus:!border-[var(--muted)]"
              />
            </div>

            <div className="space-y-3">
              <label className="block subheading-premium ml-1">
                {t('securityKey') || 'SECURITY KEY'}
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="input-clean !bg-[var(--accent)] !border-[var(--border)] focus:!border-[var(--muted)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full !py-5 !text-[12px] uppercase tracking-[0.2em] shadow-lg hover:shadow-xl transition-all"
          >
            {isPending ? (t('authenticating') || 'SYNCING...') : (t('enterSystem') || 'ENTER SYSTEM')}
          </button>
        </form>

        {/* Natural Language Switcher */}
        <div className="mt-12 flex items-center justify-center gap-6 pt-10 border-t border-[var(--border)]">
           <button 
             onClick={() => { setLanguage('tr'); router.refresh(); }}
             className={`text-[11px] font-bold tracking-[0.1em] px-4 py-2 transition-all rounded-lg ${language === 'tr' ? 'bg-[var(--accent)] text-[var(--foreground)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
           >TR</button>
           <button 
             onClick={() => { setLanguage('en'); router.refresh(); }}
             className={`text-[11px] font-bold tracking-[0.1em] px-4 py-2 transition-all rounded-lg ${language === 'en' ? 'bg-[var(--accent)] text-[var(--foreground)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
           >EN</button>
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center gap-6 opacity-20">
         <p className="text-[10px] font-bold uppercase tracking-[0.5em]">
            {t('encryptedSession') || 'SECURE_CHANNEL_ACTIVE'}
         </p>
         <div className="w-px h-12 bg-gradient-to-b from-[var(--foreground)] to-transparent" />
      </div>
    </div>
  );
}
