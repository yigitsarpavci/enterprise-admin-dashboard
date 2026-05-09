'use client';

import { useActionState, useRef, useEffect, useState } from 'react';
import { createUserAction } from '@/app/admin/actions';
import { useLanguage } from './LanguageProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreateUserForm() {
  const { t } = useLanguage();
  const [state, action, isPending] = useActionState(createUserAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setTimeout(() => setIsOpen(false), 2000);
    }
  }, [state]);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary w-full md:w-auto"
      >
        <span className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-45' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {isOpen ? t('cancel') : t('addMember')}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="clean-card p-8 fade-in"
          >
            <form ref={formRef} action={action} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{t('name')}</label>
                  <input name="name" required className="input-clean text-sm" placeholder={t('nameExample')} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{t('securityKey')}</label>
                  <input name="password" type="password" required className="input-clean text-sm" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{t('role')}</label>
                  <select name="role" className="input-clean text-sm font-bold">
                    <option value="USER">{t('userRole')}</option>
                    <option value="ADMIN">{t('adminRole')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{t('department')}</label>
                  <input name="department" className="input-clean text-sm" placeholder={t('departmentExample')} />
                </div>
                <div className="md:col-span-1 lg:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{t('position')}</label>
                  <input name="position" className="input-clean text-sm" placeholder={t('positionExample')} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <button type="submit" disabled={isPending} className="btn-primary w-full sm:w-auto px-10">
                  {isPending ? t('processing') : t('addMember')}
                </button>
                
                {state?.error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{state.error}</p>}
                {state?.success && <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest">{state.success}</p>}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
