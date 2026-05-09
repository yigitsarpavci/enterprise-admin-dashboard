'use client';

import { useTransition } from 'react';
import { deleteUserAction } from '@/app/admin/actions';
import { useLanguage } from './LanguageProvider';

export default function DeleteUserButton({ userId, userName }: { userId: string, userName: string }) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm(t('terminateNodeConfirm', { name: userName }))) {
      startTransition(async () => {
        const result = await deleteUserAction(userId);
        if (result?.error) {
          alert(result.error);
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center justify-center p-2.5 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all active:scale-90 disabled:opacity-50 group"
      title={t('terminateUser')}
    >
      {isPending ? (
        <div className="w-4 h-4 border-2 border-red-500/20 border-t-red-500 animate-spin rounded-full" />
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      )}
    </button>
  );
}
