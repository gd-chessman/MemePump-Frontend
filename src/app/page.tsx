'use client'; 

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLang } from '@/lang';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLang();

  useEffect(() => {
    const refParam = searchParams.get('ref');
    
    if (refParam) {
      // Store ref in session storage with 1 day expiration
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 1);
      
      sessionStorage.setItem('ref', refParam);
      sessionStorage.setItem('refExpiration', expirationDate.toISOString());
    }
    
    router.push('/dashboard');
  }, [router, searchParams]);

  return (
    <div>
      {t('common.redirecting')}
    </div>
  );
}
