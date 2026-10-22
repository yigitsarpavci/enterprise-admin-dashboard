'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageProvider';
import { motion } from 'framer-motion';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { label: t('dashboard'), href: '/admin', icon: (active: boolean) => <svg className={`w-4 h-4 ${active ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25zM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25z" /></svg> },
    { label: t('personnel'), href: '/admin/employees', icon: (active: boolean) => <svg className={`w-4 h-4 ${active ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg> },
    { label: t('missions'), href: '/admin/tasks', icon: (active: boolean) => <svg className={`w-4 h-4 ${active ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> },
    { label: t('operationalHistory'), href: '/admin/daily-reports', icon: (active: boolean) => <svg className={`w-4 h-4 ${active ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> },
    { label: t('operationalAudit'), href: '/admin/routine-reports', icon: (active: boolean) => <svg className={`w-4 h-4 ${active ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h3.75a2.25 2.25 0 0 1 2.25 2.25v13.5a2.25 2.25 0 0 1-2.25 2.25h-3.75a2.25 2.25 0 0 1-2.25 2.25V4.5a2.25 2.25 0 0 1 2.25-2.25Z" /></svg> },
    { label: t('comparison'), href: '/admin/comparison', icon: (active: boolean) => <svg className={`w-4 h-4 ${active ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z" /></svg> },
    { label: t('knowledgeBase'), href: '/admin/knowledge-base', icon: (active: boolean) => <svg className={`w-4 h-4 ${active ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg> },
  ];

  return (
    <aside className="fixed bottom-0 left-0 z-50 w-full md:relative md:w-72 md:h-screen md:sticky md:top-0 bg-[var(--background)] border-t md:border-t-0 md:border-r border-[var(--border)] flex flex-row md:flex-col items-center py-4 md:py-12 px-6">

      <nav className="flex-grow flex flex-row md:flex-col justify-around md:justify-start gap-1 md:gap-3 w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-2xl transition-all duration-500 relative group ${
                isActive 
                  ? 'bg-[var(--accent)] text-[var(--foreground)] shadow-sm' 
                  : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]/50'
              }`}
            >
              {item.icon(isActive)}
              <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-[var(--foreground)]' : 'text-[var(--muted)] group-hover:text-[var(--foreground)]'}`}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div 
                   layoutId="sidebar-active"
                   className="absolute right-0 top-1/4 bottom-1/4 w-1 bg-[var(--foreground)] rounded-l-full hidden md:block"
                   transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="hidden md:block mt-auto w-full pt-8 border-t border-[var(--border)]">
         <p className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-[0.4em] text-center opacity-30 italic">Performo Intelligence</p>
      </div>
    </aside>
  );
}
