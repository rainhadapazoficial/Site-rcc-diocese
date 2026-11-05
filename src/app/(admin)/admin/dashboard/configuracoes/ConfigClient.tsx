"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Eye, EyeOff, CheckCircle2, Save, Loader2, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ConfigClientProps {
    mcpUrl: string;
    mcpToken?: string;
}

export function ConfigClient({ mcpUrl, mcpToken: initialMcpToken }: ConfigClientProps) {
    const [mcpToken, setMcpToken] = useState(initialMcpToken || "Não configurado");
    const [showToken, setShowToken] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedToken, setCopiedToken] = useState(false);
    const [n8nUrl, setN8nUrl] = useState("");
    const [n8nKey, setN8nKey] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const headers: Record<string, string> = {};
                if (session?.access_token) {
                    headers["Authorization"] = `Bearer ${session.access_token}`;
                }
                const res = await fetch('/api/admin/settings', { headers });
                if (!res.ok) return;
                const data = await res.json();
                if (data.n8n_webhook_url) setN8nUrl(data.n8n_webhook_url);
                if (data.n8n_api_key) setN8nKey(data.n8n_api_key);
                if (data.mcp_token) setMcpToken(data.mcp_token);
            } catch (e) {
                console.error("Erro ao carregar configurações:", e);
            }
        }
        fetchSettings();
    }, []);

    async function saveSetting(key: string, value: string) {
        setIsSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (session?.access_token) {
                headers["Authorization"] = `Bearer ${session.access_token}`;
            }
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers,
                body: JSON.stringify({ key, value })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert(err.error || "Erro ao salvar configuração.");
            } else {
                alert("Configuração salva com sucesso!");
            }
        } catch (e) {
            console.error("Erro ao salvar:", e);
            alert("Erro ao salvar configuração.");
        }
        setIsSaving(false);
    }

    const copyToClipboard = (text: string, setStatus: (val: boolean) => void) => {
        navigator.clipboard.writeText(text);
        setStatus(true);
        setTimeout(() => setStatus(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL do Servidor MCP</label>
                <div className="flex gap-2">
                    <div className="flex-1 bg-gray-50 p-4 rounded-xl border text-sm font-mono text-gray-600 truncate">
                        {mcpUrl}
                    </div>
                    <Button
                        variant="outline"
                        className="rounded-xl h-full px-4 border-brand-blue/20 hover:bg-brand-blue hover:text-white transition-all"
                        onClick={() => copyToClipboard(mcpUrl, setCopiedUrl)}
                    >
                        {copiedUrl ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Token de Autenticação (Bearer)</label>
                <div className="flex gap-2">
                    <div className="flex-1 bg-gray-50 p-4 rounded-xl border text-sm font-mono text-brand-blue flex items-center justify-between">
                        <span className="truncate max-w-[200px] md:max-w-md">
                            {showToken ? mcpToken : "••••••••••••••••••••••••••••••••"}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowToken(!showToken)}
                            className="h-6 w-6 p-0 hover:bg-transparent"
                        >
                            {showToken ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                        </Button>
                    </div>
                    <Button
                        variant="outline"
                        className="rounded-xl h-full px-4 border-brand-blue/20 hover:bg-brand-blue hover:text-white transition-all"
                        onClick={() => copyToClipboard(mcpToken, setCopiedToken)}
                    >
                        {copiedToken ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            <div className="p-6 bg-brand-gold/5 rounded-3xl border border-brand-gold/20">
                <h4 className="font-bold text-brand-blue mb-2 italic">Como usar no Antigravity:</h4>
                <ol className="text-xs text-gray-600 space-y-2 list-decimal ml-4">
                    <li>Copie a <strong>URL</strong> e o <strong>Token</strong> acima.</li>
                    <li>No menu da IA (MCP), adicione um novo servidor customizado.</li>
                    <li>Use o comando de transporte <strong>HTTP</strong> ou <strong>Curl</strong>.</li>
                    <li>Pronto! A IA passará a enxergar seus dados automaticamente.</li>
                </ol>
            </div>

            <div className="border-t pt-8 space-y-6">
                <div className="flex items-center gap-2 mb-2 text-brand-blue font-bold italic">
                    <Zap className="w-5 h-5 text-brand-gold" />
                    Configuração n8n (Ativa)
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL do Webhook n8n</label>
                        <div className="flex gap-2">
                            <Input
                                value={n8nUrl}
                                onChange={(e) => setN8nUrl(e.target.value)}
                                placeholder="https://seu-n8n.com/webhook/..."
                                className="rounded-xl h-12 bg-white"
                            />
                            <Button
                                onClick={() => saveSetting('n8n_webhook_url', n8nUrl)}
                                disabled={isSaving}
                                className="bg-brand-blue text-white rounded-xl h-12 px-6"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2 text-brand-gold" />}
                                Salvar
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">API Key do n8n (Opcional)</label>
                        <div className="flex gap-2">
                            <Input
                                type="password"
                                value={n8nKey}
                                onChange={(e) => setN8nKey(e.target.value)}
                                placeholder="Sua chave de API"
                                className="rounded-xl h-12 bg-white"
                            />
                            <Button
                                onClick={() => saveSetting('n8n_api_key', n8nKey)}
                                disabled={isSaving}
                                className="bg-brand-blue text-white rounded-xl h-12 px-6"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2 text-brand-gold" />}
                                Salvar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
