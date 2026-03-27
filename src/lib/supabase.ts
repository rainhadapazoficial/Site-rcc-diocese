import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Durante o build no Vercel, as variáveis podem não estar disponíveis.
// Evitamos chamar createClient com valores nulos para não quebrar o build.
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : new Proxy({}, {
        get: () => {
            throw new Error("Supabase client accessed before initialization. Check environment variables.");
        }
    }) as any;
