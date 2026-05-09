'use client';

import { useActionState, useRef, useEffect, useState } from 'react';
import { createTaskAction } from '@/app/admin/actions';
import { useLanguage } from './LanguageProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface UserOption {
  id: string;
  name: string;
}

export default function CreateTaskForm({ employees }: { employees: UserOption[] }) {
  const { t } = useLanguage();
  const [state, action, isPending] = useActionState(createTaskAction, undefined);
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
          {isOpen ? t('cancel') : t('createTask')}
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
                  <label className="subheading-premium !text-[9px] !mb-1 ml-1 opacity-50">{t('employee')}</label>
                  <select name="employeeId" required className="input-clean !py-4 text-xs font-bold">
                    <option value="">{t('allDepartments')}...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-1 lg:col-span-2 space-y-2">
                  <label className="subheading-premium !text-[9px] !mb-1 ml-1 opacity-50">{t('title')}</label>
                  <input name="title" required className="input-clean !py-4 text-xs" placeholder={t('taskTitleExample')} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="subheading-premium !text-[9px] !mb-1 ml-1 opacity-50">{t('workDescription')}</label>
                  <textarea name="description" rows={1} className="input-clean !py-4 text-xs resize-none" placeholder={t('waitingForData')} />
                </div>
                <div className="space-y-2">
                  <label className="subheading-premium !text-[9px] !mb-1 ml-1 opacity-50">{t('status')}</label>
                  <select name="status" required className="input-clean !py-4 text-xs font-bold">
                    <option value="TODO">{t('todo')}</option>
                    <option value="IN_PROGRESS">{t('inProgress')}</option>
                    <option value="COMPLETED">{t('completed')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="subheading-premium !text-[9px] !mb-1 ml-1 opacity-50">{t('deadline')}</label>
                  <input name="deadline" type="date" className="input-clean !py-4 text-xs" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-8 border-t border-[var(--border)]">
                <button type="submit" disabled={isPending} className="btn-primary w-full sm:w-auto !px-12 !py-4">
                  {isPending ? t('processing') : t('createTask')}
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
