import { cookies } from 'next/headers';
import { translations, TranslationKey, Language } from './translations';

export async function getTranslation() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('nexus-lang')?.value || 'tr') as Language;
  
  return (key: TranslationKey) => {
    return translations[lang][key] || key;
  };
}

export async function getLanguage() {
  const cookieStore = await cookies();
  return (cookieStore.get('nexus-lang')?.value || 'tr') as Language;
}
