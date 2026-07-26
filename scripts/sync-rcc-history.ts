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

function stripHTML(str: string) {
    return str.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
}

function decodeHTMLEntities(str: string) {
    return str
        .replace(/&#8211;/g, '–')
        .replace(/&#8212;/g, '—')
        .replace(/&#8216;/g, '‘')
        .replace(/&#8217;/g, '’')
        .replace(/&#8220;/g, '“')
        .replace(/&#8221;/g, '”')
        .replace(/&#038;/g, '&')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
}

async function syncHistoricalRCCNews() {
    console.log('🔄 Iniciando busca do histórico de notícias na API REST do RCC Brasil...');
    
    // Check command line arguments for max pages (default: 3 pages = 150 posts)
    const args = process.argv.slice(2);
    let maxPages = 3;
    if (args.includes('--all')) {
        maxPages = 28; // All 1378 posts
    } else {
        const pageArg = args.find(a => a.startsWith('--pages='));
        if (pageArg) {
            maxPages = parseInt(pageArg.split('=')[1], 10) || 3;
        }
    }

    let entriesSynced = 0;
    let totalChecked = 0;

    for (let page = 1; page <= maxPages; page++) {
        console.log(`📄 Buscando página ${page} de ${maxPages} da API RCC Brasil...`);
        try {
            const res = await fetch(`https://rccbrasil.org.br/wp-json/wp/v2/posts?page=${page}&per_page=50`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; RCC-Diocese-Sync/1.0)'
                }
            });

            if (!res.ok) {
                console.error(`⚠️ Erro ao buscar página ${page}: HTTP ${res.status}`);
                break;
            }

            const posts: any[] = await res.json();
            if (!posts || posts.length === 0) {
                console.log(`ℹ️ Nenhum post encontrado na página ${page}. Fim do histórico.`);
                break;
            }

            for (const item of posts) {
                totalChecked++;
                const title = decodeHTMLEntities(stripHTML(item.title?.rendered || ''));
                const slug = item.slug || '';
                const content = item.content?.rendered || '';
                const excerptRaw = item.excerpt?.rendered || content;
                const pubDate = item.date ? new Date(item.date) : new Date();

                if (!slug) continue;

                // Try to find image in content
                let image_url = 'https://rccbrasil.org.br/wp-content/uploads/2021/04/logo-rcc-brasil.png';
                const imgMatch = content.match(/<img[^>]*src=["'](https?:\/\/[^"'>]+\.(?:jpg|jpeg|png|webp))["']/i);
                if (imgMatch) {
                    image_url = imgMatch[1];
                }

                const postData = {
                    title,
                    content,
                    excerpt: decodeHTMLEntities(stripHTML(excerptRaw)).slice(0, 200) + '...',
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
                        .insert([postData]);

                    if (insertError) {
                        console.error(`❌ Erro ao inserir "${title}":`, insertError.message);
                    } else {
                        console.log(`✅ [Importado] (${pubDate.toISOString().split('T')[0]}) ${title}`);
                        entriesSynced++;
                    }
                }
            }
        } catch (err: any) {
            console.error(`❌ Erro de conexão na página ${page}:`, err.message);
            break;
        }
    }

    // Log to Supabase sync_logs
    await supabase.from('sync_logs').insert([{
        status: 'success',
        entries_synced: entriesSynced,
        message: `Sincronização histórica: ${entriesSynced} novas notícias importadas (de ${totalChecked} checadas).`
    }]);

    console.log(`\n✨ Histórico finalizado! Checamos ${totalChecked} notícias antigas e importamos ${entriesSynced} novas.`);
}

syncHistoricalRCCNews();
