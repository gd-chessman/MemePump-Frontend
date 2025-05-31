"use client";
import React, { createContext, useState, useEffect } from 'react';
import { langConfig as importedLangConfig, LangCodes } from "./index";
import enTranslations from "./locales/en.json";
import krTranslations from "./locales/kr.json";
import viTranslations from "./locales/vi.json";
import jpTranslations from "./locales/jp.json";

const translations = {
  en: enTranslations,
  kr: krTranslations,
  vi: viTranslations,
  jp: jpTranslations,
};

export interface LangContextProps {
  lang: LangCodes;
  setLang: (lang: LangCodes) => void;
  langConfig: typeof importedLangConfig;
  translations: typeof enTranslations;
}

export const LangContext = createContext<LangContextProps | null>(null);

interface LangProviderProps {
  children: React.ReactNode;
  initialLang?: LangCodes; // Nhận giá trị ngôn ngữ từ SSR
  langConfig?: typeof importedLangConfig;
}

export const LangProvider: React.FC<LangProviderProps> = ({ 
  children, 
  initialLang = 'kr',
  langConfig 
}) => {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<LangCodes>(initialLang);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("lang") as LangCodes;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("lang", lang);
      document.documentElement.lang = lang;
    }
  }, [lang, mounted]);

  const config = langConfig || importedLangConfig;

  const handleSetLang = (newLang: LangCodes) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  return (
    <LangContext.Provider
      value={{
        lang,
        setLang: handleSetLang,
        langConfig: config,
        // @ts-expect-error: Suppress type error because MockDatafeed is compatible at runtime
        translations: translations[lang],
      }}
    >
      {children}
    </LangContext.Provider>
  );
};
