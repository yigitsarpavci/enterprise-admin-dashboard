'use client';

import { useOptimistic, useTransition, useState, useEffect } from 'react';
import { updateTaskStatusAction } from '@/app/dashboard/actions';
import { useLanguage } from '@/components/LanguageProvider';
import { motion } from 'framer-motion';

interface UserTaskItemProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    deadline: Date | null;
  };
}

export default function UserTaskItem({ task }: UserTaskItemProps) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Optimized for Next.js 14/15: Use useOptimistic for immediate, stable UI feedback
  const [optimisticStatus, addOptimisticStatus] = useOptimistic(
    task.status,
    (state: string, newStatus: string) => newStatus
  );

  const handleStatusChange = (newStatus: string) => {
    // Immediate UI update
    addOptimisticStatus(newStatus);

    // Background server action
    startTransition(async () => {
      const result = await updateTaskStatusAction(task.id, newStatus);
      if (result?.error) {
        console.error(result.error);
        // Automatically reverts to task.status if an error occurs
      }
    });
  };

  const isCompleted = optimisticStatus === 'COMPLETED';
  const isInProgress = optimisticStatus === 'IN_PROGRESS';

  return (
    <motion.div 
      layout
      className={`clean-card p-6 group transition-all duration-500 ${
        isCompleted ? 'bg-[var(--accent)]/10 opacity-50' : ''
      }`}
    >
      <div className="flex flex-col gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${
              isCompleted ? 'bg-[var(--muted)] opacity-30' : 
              isInProgress ? 'bg-green-500 animate-pulse' : 
              'bg-[var(--border)]'
            }`} />
            <h3 className={`text-sm font-bold tracking-tight uppercase ${
              isCompleted ? 'line-through' : 'text-[var(--foreground)]'
            }`}>
              {task.title}
            </h3>
          </div>
          
          {task.description && (
            <p className="text-[10px] font-medium leading-relaxed text-[var(--muted)] line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-4">
             <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest">
               {mounted && task.deadline ? new Date(task.deadline).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }) : 'NO_DATE'}
             </span>
             <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border border-[var(--border)]`}>
                {t(optimisticStatus.toLowerCase().replace('_', '-'))}
             </div>
          </div>

          <div className="flex gap-2">
            {!isCompleted ? (
              <>
                {!isInProgress && (
                  <button
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    className="text-[8px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    {t('start')}
                  </button>
                )}
                <button
                  onClick={() => handleStatusChange('COMPLETED')}
                  className="text-[8px] font-bold text-green-500 hover:text-green-400 uppercase tracking-widest transition-colors cursor-pointer"
                >
                  {isPending ? '...' : t('markDone')}
                </button>
              </>
            ) : (
              <button
                onClick={() => handleStatusChange('IN_PROGRESS')}
                className="text-[8px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] uppercase tracking-widest transition-colors cursor-pointer"
              >
                {t('reopen')}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
