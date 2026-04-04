"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function executeSQL(query: string) {
    if (!query || query.trim() === "") {
        return { error: "Query vazia." };
    }

    try {
        // Chamamos a função RPC que criamos via SQL no Supabase
        const { data, error } = await supabase.rpc("exec_raw_sql", { 
            sql_query: query 
        });

        if (error) {
            console.error("Erro ao executar SQL via RPC:", error);
            return { error: error.message };
        }

        return { data };
    } catch (err: any) {
        console.error("Erro crítico ao executar SQL:", err);
        return { error: err.message || "Erro desconhecido ao executar SQL." };
    }
}
