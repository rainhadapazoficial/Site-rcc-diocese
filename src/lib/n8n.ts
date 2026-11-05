import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

/**
 * Utilitário para integração com n8n
 * Centraliza todas as chamadas de saída para o n8n
 */

let CACHED_SETTINGS: Record<string, string> | null = null;
let lastFetch = 0;

function isSafeWebhookUrl(rawUrl: string): boolean {
    try {
        const parsed = new URL(rawUrl.trim());
        if (parsed.protocol !== "https:") return false;
        const host = parsed.hostname.toLowerCase();
        if (
            host === "localhost" ||
            host === "0.0.0.0" ||
            host === "::1" ||
            host === "[::1]" ||
            host.endsWith(".local") ||
            host.endsWith(".internal") ||
            /^127\./.test(host) ||
            /^10\./.test(host) ||
            /^192\.168\./.test(host) ||
            /^169\.254\./.test(host) ||
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
        ) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

async function getSettings() {
    const now = Date.now();
    if (CACHED_SETTINGS && (now - lastFetch < 60000)) return CACHED_SETTINGS;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const dbClient = (typeof window === "undefined" && supabaseUrl && supabaseServiceKey)
        ? createClient(supabaseUrl, supabaseServiceKey)
        : supabase;

    const { data } = await dbClient.from('system_settings').select('settings_key, settings_value');
    if (data) {
        CACHED_SETTINGS = data.reduce((acc: Record<string, string>, curr: Record<string, unknown>) => {
            if (curr.settings_key) {
                acc[String(curr.settings_key)] = String(curr.settings_value ?? '');
            }
            return acc;
        }, {});
        lastFetch = now;
    }
    return CACHED_SETTINGS || {};
}

/**
 * Dispara um webhook genérico para o n8n (Execução Server-Side)
 */
export async function triggerN8NWebhook(event: string, data: Record<string, unknown>) {
    const settings = await getSettings();

    const webhookUrl = settings.n8n_webhook_url || process.env.N8N_WEBHOOK_URL || (process.env.N8N_BASE_URL ? `${process.env.N8N_BASE_URL}/webhook/rcc-events` : undefined);
    const apiKey = settings.n8n_api_key || process.env.N8N_API_KEY;

    if (!webhookUrl) {
        console.warn("N8N_WEBHOOK_URL não configurada no painel ou env. Webhook ignorado.");
        return { success: false, error: "URL não configurada" };
    }

    if (!isSafeWebhookUrl(webhookUrl)) {
        console.error("N8N_WEBHOOK_URL bloqueada por política anti-SSRF.");
        return { success: false, error: "URL de webhook inválida ou insegura" };
    }

    try {
        const payload = {
            event,
            timestamp: new Date().toISOString(),
            data
        };

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`Erro n8n (${event}):`, response.statusText);
            return { success: false, error: response.statusText };
        }

        console.log(`Webhook n8n disparado: ${event}`);
        return { success: true };
    } catch (error: unknown) {
        console.error(`Falha n8n (${event}):`, error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Atalho específico para compartilhamento social de notícias
 * Se chamado do navegador, delega para a rota autenticada /api/admin/share sem expor n8n_api_key
 */
export async function shareToSocialMedia(postData: Record<string, unknown>) {
    if (typeof window !== "undefined") {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (session?.access_token) {
            headers["Authorization"] = `Bearer ${session.access_token}`;
        }
        const res = await fetch("/api/admin/share", {
            method: "POST",
            headers,
            body: JSON.stringify(postData),
        });
        return res.json();
    }

    return triggerN8NWebhook('new_post_share', {
        title: postData.title,
        excerpt: postData.excerpt,
        url: postData.url,
        image_url: postData.image_url,
        category: postData.category,
    });
}
