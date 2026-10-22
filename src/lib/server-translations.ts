import { cookies } from 'next/headers';
import { translations, TranslationKey, Language } from './translations';

export async function getTranslation() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('nexus-lang')?.value || 'tr') as Language;
  
  return (key: TranslationKey | any, params?: Record<string, string | number>) => {
    let text = (translations[lang] as any)?.[key] || (translations['en'] as any)?.[key] || key;
    if (params && typeof text === 'string') {
      Object.entries(params).forEach(([pKey, pVal]) => {
        text = text.replace(new RegExp(`{${pKey}}`, 'g'), String(pVal));
      });
    }
    return text;
  };
}

export async function getLanguage() {
  const cookieStore = await cookies();
  return (cookieStore.get('nexus-lang')?.value || 'tr') as Language;
}
