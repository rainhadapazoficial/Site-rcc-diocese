import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
    try {
        const { slug } = await req.json();
        if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Supabase environment variables are missing');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Incrementar visualizações usando RPC para ser atômico ou upsert manual
        // Tentamos buscar primeiro para ver se existe
        const { data: existing } = await supabase
            .from('page_views')
            .select('views')
            .eq('slug', slug)
            .single();

        if (existing) {
            await supabase
                .from('page_views')
                .update({ views: existing.views + 1, updated_at: new Date().toISOString() })
                .eq('slug', slug);
        } else {
            await supabase
                .from('page_views')
                .insert({ slug, views: 1 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
