import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase.from('system_settings').select('*');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Transform array to object for easier use
    const settings = data.reduce((acc: any, curr: any) => {
        acc[curr.settings_key] = curr.settings_value;
        return acc;
    }, {});

    return NextResponse.json(settings);
}

export async function POST(req: Request) {
    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { key, value } = await req.json();

    if (!key) return NextResponse.json({ error: 'Chave não informada' }, { status: 400 });

    const { error } = await supabase
        .from('system_settings')
        .upsert({
            settings_key: key,
            settings_value: value,
            updated_at: new Date().toISOString()
        }, { onConflict: 'settings_key' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}
