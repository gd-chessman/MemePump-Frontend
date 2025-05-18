import { useLang } from '@/lang';
import React, { useState, useEffect } from 'react'

export default function LogWarring() {
    const { t } = useLang();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading time
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className='flex flex-col items-center justify-center h-[80vh]'>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className='flex flex-col items-center justify-center h-[80vh]'>
            <p className='text-yellow-500'>{t("errors.PLTVI")}</p>
        </div>
    )
}
