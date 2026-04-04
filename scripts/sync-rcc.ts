import Parser from 'rss-parser';
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

        for (const item of feed.items) {
            const title = item.title || '';
            const link = item.link || '';
            const content = item.contentEncoded || item.content || '';
            const description = item.contentSnippet || '';
            const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

            // Extract slug from link
            const slug = link.replace(/\/$/, '').split('/').pop() || '';

            // Try to find image
            let image_url = 'https://rccbrasil.org.br/wp-content/uploads/2021/04/logo-rcc-brasil.png';

            // 1. Check for mediaContent
            if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
                image_url = item.mediaContent.$.url;
            } else {
                // 2. Search in content for <img> tag
                const imgMatch = content.match(/<img[^>]*src=["'](https?:\/\/[^"'>]+\.(?:jpg|jpeg|png|webp))["']/i);
                if (imgMatch) {
                    image_url = imgMatch[1];
                }
            }

            const post = {
                title,
                content,
                excerpt: stripHTML(description).slice(0, 200) + '...',
                slug,
                category: 'RCC Brasil',
                author: 'Portal RCC Brasil',
                date: pubDate.toISOString().split('T')[0],
                image_url,
                created_at: pubDate.toISOString()
            };

            // Check if post already exists
            const { data: existingPost } = await supabase
                .from('posts')
                .select('id')
                .eq('slug', slug)
                .single();

            if (!existingPost) {
                const { error: insertError } = await supabase
                    .from('posts')
                    .insert([post]);

                if (insertError) {
                    console.error(`❌ Erro ao inserir post "${title}":`, insertError.message);
                } else {
                    console.log(`✅ Nova notícia importada: ${title}`);
                    entriesSynced++;
                }
            }
        }

        // Log success
        await supabase.from('sync_logs').insert([{
            status: 'success',
            entries_synced: entriesSynced,
            message: `Sincronização concluída. ${entriesSynced} novas notícias importadas.`
        }]);

        console.log(`✨ Sincronização finalizada! ${entriesSynced} novos posts adicionados.`);

    } catch (error: any) {
        console.error('💥 Erro crítico na sincronização:', error.message);

        // Log error
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
