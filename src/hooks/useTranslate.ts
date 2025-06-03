import { useState, useEffect } from 'react';
import translate from 'translate';
import { useLang } from '@/lang/useLang';

interface UseTranslateReturn {
  translatedText: string;
  isLoading: boolean;
  error: string | null;
}

const convertLangCode = (lang: string): string => {
  switch (lang.toLowerCase()) {
    case 'kr':
      return 'ko';
    case 'jp':
      return 'ja';
    default:
      return lang;
  }
};

export const useTranslate = (text: string, sourceLang: string = 'ko'): UseTranslateReturn => {
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { lang } = useLang();

  useEffect(() => {
    const translateText = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const translation = await translate(text, {
          from: convertLangCode(sourceLang),
          to: convertLangCode(lang)
        });

        if (!translation) {
          throw new Error('Không nhận được bản dịch');
        }

        setTranslatedText(translation);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Lỗi khi dịch';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [text, sourceLang, lang]);

  return { translatedText, isLoading, error };
}; 