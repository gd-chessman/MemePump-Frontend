'use client'; 

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lang';

export default function Home() {
  const router = useRouter();
  const { t } = useLang();
  useEffect(() => {
   
    router.push('/dashboard');
  }, [router]);

  return (
    <div>
      {t('common.redirecting')}
    </div>
  );
}
