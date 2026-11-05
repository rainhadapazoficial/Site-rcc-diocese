import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import {
    ALLOWED_STORAGE_BUCKETS,
    DEFAULT_STORAGE_BUCKET,
    detectImageMimeFromMagicBytes,
    parseSupabaseStorageUrl,
    validateImageUpload,
} from "@/lib/upload-validation";
import type { SupabaseClient } from "@supabase/supabase-js";

async function countImageReferences(
    supabase: SupabaseClient,
    imageUrl: string,
    excludeTable?: string,
    excludeId?: string | number
): Promise<number> {
    let totalRefs = 0;

    const directChecks: Array<{ table: string; column: string }> = [
        { table: "posts", column: "image_url" },
        { table: "events", column: "image_url" },
        { table: "groups", column: "imagem" },
        { table: "groups", column: "logo_url" },
        { table: "groups", column: "coordenador_foto_url" },
        { table: "group_coordinator_history", column: "foto_url" },
        { table: "ministerios", column: "imagem_url" },
        { table: "ministerio_coordinator_history", column: "imagem_url" },
        { table: "conselho_membros", column: "foto_url" },
        { table: "festa_rei_jesus_editions", column: "imagem_url" },
        { table: "custom_pages", column: "image_url" },
    ];

    for (const check of directChecks) {
        try {
            let query = supabase
                .from(check.table)
                .select("id", { count: "exact", head: true })
                .eq(check.column, imageUrl);

            if (excludeTable === check.table && excludeId !== undefined && excludeId !== null && excludeId !== "") {
                query = query.neq("id", excludeId);
            }

            const { count } = await query;
            if (typeof count === "number" && count > 0) {
                totalRefs += count;
            }
        } catch {
            // Ignore optional table errors
        }
    }

    // Check JSONB columns in site_settings and festa_rei_jesus_editions.atracoes
    try {
        const { data: settingsRows } = await supabase.from("site_settings").select("key, value");
        if (Array.isArray(settingsRows)) {
            for (const row of settingsRows) {
                if (excludeTable === "site_settings" && excludeId === row.key) continue;
                const serialized = JSON.stringify(row.value || {});
                if (serialized.includes(imageUrl)) {
                    totalRefs += 1;
                }
            }
        }
    } catch {
        // Ignore
    }

    try {
        const { data: editions } = await supabase.from("festa_rei_jesus_editions").select("id, atracoes");
        if (Array.isArray(editions)) {
            for (const ed of editions) {
                if (excludeTable === "festa_rei_jesus_editions" && String(excludeId) === String(ed.id)) continue;
                const serialized = JSON.stringify(ed.atracoes || []);
                if (serialized.includes(imageUrl)) {
                    totalRefs += 1;
                }
            }
        }
    } catch {
        // Ignore
    }

    return totalRefs;
}

export async function POST(request: Request) {
    const auth = await verifyAdminRequest(request);
    if (!auth.authorized) {
        return auth.response;
    }

    try {
        const formData = await request.formData();
        const fileEntry = formData.get("file");
        const folderEntry = String(formData.get("folder") || "galerias");
        const bucketEntry = String(formData.get("bucket") || DEFAULT_STORAGE_BUCKET);

        if (!fileEntry || typeof fileEntry === "string") {
            return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
        }

        const bucket = ALLOWED_STORAGE_BUCKETS.has(bucketEntry) ? bucketEntry : DEFAULT_STORAGE_BUCKET;

        // 1. Validate size, extension, MIME, and generate unique path
        const { filePath, normalizedFolder } = validateImageUpload(
            {
                name: fileEntry.name || "upload.jpg",
                size: fileEntry.size,
                type: fileEntry.type,
            },
            folderEntry
        );

        // 2. Inspect real binary magic bytes on the server
        const arrayBuffer = await fileEntry.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const realMime = detectImageMimeFromMagicBytes(bytes);

        if (!realMime) {
            return NextResponse.json(
                {
                    error: "O conteúdo binário do arquivo não corresponde a uma imagem JPG, PNG ou WebP válida.",
                },
                { status: 400 }
            );
        }

        // 3. Upload to Supabase Storage using the authenticated user's session
        const { error: uploadError } = await auth.supabase.storage
            .from(bucket)
            .upload(filePath, bytes, {
                contentType: realMime,
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            return NextResponse.json(
                { error: `Falha ao enviar para o Supabase Storage: ${uploadError.message}` },
                { status: 500 }
            );
        }

        const { data: publicUrlData } = auth.supabase.storage.from(bucket).getPublicUrl(filePath);

        return NextResponse.json({
            url: publicUrlData.publicUrl,
            path: filePath,
            bucket,
            folder: normalizedFolder,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erro ao processar upload de imagem.";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    const auth = await verifyAdminRequest(request);
    if (!auth.authorized) {
        return auth.response;
    }

    try {
        const body = await request.json();
        const url = typeof body?.url === "string" ? body.url.trim() : "";
        const excludeTable = typeof body?.excludeTable === "string" ? body.excludeTable : undefined;
        const excludeId = body?.excludeId;

        if (!url) {
            return NextResponse.json({ error: "URL da imagem não informada." }, { status: 400 });
        }

        const parsed = parseSupabaseStorageUrl(url);
        if (!parsed) {
            return NextResponse.json({
                deleted: false,
                reason: "external_url",
                message: "A URL informada é externa e não está armazenada no Supabase Storage.",
            });
        }

        // Protect against deleting images still referenced by other database records
        const references = await countImageReferences(auth.supabase, url, excludeTable, excludeId);
        if (references > 0) {
            return NextResponse.json({
                deleted: false,
                reason: "in_use",
                references,
                message: "A imagem continua vinculada a outro registro e foi preservada no Storage.",
            });
        }

        const { error: removeError } = await auth.supabase.storage
            .from(parsed.bucket)
            .remove([parsed.filePath]);

        if (removeError) {
            return NextResponse.json(
                { error: `Erro ao remover imagem do Storage: ${removeError.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json({
            deleted: true,
            bucket: parsed.bucket,
            path: parsed.filePath,
        });
    } catch {
        return NextResponse.json({ error: "Requisição inválida ao remover imagem." }, { status: 400 });
    }
}

