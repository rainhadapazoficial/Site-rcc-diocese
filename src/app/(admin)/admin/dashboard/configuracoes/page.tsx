import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Cpu, ShieldCheck, Copy, Eye, EyeOff, Globe, Zap } from "lucide-react";
import { ConfigClient } from "./ConfigClient";

export default function ConfigPage() {
    const mcpToken = process.env.MCP_AUTH_TOKEN || "Não configurado";
    const mcpUrl = "https://site-rcc-diocese.vercel.app/api/mcp";

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-blue rounded-2xl text-white">
                    <Settings className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-brand-blue italic">Configurações do Sistema</h1>
                    <p className="text-gray-500">Gerencie chaves de API e conexões de inteligência artificial.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* MCP Configuration Card */}
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-brand-blue p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Cpu className="w-24 h-24" />
                        </div>
                        <CardTitle className="text-2xl font-bold italic flex items-center gap-2">
                            <Zap className="w-6 h-6 text-brand-gold" />
                            Conexão MCP
                        </CardTitle>
                        <CardDescription className="text-blue-100 opacity-80">
                            Dados para conectar o VOZ DE PENTECOSTES ao site.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <ConfigClient mcpUrl={mcpUrl} mcpToken={mcpToken} />
                    </CardContent>
                </Card>

                {/* Integration Status Card */}
                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        <h3 className="text-xl font-bold text-brand-blue italic">Status das Integrações</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-bold text-gray-700">Supabase Database</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase">Conectado</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-bold text-gray-700">n8n Automation</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase">Ativo</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-brand-gold" />
                                <span className="text-sm font-bold text-gray-700">Painel Premium</span>
                            </div>
                            <span className="text-[10px] font-bold text-brand-gold bg-amber-100 px-3 py-1 rounded-full uppercase">Premium</span>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-xs text-brand-blue leading-relaxed font-medium">
                            <strong>Dica Importante:</strong> Nunca compartilhe o Token do MCP com pessoas desconhecidas. Ele dá acesso total para a IA gerenciar seu conteúdo.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
