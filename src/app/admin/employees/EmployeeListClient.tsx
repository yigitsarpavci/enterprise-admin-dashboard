'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import DeleteUserButton from '@/components/DeleteUserButton';
import { useLanguage } from '@/components/LanguageProvider';
import { bulkDeleteUsersAction, bulkCreateTaskAction } from '@/app/admin/actions';
import { motion, AnimatePresence } from 'framer-motion';

interface Employee {
  id: string;
  name: string;
  email: string | null;
  role: string;
  lastActiveAt: Date | null;
  employeeProfile?: {
    department: string | null;
    position: string | null;
  } | null;
}

export default function EmployeeListClient({ users }: { users: any[] }) {
  const { t } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkTaskOpen, setIsBulkTaskOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Intelligent Real-time Filtering
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.employeeProfile?.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.employeeProfile?.position?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUsers.map(u => u.id));
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(t('confirmDelete'))) {
      setIsPending(true);
      const result = await bulkDeleteUsersAction(selectedIds);
      if (result.success) setSelectedIds([]);
      if (result.error) console.error(result.error);
      setIsPending(false);
    }
  };

  const handleBulkTask = async (formData: FormData) => {
    setIsPending(true);
    const result = await bulkCreateTaskAction(selectedIds, formData);
    if (result.success) {
      setIsBulkTaskOpen(false);
      setSelectedIds([]);
    }
    if (result.error) console.error(result.error);
    setIsPending(false);
  };

  return (
    <div className="space-y-8">
      {/* Search & Bulk Control Unit */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="relative flex-grow group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <input 
            type="text"
            placeholder={t('search') || 'SEARCH_PROTOCOL...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-clean pl-12 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-950 transition-all text-sm font-bold placeholder:text-zinc-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >✕</button>
          )}
        </div>

        <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-2 rounded-2xl shrink-0">
           <button 
            onClick={toggleAll}
            className={`px-6 py-2.5 subheading-premium !tracking-[0.1em] !mb-0 rounded-xl transition-all ${selectedIds.length === filteredUsers.length && filteredUsers.length > 0 ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950' : 'text-zinc-400 hover:text-zinc-600'}`}
           >
             {selectedIds.length > 0 ? `${selectedIds.length} ${t('selected')}` : t('selectAll')}
           </button>
        </div>
      </div>

      {/* Grid of Results */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredUsers.length === 0 ? (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="py-32 text-center clean-card border-dashed"
             >
                <p className="subheading-premium">{t('noMissionsHistory')}</p>
             </motion.div>
          ) : (
            filteredUsers.map((u) => {
              const isSelected = selectedIds.includes(u.id);
              const isOnline = u.lastActiveAt && new Date().getTime() - new Date(u.lastActiveAt).getTime() < 5 * 60 * 1000;
              
              return (
                <motion.div 
                  key={u.id} 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex items-center gap-6 p-6 rounded-[24px] border transition-all duration-300 ${
                    isSelected ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100' : 'bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <div className="relative shrink-0">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleSelect(u.id)}
                      className={`w-6 h-6 rounded-lg border-2 appearance-none cursor-pointer transition-all ${
                        isSelected ? 'bg-transparent border-white/40 dark:border-zinc-900/40' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                      }`}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white dark:text-zinc-900">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-grow flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5 min-w-[280px]">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black italic border transition-colors ${isSelected ? 'bg-white/10 border-white/20 text-white' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400'}`}>
                        {u.name?.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <Link href={`/admin/employees/${u.id}`} className={`text-base font-black italic tracking-tight hover:underline transition-colors ${isSelected ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                          {u.name}
                        </Link>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isSelected ? 'text-white/60' : 'text-zinc-400'}`}>{u.email}</p>
                      </div>
                      {isOnline && (
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse" />
                      )}
                    </div>

                    <div className="flex items-center gap-10">
                      <div className="hidden lg:flex flex-col items-end min-w-[140px]">
                        <span className={`subheading-premium !tracking-[0.1em] !mb-1 text-[8px] ${isSelected ? 'text-white/40' : ''}`}>{t('department')}</span>
                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>{u.employeeProfile?.department || '-'}</span>
                      </div>
                      <div className="flex flex-col items-end min-w-[100px]">
                        <span className={`subheading-premium !tracking-[0.1em] !mb-1 text-[8px] ${isSelected ? 'text-white/40' : ''}`}>{t('role')}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>
                          {t(u.role === 'ADMIN' ? 'adminRole' : 'userRole')}
                        </span>
                      </div>
                      <div className={`flex items-center gap-4 pl-8 border-l ${isSelected ? 'border-white/10' : 'border-zinc-100 dark:border-zinc-800'}`}>
                        <DeleteUserButton userId={u.id} userName={u.name} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Optimized Floating Bulk Toolbar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-6"
          >
            {isBulkTaskOpen ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-10 rounded-[32px] shadow-2xl w-[450px] fade-in relative">
                <button 
                  onClick={() => setIsBulkTaskOpen(false)} 
                  className="absolute right-6 top-6 w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-sm hover:bg-zinc-100"
                >✕</button>
                
                <div className="mb-8">
                  <h3 className="heading-premium text-xl text-zinc-900 dark:text-white uppercase">{t('bulkTaskAssign')}</h3>
                  <p className="subheading-premium !mt-2">{selectedIds.length} {t('itemsSelected')}</p>
                </div>

                <form action={handleBulkTask} className="space-y-6">
                  <div className="space-y-2">
                    <label className="subheading-premium !tracking-[0.1em]">{t('title')}</label>
                    <input name="title" required placeholder="Mission_Title..." className="input-clean" />
                  </div>
                  <div className="space-y-2">
                    <label className="subheading-premium !tracking-[0.1em]">{t('workDescription')}</label>
                    <textarea name="description" placeholder="Mission_Details..." className="input-clean resize-none h-24" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="subheading-premium !tracking-[0.1em]">{t('status')}</label>
                      <select name="status" className="input-clean font-bold appearance-none">
                        <option value="TODO">{t('todo')}</option>
                        <option value="IN_PROGRESS">{t('inProgress')}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="subheading-premium !tracking-[0.1em]">{t('deadline')}</label>
                      <input name="deadline" type="date" className="input-clean" />
                    </div>
                  </div>
                  <button type="submit" disabled={isPending} className="btn-primary w-full py-4">
                    {isPending ? t('syncing') : t('createTask')}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 px-10 py-6 rounded-full shadow-2xl flex items-center gap-10 border border-white/10 dark:border-zinc-200">
                <div className="flex items-center gap-3 pr-10 border-r border-white/20 dark:border-zinc-300">
                  <div className="w-8 h-8 bg-white/10 dark:bg-zinc-900/10 rounded-lg flex items-center justify-center font-black italic">
                    {selectedIds.length}
                  </div>
                  <span className="subheading-premium !tracking-[0.2em] !mb-0 !text-white dark:!text-zinc-900">
                    {t('selected')}
                  </span>
                </div>
                <div className="flex items-center gap-8">
                  <button 
                    onClick={() => setIsBulkTaskOpen(true)}
                    className="subheading-premium !tracking-[0.1em] !mb-0 !text-cyan-400 dark:!text-cyan-600 hover:opacity-80 transition-opacity"
                  >
                    {t('assignTask')}
                  </button>
                  <button 
                    onClick={handleBulkDelete}
                    className="subheading-premium !tracking-[0.1em] !mb-0 !text-red-400 dark:!text-red-600 hover:opacity-80 transition-opacity"
                  >
                    {t('bulkDelete')}
                  </button>
                </div>
                <button 
                  onClick={() => setSelectedIds([])}
                  className="w-10 h-10 rounded-full bg-white/5 dark:bg-zinc-900/5 flex items-center justify-center text-sm hover:bg-white/10 transition-all"
                >✕</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
