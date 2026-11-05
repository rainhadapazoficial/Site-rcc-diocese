import { supabase } from "@/lib/supabase";
import {
    parseSupabaseStorageUrl,
    StorageFolder,
    validateImageUpload,
} from "@/lib/upload-validation";

async function getAuthHeaders(): Promise<Record<string, string>> {
    try {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
            return {
                Authorization: `Bearer ${session.access_token}`,
            };
        }
    } catch {
        // Fallback to cookie auth
    }
    return {};
}

export async function uploadAdminImage(
    file: File,
    folder: StorageFolder
): Promise<string> {
    // 1. Fast client-side check before sending over network
    validateImageUpload(file, folder);

    const authHeaders = await getAuthHeaders();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: authHeaders,
        body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Falha ao enviar imagem para o servidor.");
    }

    return data.url as string;
}

export async function deleteAdminStorageImage(
    url: string,
    options?: { excludeTable?: string; excludeId?: string | number }
): Promise<{ deleted: boolean; reason?: string }> {
    if (!url || !parseSupabaseStorageUrl(url)) {
        return { deleted: false, reason: "external_url" };
    }

    try {
        const authHeaders = await getAuthHeaders();
        const res = await fetch("/api/admin/upload", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders,
            },
            body: JSON.stringify({
                url,
                excludeTable: options?.excludeTable,
                excludeId: options?.excludeId,
            }),
        });

        const data = await res.json().catch(() => ({}));
        return {
            deleted: Boolean(data?.deleted),
            reason: data?.reason,
        };
    } catch {
        return { deleted: false, reason: "network_error" };
    }
}

