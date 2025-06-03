'use client';
import { useTranslate } from '@/hooks/useTranslate';
import { useLang } from '@/lang/useLang';
import { LangCodes } from '@/lang';
import React, { useState } from 'react';

export default function TestPage() {
  const { translate, isLoading, error } = useTranslate();
  const { lang, setLang } = useLang();
  const [text, setText] = useState('안녕하세요');
  const [translatedText, setTranslatedText] = useState('');

  const handleTranslate = async () => {
    try {
      const result = await translate(text);
      setTranslatedText(result);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Translation</h1>
      
      <div className="mb-4">
        <label className="block mb-2">Current Language: {lang}</label>
        <select 
          value={lang} 
          onChange={(e) => setLang(e.target.value as LangCodes)}
          className="border p-2 rounded"
        >
          <option value="en">English</option>
          <option value="vi">Tiếng Việt</option>
          <option value="kr">한국어</option>
          <option value="jp">日本語</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Korean Text:</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="Enter Korean text"
        />
      </div>

      <button
        onClick={handleTranslate}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {isLoading ? 'Translating...' : 'Translate'}
      </button>

      {error && (
        <div className="text-red-500 mt-2">
          Error: {error}
        </div>
      )}

      {translatedText && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">Translation Result:</h2>
          <div className="border p-4 rounded bg-gray-50">
            {translatedText}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-bold mb-2">Quick Test Examples:</h2>
        <div className="space-y-2">
          <button
            onClick={() => setText('안녕하세요')}
            className="bg-gray-200 px-3 py-1 rounded mr-2"
          >
            Hello
          </button>
          <button
            onClick={() => setText('감사합니다')}
            className="bg-gray-200 px-3 py-1 rounded mr-2"
          >
            Thank you
          </button>
          <button
            onClick={() => setText('잘 부탁드립니다')}
            className="bg-gray-200 px-3 py-1 rounded"
          >
            Please take care of me
          </button>
        </div>
      </div>
    </div>
  );
}
