'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, TranslationKey } from '@/lib/translations';
import { useRouter } from 'next/navigation';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('tr');
  const router = useRouter();

  useEffect(() => {
    // Check cookie first (server source of truth)
    const cookies = document.cookie.split('; ');
    const langCookie = cookies.find(row => row.startsWith('nexus-lang='));
    const savedLang = langCookie ? langCookie.split('=')[1] as Language : localStorage.getItem('nexus-lang') as Language;
    
    if (savedLang && (savedLang === 'tr' || savedLang === 'en')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('nexus-lang', lang);
    document.cookie = `nexus-lang=${lang}; path=/; max-age=31536000; SameSite=Lax`; // 1 year
    
    // Crucial: Refresh to update server-side translations
    router.refresh();
  };

  const t = (key: TranslationKey) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
