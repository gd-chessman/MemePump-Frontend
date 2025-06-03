import { useState } from 'react';
import axios from 'axios';
import { useLang } from '@/lang/useLang';

interface TranslateResponse {
  translation: string;
  error?: string;
}

interface UseTranslateReturn {
  translate: (text: string, sourceLang?: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export const useTranslate = (): UseTranslateReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { lang } = useLang();

  const translate = async (text: string, sourceLang: string = 'kr'): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post<TranslateResponse>('/api/translate', {
        text,
        targetLanguage: lang,
        sourceLanguage: sourceLang
      });

      return response.data.translation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi dịch';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { translate, isLoading, error };
}; 