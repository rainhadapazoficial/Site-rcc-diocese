import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { triggerN8NWebhook } from "@/lib/n8n";

export async function POST(request: Request) {
    const auth = await verifyAdminRequest(request);
    if (!auth.authorized) {
        return auth.response;
    }

    try {
        const body = await request.json();
        const result = await triggerN8NWebhook("new_post_share", {
            title: body?.title,
            excerpt: body?.excerpt,
            url: body?.url,
            image_url: body?.image_url,
            category: body?.category,
        });
        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error("Erro em /api/admin/share:", error);
        return NextResponse.json({ success: false, error: "Falha ao compartilhar notícia." }, { status: 500 });
    }
}

