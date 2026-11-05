import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ALLOWED_SETTING_KEYS = new Set(['n8n_webhook_url', 'n8n_api_key']);

function isSafeWebhookUrl(rawUrl: string): boolean {
    if (!rawUrl || rawUrl.trim() === '') return true;
    try {
        const parsed = new URL(rawUrl.trim());
        if (parsed.protocol !== 'https:') return false;
        const host = parsed.hostname.toLowerCase();
        if (
            host === 'localhost' ||
            host === '0.0.0.0' ||
            host === '::1' ||
            host === '[::1]' ||
            host.endsWith('.local') ||
            host.endsWith('.internal') ||
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

export async function GET(req: Request) {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
        return auth.response;
    }

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Configuração do servidor ausente.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase.from('system_settings').select('settings_key, settings_value');

    if (error) {
        console.error('Erro ao ler system_settings:', error);
        return NextResponse.json({ error: 'Falha ao carregar configurações.' }, { status: 500 });
    }

    const settings = (data || []).reduce((acc: Record<string, string>, curr: Record<string, unknown>) => {
        if (curr.settings_key) {
            acc[String(curr.settings_key)] = String(curr.settings_value ?? '');
        }
        return acc;
    }, {});

    return NextResponse.json({
        ...settings,
        mcp_token: process.env.MCP_AUTH_TOKEN || '',
    });
}

export async function POST(req: Request) {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
        return auth.response;
    }

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Configuração do servidor ausente.' }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    const key = typeof body?.key === 'string' ? body.key.trim() : '';
    const value = typeof body?.value === 'string' ? body.value.trim() : '';

    if (!key || !ALLOWED_SETTING_KEYS.has(key)) {
        return NextResponse.json({ error: 'Chave de configuração inválida ou não permitida.' }, { status: 400 });
    }

    if (key === 'n8n_webhook_url' && !isSafeWebhookUrl(value)) {
        return NextResponse.json({ error: 'A URL do webhook deve utilizar HTTPS e um domínio público válido.' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { error } = await supabase
        .from('system_settings')
        .upsert({
            settings_key: key,
            settings_value: value,
            updated_at: new Date().toISOString()
        }, { onConflict: 'settings_key' });

    if (error) {
        console.error('Erro ao salvar system_settings:', error);
        return NextResponse.json({ error: 'Falha ao salvar configuração.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
