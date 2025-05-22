import React from 'react';
import { useLang } from './useLang';
import { LangCodes } from './index';

export const LangChange: React.FC = () => {
  const { lang, setLang, langConfig } = useLang();

  const handleLangChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(event.target.value as LangCodes);
  };

  const convertToPascalCase = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
      <select value={lang} onChange={handleLangChange} className='my-1 p-1 outline-none rounded text-black bg-[#f3f4f6] border-[#9ca3af] hover:bg-[#e5e7eb] active:bg-[#e5e7eb] focus:ring-1 focus:ring-[#6b7280]'>
        {
          langConfig?.listLangs &&
          langConfig?.listLangs.map((lang: any, index: any) => (
            <option key={index} value={lang.code}>
              {convertToPascalCase(lang.name)}
            </option>
          ))
        }
      </select>
  );
};
