'use client';

import { useState } from 'react';
import { createReportAction, deleteWorkLogAction } from '@/app/dashboard/actions';
import { useLanguage } from '@/components/LanguageProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkLog {
  id?: string;
  description: string;
  minutes: number;
  taskId?: string;
}

export default function DailyReportForm({ tasks, initialLogs = [] }: { tasks: any[], initialLogs?: WorkLog[] }) {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<WorkLog[]>(initialLogs);
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const addLog = (formData: FormData) => {
    const description = formData.get('description') as string;
    const minutes = parseInt(formData.get('minutes') as string);
    const taskId = formData.get('taskId') as string;

    if (!description || !minutes) return;

    const newLog: WorkLog = { description, minutes, taskId: taskId || undefined };
    setLogs([...logs, newLog]);
    (document.getElementById('report-form') as HTMLFormElement)?.reset();
  };

  const removeLog = async (index: number, id?: string) => {
    if (id) await deleteWorkLogAction(id);
    setLogs(logs.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (logs.length === 0) return;
    setIsPending(true);
    const result = await createReportAction(logs);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setIsPending(false);
  };

  const totalMinutes = logs.reduce((acc, log) => acc + log.minutes, 0);

  return (
    <div className="space-y-8">
      {/* Precision Input Form */}
      <form id="report-form" action={addLog} className="grid grid-cols-1 gap-4 p-6 rounded-xl border border-[var(--border)] bg-[var(--accent)]/10">
        <div className="space-y-1">
          <label className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest ml-1">{t('workDescription')}</label>
          <input 
            name="description" 
            required 
            placeholder="OPERATIONAL_LOG..." 
            className="input-clean !py-2 !bg-transparent border-b border-[var(--border)] rounded-none text-xs" 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest ml-1">MINS</label>
            <input 
              name="minutes" 
              type="number" 
              required 
              placeholder="00" 
              className="input-clean !py-2 !bg-transparent border-b border-[var(--border)] rounded-none text-xs font-bold" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest ml-1">{t('mission')}</label>
            <select name="taskId" className="input-clean !py-2 !bg-transparent border-b border-[var(--border)] rounded-none text-xs font-bold appearance-none">
              <option value="">{t('selectTask')}</option>
              {tasks.filter(t => t.status !== 'COMPLETED').map(task => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn-primary !py-3 !text-[9px] rounded-lg mt-2">
           {t('addEntry') || 'ADD_LOG'}
        </button>
      </form>

      {/* List of Entries - Compact */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {logs.map((log, index) => (
            <motion.div 
              key={index} 
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center justify-between p-4 bg-[var(--background)] border border-[var(--border)] rounded-xl"
            >
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-[var(--foreground)] uppercase">{log.description}</p>
                <span className="text-[7px] font-bold text-[var(--muted)] uppercase tracking-widest">{log.minutes}m</span>
              </div>
              <button onClick={() => removeLog(index, log.id)} className="text-[8px] font-bold text-red-500/50 hover:text-red-500 uppercase tracking-widest">
                {t('remove') || 'DEL'}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Final Submission Unit */}
      <div className="pt-8 border-t border-[var(--border)]">
        <div className="flex items-center justify-between mb-6 px-1">
           <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] opacity-40">{t('totalEffort')}</span>
           <span className="text-2xl font-black text-[var(--foreground)] tracking-tight italic">
             {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
           </span>
        </div>
        
        <button 
          onClick={handleSubmit} 
          disabled={isPending || logs.length === 0} 
          className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 relative overflow-hidden border
            ${success 
              ? 'bg-green-500/10 border-green-500/50 text-green-500' 
              : 'bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)] hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] active:scale-[0.98]'
            }
            ${(isPending || logs.length === 0) && !success ? 'opacity-20 grayscale cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            {isPending ? (
              <span className="flex items-center gap-2">
                 <div className="w-1 h-1 bg-[var(--background)] rounded-full animate-bounce" />
                 SYNCING
              </span>
            ) : success ? (
              <span className="flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                 </svg>
                 REPORT_SENT_OK
              </span>
            ) : (
              t('saveReport') || 'SUBMIT_OPERATIONAL_LOG'
            )}
          </span>
          
          {/* Subtle Shimmer Effect on Hover */}
          {!success && !isPending && (
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
          )}
        </button>
      </div>
    </div>
  );
}
