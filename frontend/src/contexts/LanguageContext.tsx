import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useUser } from './AuthContext';
import i18n from '../i18n';

export type LanguageId = 'en' | 'pt';

interface LanguageOption {
  id: LanguageId;
  name: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: 'en', name: 'English' },
  { id: 'pt', name: 'Português' },
];

const STORAGE_KEY_PREFIX = 'lang_';

interface LanguageContextType {
  language: LanguageId;
  setLanguage: (lang: LanguageId) => void;
  availableLanguages: typeof LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function loadStoredLanguage(userId: string | undefined): LanguageId {
  if (!userId) return 'en';
  try {
    const key = `${STORAGE_KEY_PREFIX}${userId}`;
    const stored = localStorage.getItem(key);
    if (stored === 'en' || stored === 'pt') {
      return stored as LanguageId;
    }
  } catch {
    // ignore
  }
  return 'en';
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const user = useUser();
  const [language, setLanguageState] = useState<LanguageId>(() =>
    loadStoredLanguage(user?.id)
  );

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    const stored = loadStoredLanguage(user?.id);
    setLanguageState(stored);
    i18n.changeLanguage(user?.id ? stored : 'en');
  }, [user?.id]);

  const setLanguage = (lang: LanguageId) => {
    if (!user?.id) return;
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${user.id}`, lang);
    } catch {
      // ignore
    }
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    availableLanguages: LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
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
