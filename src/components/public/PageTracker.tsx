"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PageTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Ignorar caminhos administrativos
        if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return;

        const trackPage = async () => {
            try {
                await fetch('/api/public/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slug: pathname || '/' })
                });
            } catch {
                // Silencioso em caso de erro para não afetar o usuário
                console.warn("Analytics ping failed");
            }
        };

        // Pequeno atraso para garantir que a página carregou e evitar pings falsos de navegação rápida
        const timer = setTimeout(trackPage, 2000);
        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    return null; // Componente invisível
}
