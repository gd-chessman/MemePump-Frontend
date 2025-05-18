'use client';
import { useContext } from 'react';
import { LangContext } from './LangProvider';
import { getTranslation, LangCodes } from './index';

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error('useLang must be used within a LangProvider');
  }
  return {
    ...context,
    t: getTranslation(context.lang as LangCodes)
  };
};
