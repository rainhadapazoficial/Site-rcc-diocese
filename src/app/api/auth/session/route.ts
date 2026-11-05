import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const accessToken = typeof body?.access_token === "string" ? body.access_token.trim() : "";

        if (!accessToken) {
            return NextResponse.json({ error: "Token de acesso ausente." }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json({ error: "Configuração do servidor incompleta." }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data, error } = await supabase.auth.getUser(accessToken);
        if (error || !data?.user) {
            return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
        }

        const response = NextResponse.json({ ok: true });
        response.cookies.set(ADMIN_TOKEN_COOKIE, accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 dias
        });

        return response;
    } catch {
        return NextResponse.json({ error: "Falha ao sincronizar sessão." }, { status: 500 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_TOKEN_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
    return response;
}

