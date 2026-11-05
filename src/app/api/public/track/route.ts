import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const VALID_SLUG_REGEX = /^\/?[a-zA-Z0-9\/_-]{0,120}$/;

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req);
        if (!checkRateLimit(`track:${ip}`, 60, 60 * 1000)) {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        const body = await req.json().catch(() => null);
        const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';

        if (!slug || !VALID_SLUG_REGEX.test(slug)) {
            return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
        }

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: 'Tracking unavailable' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Incrementar visualizações usando RPC atômica
        const { error } = await supabase.rpc('increment_page_view', { page_slug: slug });

        if (error) {
            console.warn('increment_page_view RPC warning:', error.message);
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
    }
}
