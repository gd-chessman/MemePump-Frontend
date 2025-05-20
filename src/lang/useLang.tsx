'use client';
import { useContext } from 'react';
import { LangContext } from './LangProvider';

type TranslationValue = string | string[] | { [key: string]: TranslationValue };

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error('useLang must be used within a LangProvider');
  }

  const getNestedValue = (obj: any, path: string[]): TranslationValue => {
    let current = obj;
    for (const key of path) {
      if (current === undefined || current === null) {
        return path.join(".");
      }
      current = current[key];
    }
    return current;
  };

  const t = (key: string): string => {
    const value = getNestedValue(context.translations, key.split("."));
    if (typeof value === "string") {
      return value;
    }
    if (Array.isArray(value)) {
      return value.join("\n");
    }
    return key;
  };

  const tArray = (key: string): string[] => {
    const value = getNestedValue(context.translations, key.split("."));
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === "string") {
      return [value];
    }
    return [key];
  };

  return {
    t,
    tArray,
    lang: context.lang,
    setLang: context.setLang,
  };
};
