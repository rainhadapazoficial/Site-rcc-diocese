import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setup() {
    console.log("Configurando storage...");

    // O bucket já foi criado via curl, agora vamos tentar aplicar políticas via RPC ou SQL se possível
    // No entanto, o SDK de storage não tem método direto para criar policies.
    // As policies de storage devem ser criadas via SQL na tabela storage.policies.
    
    console.log("\nAVISO: O bucket 'media' foi criado com sucesso!");
    console.log("Por favor, verifique no painel do Supabase se as políticas de RLS estão configuradas:");
    console.log("1. SELECT: Público (true)");
    console.log("2. INSERT/UPDATE/DELETE: Authenticated users");
}

setup();
