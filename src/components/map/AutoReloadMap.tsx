'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AutoReloadMapProps {
    refreshInterval?: number; // em segundos
}

export function AutoReloadMap({ refreshInterval = 30 }: AutoReloadMapProps) {
    const router = useRouter();

    useEffect(() => {
        // Revalidar a cada X segundos
        const interval = setInterval(() => {
            router.refresh();
        }, refreshInterval * 1000);

        return () => clearInterval(interval);
    }, [router, refreshInterval]);

    return null;
}
