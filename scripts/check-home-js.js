require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Erro: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY devem estar definidas no .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
    console.log("--- Checking Home Page Data (Standalone JS) ---");

    try {
        const posts = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);
        console.log(`Posts: ${posts.data?.length || 0} found. Error: ${posts.error?.message || 'None'}`);

        const groups = await supabase
            .from('groups')
            .select('id, nome, cidade, dia, local, slug')
            .order('created_at', { ascending: false })
            .limit(3);
        console.log(`Groups: ${groups.data?.length || 0} found. Error: ${groups.error?.message || 'None'}`);

        const ministries = await supabase
            .from('ministerios')
            .select('id, nome, descricao, coordenador, cor')
            .order('ordem', { ascending: true })
            .limit(3);
        console.log(`Ministries: ${ministries.data?.length || 0} found. Error: ${ministries.error?.message || 'None'}`);

        if (ministries.data) {
            console.log("Ministries sample names:", ministries.data.map(m => m.nome).join(", "));
        }
        if (groups.data) {
            console.log("Groups sample names:", groups.data.map(g => g.nome).join(", "));
        }
    } catch (e) {
        console.error("FATAL ERROR:", e);
    }
}

checkData();
