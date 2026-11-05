import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const ADMIN_TOKEN_COOKIE = "rcc_admin_token";

export function extractCookieValue(cookieHeader: string | null, name: string): string | null {
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(";");
    for (const cookie of cookies) {
        const [rawKey, ...rawValParts] = cookie.trim().split("=");
        if (rawKey === name) {
            return decodeURIComponent(rawValParts.join("="));
        }
    }
    return null;
}

export function extractAdminToken(request: Request): string | null {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7).trim();
        if (token && token !== "undefined" && token !== "null") {
            return token;
        }
    }

    const cookieToken = extractCookieValue(request.headers.get("cookie"), ADMIN_TOKEN_COOKIE);
    if (cookieToken && cookieToken !== "undefined" && cookieToken !== "null") {
        return cookieToken;
    }

    return null;
}

export async function verifyAdminRequest(request: Request) {
    const token = extractAdminToken(request);
    if (!token) {
        return {
            authorized: false as const,
            response: NextResponse.json({ error: "Não autorizado." }, { status: 401 }),
        };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return {
            authorized: false as const,
            response: NextResponse.json({ error: "Configuração de autenticação indisponível." }, { status: 500 }),
        };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
        return {
            authorized: false as const,
            response: NextResponse.json({ error: "Sessão inválida ou expirada." }, { status: 401 }),
        };
    }

    return {
        authorized: true as const,
        user: data.user,
        token,
        supabase,
    };
}

export function verifyBearerSecret(authHeader: string | null, secretEnvVar: string | undefined): boolean {
    if (!secretEnvVar || secretEnvVar.trim() === "") {
        return false;
    }
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return false;
    }
    const provided = authHeader.slice(7).trim();
    const expected = secretEnvVar.trim();
    if (!provided || provided.length !== expected.length) {
        return false;
    }
    return crypto.timingSafeEqual(Buffer.from(provided, "utf8"), Buffer.from(expected, "utf8"));
}

