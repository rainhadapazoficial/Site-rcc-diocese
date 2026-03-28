import { supabase } from "@/lib/supabase";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Database, Mail, Zap, RefreshCw } from "lucide-react";

async function checkSupabase() {
    try {
        const { error } = await supabase.from('events').select('id').limit(1);
        if (error) throw error;
        return { status: "Online", icon: <CheckCircle2 className="text-green-500" />, color: "text-green-500" };
    } catch (e) {
        return { status: "Erro de Conexão", icon: <XCircle className="text-red-500" />, color: "text-red-500" };
    }
}

async function checkTables() {
    const tables = ['events', 'posts', 'prayer_requests'];
    const results = [];
    for (const table of tables) {
        const { error } = await supabase.from(table).select('id').limit(1);
        results.push({
            name: table,
            exists: !error || error.code !== 'PGRST205',
            error: error?.message
        });
    }
    return results;
}

async function getSyncLogs() {
    try {
        const { data, error } = await supabase
            .from('sync_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;
        return data || [];
    } catch (e) {
        return [];
    }
}

export default async function StatusPage() {
    const supabaseStatus = await checkSupabase();
    const tableStatus = await checkTables();

    const smtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD);
    const n8nConfigured = !!(process.env.N8N_API_KEY && process.env.N8N_BASE_URL);
    const syncLogs = await getSyncLogs();

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between border-b pb-4">
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-indigo-600" />
                        Painel de Integridade do Sistema
                    </h1>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        Modo Administrador
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Supabase Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="text-slate-400" />
                            <h2 className="font-semibold text-slate-700">Supabase DB</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {supabaseStatus.icon}
                            <span className={`text-xl font-bold ${supabaseStatus.color}`}>{supabaseStatus.status}</span>
                        </div>
                    </div>

                    {/* SMTP Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="text-slate-400" />
                            <h2 className="font-semibold text-slate-700">Serviço SMTP</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {smtpConfigured ? (
                                <><CheckCircle2 className="text-green-500" /><span className="text-xl font-bold text-green-500">Configurado</span></>
                            ) : (
                                <><AlertTriangle className="text-amber-500" /><span className="text-xl font-bold text-amber-500">Pendente</span></>
                            )}
                        </div>
                    </div>

                    {/* n8n Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="text-slate-400" />
                            <h2 className="font-semibold text-slate-700">Automação n8n</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {n8nConfigured ? (
                                <><CheckCircle2 className="text-green-500" /><span className="text-xl font-bold text-green-500">Ativa</span></>
                            ) : (
                                <><AlertTriangle className="text-amber-500" /><span className="text-xl font-bold text-amber-500">Pendente</span></>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table Details */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b bg-slate-50">
                        <h3 className="font-bold text-slate-800">Status das Tabelas</h3>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs uppercase text-slate-500 bg-slate-50 border-b">
                                <th className="px-6 py-3 font-medium">Tabela</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Observação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {tableStatus.map((table: any) => (
                                <tr key={table.name} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm">{table.name}</td>
                                    <td className="px-6 py-4">
                                        {table.exists ? (
                                            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                                                <CheckCircle2 className="w-4 h-4" /> Presente
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
                                                <XCircle className="w-4 h-4" /> Ausente
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {table.exists ? "Operacional" : table.error || "Tabela não encontrada no banco"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Sync Logs Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 italic">Logs de Sincronização (RCC Brasil)</h3>
                        <RefreshCw className="w-4 h-4 text-slate-400" />
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs uppercase text-slate-500 bg-slate-50 border-b">
                                <th className="px-6 py-3 font-medium">Data/Hora</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Nº Notícias</th>
                                <th className="px-6 py-3 font-medium">Mensagem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {syncLogs.length > 0 ? (
                                syncLogs.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(log.created_at).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.status === 'success' ? (
                                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-wider">
                                                    Sucesso
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold uppercase tracking-wider">
                                                    Falha
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                            {log.entries_synced}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            {log.message}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                                        Nenhum log encontrado. O agendador ainda não foi executado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3 items-start">
                    <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-amber-800 font-bold text-sm">Atenção Especial</h4>
                        <p className="text-amber-700 text-sm mt-1">
                            Lembre-se de configurar os <b>Secrets</b> no GitHub (<code>SUPABASE_URL</code> e <code>SUPABASE_SERVICE_ROLE_KEY</code>) para que o agendador automático funcione corretamente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
