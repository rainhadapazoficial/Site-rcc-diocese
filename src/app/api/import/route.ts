import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { verifyBearerSecret } from "@/lib/admin-auth";
import { sanitizeHtml } from "@/lib/sanitize";

// Bypass RLS using the Service Role Key for server-side import execution
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
    const authHeader = request.headers.get("Authorization");
    const importSecret = process.env.ADMIN_IMPORT_TOKEN || process.env.MCP_AUTH_TOKEN;

    // Require an admin token to prevent unauthorized access and DoS
    if (!verifyBearerSecret(authHeader, importSecret)) {
        return NextResponse.json({ error: "Acesso Negado. Token de importação inválido." }, { status: 401 });
    }

    try {
        const postsDir = path.join(process.cwd(), "wp-json", "wp", "v2", "posts");

        if (!fs.existsSync(postsDir)) {
            return NextResponse.json({ error: "Posts directory not found" }, { status: 404 });
        }

        const files = fs.readdirSync(postsDir);
        const results = [];

        for (const file of files) {
            const filePath = path.join(postsDir, file);
            if (fs.lstatSync(filePath).isFile()) {
                const content = fs.readFileSync(filePath, "utf-8");
                const postData = JSON.parse(content);

                const mappedData = {
                    title: postData.title?.rendered || "Sem Título",
                    content: sanitizeHtml(postData.content?.rendered || ""),
                    excerpt: sanitizeHtml(postData.excerpt?.rendered || ""),
                    slug: postData.slug || `post-${postData.id}`,
                    date: postData.date || new Date().toISOString(),
                    image_url: "", // Pode ser refinado se houver mapeamento de mídia
                    author: "Diocese de Sinop",
                    category: "Notícias"
                };

                const { error } = await supabase
                    .from("posts")
                    .upsert(mappedData, { onConflict: "slug" });

                if (error) {
                    results.push({ file, status: "error", error: "Falha ao gravar registro" });
                } else {
                    results.push({ file, status: "success" });
                }
            }
        }

        return NextResponse.json({
            message: "Processamento concluído",
            total: files.length,
            details: results
        });

    } catch (error: unknown) {
        console.error("Erro em /api/import:", error);
        return NextResponse.json({ error: "Erro interno no processamento." }, { status: 500 });
    }
}
