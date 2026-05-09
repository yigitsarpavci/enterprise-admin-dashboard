'use client';

import { useOptimistic, useTransition } from 'react';
import { toggleRoutineAction } from '@/app/dashboard/actions';
import { useLanguage } from '@/components/LanguageProvider';
import { motion } from 'framer-motion';

interface RoutineItem {
  id: string;
  label: string;
}

export default function DailyRoutineChecklist({ items, checkedIds }: { items: RoutineItem[], checkedIds: string[] }) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  // Optimized for Next.js 14/15: Use useOptimistic for immediate, stable UI feedback
  const [optimisticChecked, addOptimisticChecked] = useOptimistic(
    checkedIds,
    (state: string[], itemId: string) => {
      const isChecked = state.includes(itemId);
      return isChecked ? state.filter(id => id !== itemId) : [...state, itemId];
    }
  );

  const toggle = (itemId: string) => {
    const isChecked = optimisticChecked.includes(itemId);
    
    // Background server action
    startTransition(async () => {
      // Immediate UI update via optimistic state inside transition
      addOptimisticChecked(itemId);
      
      const result = await toggleRoutineAction(itemId, !isChecked);
      if (result?.error) {
        console.error(result.error);
        // On error, the optimistic state will automatically revert because checkedIds prop won't change
      }
    });
  };

  const progress = items.length > 0 ? (optimisticChecked.length / items.length) * 100 : 0;

  return (
    <div className="clean-card p-8 h-full relative overflow-hidden group">
      <div className="relative z-10 space-y-8">
        
        {/* Compact Progress Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-black text-[var(--foreground)] tracking-tighter italic">%{progress.toFixed(0)}</span>
            <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] opacity-40">{optimisticChecked.length}/{items.length} {t('syncStatus')}</span>
          </div>
          <div className="h-1.5 bg-[var(--accent)] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-[var(--foreground)]"
            />
          </div>
        </div>

        {/* Precise Routine List */}
        <div className="space-y-2">
          {items.map((item) => {
            const isChecked = optimisticChecked.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all duration-300 cursor-pointer ${
                  isChecked 
                    ? 'bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)] shadow-lg' 
                    : 'bg-[var(--background)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)]'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isChecked ? 'italic' : ''}`}>
                  {item.label}
                </span>
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                   isChecked ? 'border-[var(--background)]/20 bg-[var(--background)]/10' : 'border-[var(--border)]'
                }`}>
                   {isChecked && (
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                     </svg>
                   )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-6 border-t border-[var(--border)]">
           <p className="text-[7px] font-bold text-[var(--muted)] uppercase tracking-[0.4em] text-center opacity-20">
             DISCIPLINE_PROTOCOL_SYNCED
           </p>
        </div>
      </div>
    </div>
  );
}
