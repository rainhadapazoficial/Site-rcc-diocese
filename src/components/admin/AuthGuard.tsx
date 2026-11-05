"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                await fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
                if (pathname !== "/admin/login") {
                    router.push("/admin/login");
                }
            } else {
                await fetch("/api/auth/session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ access_token: session.access_token }),
                }).catch(() => {});
                setAuthenticated(true);
            }
            setIsLoading(false);
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            if (!session) {
                fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
                router.push("/admin/login");
                setAuthenticated(false);
            } else {
                fetch("/api/auth/session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ access_token: session.access_token }),
                }).catch(() => {});
                setAuthenticated(true);
            }
        });

        return () => subscription.unsubscribe();
    }, [router, pathname]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-brand-blue mb-4" />
                <p className="text-slate-500 font-medium italic">Verificando acesso...</p>
            </div>
        );
    }

    if (!authenticated && pathname !== "/admin/login") {
        return null; // Will redirect via useEffect
    }

    return <>{children}</>;
}
