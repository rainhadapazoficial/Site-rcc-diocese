import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyBearerSecret } from "@/lib/admin-auth";
import { sanitizeHtml } from "@/lib/sanitize";

// Bypass RLS using the Service Role Key for server-side webhook execution
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
    const authHeader = request.headers.get("Authorization");

    if (!verifyBearerSecret(authHeader, process.env.N8N_API_KEY)) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, date, time, location, description, category, image_url } = body;

        if (!title || !date) {
            return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
        }

        const { error } = await supabase
            .from("events")
            .insert([{
                title: String(title).trim(),
                date: String(date).trim(),
                time: time ? String(time).trim() : null,
                location: location ? String(location).trim() : null,
                description: description ? sanitizeHtml(String(description)) : null,
                category: category ? String(category).trim() : null,
                image_url: image_url ? String(image_url).trim() : null,
                created_at: new Date().toISOString()
            }]);

        if (error) {
            console.error("Erro ao sincronizar evento:", error);
            return NextResponse.json({ error: "Falha ao sincronizar evento." }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Evento sincronizado com sucesso!" });
    } catch (error: unknown) {
        console.error("Erro em /api/n8n/sync-events:", error);
        return NextResponse.json({ error: "Erro interno ao processar requisição." }, { status: 500 });
    }
}
