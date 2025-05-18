"use client";
import React, { createContext, useState, useEffect } from 'react';
import { langConfig as importedLangConfig } from "./index";

export interface LangContextProps {
  lang: string;
  setLang: (lang: string) => void;
  langConfig: typeof importedLangConfig;
}

export const LangContext = createContext<LangContextProps | undefined>(undefined);

interface LangProviderProps {
  children: React.ReactNode;
  initialLang?: string; // Nhận giá trị ngôn ngữ từ SSR
  langConfig?: typeof importedLangConfig;
}

export const LangProvider: React.FC<LangProviderProps> = ({ 
  children, 
  initialLang = 'en',
  langConfig 
}) => {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<string>(initialLang);

  useEffect(() => {
    setMounted(true);
    const storedLang = localStorage.getItem('appLang');
    if (storedLang) {
      setLang(storedLang);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('appLang', lang);
      document.documentElement.lang = lang;
    }
  }, [lang, mounted]);

  const config = langConfig || importedLangConfig;

  return (
    <LangContext.Provider value={{ lang, setLang, langConfig: config }}>
      {children}
    </LangContext.Provider>
  );
};
