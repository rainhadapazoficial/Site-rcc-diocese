import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { sanitizeHtml } from '../src/lib/sanitize';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Faltam credenciais do Supabase (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const FEED_URL = 'https://rccbrasil.org.br/feed/';

const parser = new Parser({
    customFields: {
        item: [
            ['content:encoded', 'contentEncoded'],
            ['media:content', 'mediaContent'],
        ],
    },
});

async function syncRCCNews() {
    console.log('🔄 Iniciando sincronização com RCC Brasil...');
    let entriesSynced = 0;

    try {
        const feed = await parser.parseURL(FEED_URL);
        console.log(`📡 Encontradas ${feed.items.length} notícias no feed.`);

        const allSlugs = feed.items.map(item => {
            const link = item.link || '';
            return link.replace(/\/$/, '').split('/').pop() || '';
        }).filter(Boolean);

        // Fetch all existing slugs at once
        const { data: existingPosts, error: fetchError } = await supabase
            .from('posts')
            .select('slug')
            .in('slug', allSlugs);

        if (fetchError) throw fetchError;

        const existingSlugSet = new Set(existingPosts?.map(p => p.slug) || []);
        const postsToInsert = [];

        for (const item of feed.items) {
            const title = item.title || '';
            const link = item.link || '';
            const content = item.contentEncoded || item.content || '';
            const description = item.contentSnippet || '';
            const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

            const slug = link.replace(/\/$/, '').split('/').pop() || '';
            if (!slug || existingSlugSet.has(slug)) continue;

            let image_url = 'https://rccbrasil.org.br/wp-content/uploads/2021/04/logo-rcc-brasil.png';

            if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
                image_url = item.mediaContent.$.url;
            } else {
                // Improved regex to handle query parameters and different formats
                const imgMatch = content.match(/<img[^>]*src=["'](https?:\/\/[^"'>]+(?:\.(?:jpg|jpeg|png|webp|gif))?(?:\?[^"'>]*)?)["']/i);
                if (imgMatch) {
                    image_url = imgMatch[1];
                }
            }

            postsToInsert.push({
                title: stripHTML(title).trim(),
                content: sanitizeHtml(content),
                excerpt: stripHTML(description).slice(0, 200) + '...',
                slug,
                category: 'RCC Brasil',
                author: 'Portal RCC Brasil',
                date: pubDate.toISOString().split('T')[0],
                image_url,
                created_at: pubDate.toISOString()
            });
        }

        if (postsToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from('posts')
                .insert(postsToInsert);

            if (insertError) {
                console.error(`❌ Erro no bulk insert:`, insertError.message);
            } else {
                console.log(`✅ ${postsToInsert.length} novas notícias importadas com sucesso!`);
                entriesSynced = postsToInsert.length;
            }
        } else {
            console.log(`✅ Nenhuma nova notícia para importar.`);
        }

        await supabase.from('sync_logs').insert([{
            status: 'success',
            entries_synced: entriesSynced,
            message: `Sincronização concluída. ${entriesSynced} novas notícias importadas.`
        }]);

        console.log(`✨ Sincronização finalizada! ${entriesSynced} novos posts adicionados.`);

    } catch (error: any) {
        console.error('💥 Erro crítico na sincronização:', error.message);

        await supabase.from('sync_logs').insert([{
            status: 'error',
            message: `Erro na sincronização: ${error.message}`
        }]);
    }
}

function stripHTML(str: string) {
    return str.replace(/<[^>]*>?/gm, '');
}

syncRCCNews();
