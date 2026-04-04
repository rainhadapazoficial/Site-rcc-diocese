import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Faltam credenciais do Supabase (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixPostDates() {
    console.log('🔄 Iniciando correção das datas dos posts...');

    try {
        // Fetch posts that have DD/MM/YYYY format (contains /)
        const { data: posts, error: fetchError } = await supabase
            .from('posts')
            .select('id, title, date')
            .filter('date', 'ilike', '%/%');

        if (fetchError) {
            throw fetchError;
        }

        if (!posts || posts.length === 0) {
            console.log('✅ Nenhuma data em formato BR encontrada para corrigir.');
            return;
        }

        console.log(`📡 Encontrados ${posts.length} posts para corrigir.`);

        for (const post of posts) {
            const parts = post.date.split('/');
            if (parts.length === 3) {
                // Typical DD/MM/YYYY
                const day = parts[0].padStart(2, '0');
                const month = parts[1].padStart(2, '0');
                const year = parts[2];
                const newDate = `${year}-${month}-${day}`;

                console.log(`🛠 Corrigindo: "${post.title}" (${post.date} -> ${newDate})`);

                const { error: updateError } = await supabase
                    .from('posts')
                    .update({ date: newDate })
                    .eq('id', post.id);

                if (updateError) {
                    console.error(`❌ Erro ao atualizar post ${post.id}:`, updateError.message);
                }
            } else {
                console.warn(`⚠️ Formato de data inesperado para post ${post.id}: ${post.date}`);
            }
        }

        console.log('✨ Correção finalizada com sucesso!');

    } catch (error: any) {
        console.error('💥 Erro crítico na correção:', error.message);
    }
}

fixPostDates();
