"use server";

export async function executeSQL(_query: string): Promise<{ data?: unknown; error?: string }> {
    return {
        error: "A execução direta de SQL pela aplicação web foi desativada por motivos de segurança (CRIT-01). Utilize o SQL Editor oficial no painel do Supabase com autenticação multifator."
    };
}

