import React, { createContext, useContext, useState, useCallback } from 'react';
import { Language, translations } from './translations';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
  tArray: (path: string) => string[];
  tWorkflow: (path: string) => Record<string, string>[];
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getNestedValue(obj: any, path: string, lang: Language): any {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === undefined || current === null) return path;
    current = current[key];
  }

  if (current === undefined || current === null) return path;

  // If result has language keys, resolve
  if (typeof current === 'object' && current !== null && lang in current) {
    return current[lang];
  }

  return current;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'th' ? 'en' : 'th');
  }, []);

  const t = useCallback((path: string): string => {
    const result = getNestedValue(translations, path, language);
    return typeof result === 'string' ? result : path;
  }, [language]);

  const tArray = useCallback((path: string): string[] => {
    const result = getNestedValue(translations, path, language);
    return Array.isArray(result) ? result : [];
  }, [language]);

  const tWorkflow = useCallback((path: string): Record<string, string>[] => {
    const result = getNestedValue(translations, path, language);
    return Array.isArray(result) ? result : [];
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t, tArray, tWorkflow }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
