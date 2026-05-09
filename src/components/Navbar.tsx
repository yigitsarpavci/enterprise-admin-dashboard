'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';
import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { useTheme } from './ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname === '/login') return null;

  return (
    <nav className={`sticky top-0 z-[100] w-full transition-all duration-700 ${
      scrolled ? 'py-3 bg-[var(--background)]/80 backdrop-blur-2xl border-b border-[var(--border)]' : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex justify-between items-center h-14">
          
          {/* Brand & Status */}
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-4 group cursor-default">
              <div className="w-10 h-10 bg-[var(--foreground)] rounded-2xl flex items-center justify-center shadow-lg transition-all duration-700 group-hover:rotate-[360deg]">
                <span className="text-[var(--background)] font-black text-xl italic tracking-tighter">P</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold italic uppercase tracking-tighter text-[var(--foreground)]">
                  Performo
                </span>
                <span className="text-[7px] font-black uppercase tracking-[0.3em] text-green-500/60 leading-none">Online</span>
              </div>
            </div>
          </div>

          {/* Controls Unit */}
          <div className="flex items-center gap-8">

            {/* Balanced Control Unit */}
            <div className="flex items-center gap-2 bg-[var(--accent)] p-1 rounded-2xl border border-[var(--border)]">
               <button 
                  onClick={toggleTheme}
                  className="w-9 h-9 rounded-xl hover:bg-[var(--card)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
                  aria-label="Toggle Theme"
               >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={theme}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {theme === 'dark' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25m-13.5 0h-2.25m15.356-6.356l-1.591 1.591M6.784 17.216l-1.591 1.591m12.728 0l-1.591-1.591M6.784 6.784L5.193 5.193M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                        </svg>
                      )}
                    </motion.div>
                  </AnimatePresence>
               </button>

               <button 
                  onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
                  className="w-9 h-9 rounded-xl hover:bg-[var(--card)] text-[9px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
               >
                  {language.toUpperCase()}
               </button>
            </div>

            {!loading && (
              user ? (
                <div className="flex items-center gap-5 pl-8 border-l border-[var(--border)]">
                  <div className="hidden sm:flex flex-col items-end">
                     <span className="text-[13px] font-bold italic tracking-tight text-[var(--foreground)]">{user.name}</span>
                      <span className="subheading-premium !text-[7px] !mb-0 opacity-40 uppercase tracking-widest">
                        {user.role === 'ADMIN' ? 'ADMIN' : 'USER'}
                      </span>
                  </div>
                  <LogoutButton />
                </div>
              ) : (
                <Link href="/login" className="btn-primary !py-2.5 !px-6 !text-[10px]">{t('enterSystem')}</Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`px-5 py-2 subheading-premium !text-[10px] !tracking-[0.1em] !mb-0 transition-all rounded-xl relative z-10 ${
        active ? 'text-[var(--foreground)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
      }`}
    >
      {children}
      {active && (
        <motion.div 
          layoutId="nav-active"
          className="absolute inset-0 bg-[var(--accent)] rounded-xl -z-10 border border-[var(--border)]"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  );
}
