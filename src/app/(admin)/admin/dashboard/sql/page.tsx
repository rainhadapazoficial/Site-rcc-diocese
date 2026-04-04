"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Database, Terminal, AlertCircle, CheckCircle2, ChevronRight, Copy, Trash2 } from "lucide-react";
import { executeSQL } from "./actions";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

export default function SQLEditorPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    const handleRunQuery = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setResults(null);

        const response = await executeSQL(query);
        setResults(response);
        setLoading(false);

        if (!response.error) {
            setHistory(prev => [query, ...prev.slice(0, 9)]);
        }
    };

    const clearHistory = () => setHistory([]);

    const renderResults = () => {
        if (!results) return null;

        if (results.error) {
            return (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-700"
                >
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-bold mb-1">Erro no Postgres</p>
                        <code className="text-sm bg-white/50 p-1 rounded font-mono">{results.error}</code>
                    </div>
                </motion.div>
            );
        }

        const data = results.data;

        // Se o retorno for um objeto de sucesso (INSERT/UPDATE/DELETE)
        if (data && !Array.isArray(data) && data.success) {
            return (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-emerald-700"
                >
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <p className="font-bold">Comando executado com sucesso!</p>
                        <p className="text-sm opacity-80">Linhas afetadas: {data.rows_affected}</p>
                    </div>
                </motion.div>
            );
        }

        // Se o retorno for vazio (nenhuma linha encontrada)
        if (!data || (Array.isArray(data) && data.length === 0)) {
            return (
                <div className="p-8 text-center text-gray-400 border-2 border-dashed rounded-xl">
                    <Database className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p>Nenhum dado encontrado para esta consulta.</p>
                </div>
            );
        }

        // Se o retorno for uma lista de dados (SELECT)
        if (Array.isArray(data)) {
            const columns = Object.keys(data[0]);
            return (
                <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
                    <ScrollArea className="h-[400px]">
                        <Table>
                            <TableHeader className="bg-gray-50 sticky top-0 z-10">
                                <TableRow>
                                    {columns.map(col => (
                                        <TableHead key={col} className="font-bold uppercase text-[10px] tracking-wider text-gray-500">
                                            {col}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row, idx) => (
                                    <TableRow key={idx} className="hover:bg-blue-50/50 transition-colors">
                                        {columns.map(col => (
                                            <TableCell key={col} className="font-mono text-xs max-w-[200px] truncate" title={JSON.stringify(row[col])}>
                                                {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
            );
        }

        return <pre className="p-4 bg-gray-50 rounded font-mono text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>;
    };

    return (
        <div className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-brand-blue flex items-center gap-2">
                        <Terminal className="w-8 h-8 text-brand-gold" />
                        Editor SQL
                    </h1>
                    <p className="text-gray-500 mt-1">Execute comandos diretos no banco de dados Supabase.</p>
                </div>
                <Badge variant="outline" className="h-8 border-brand-gold/30 text-brand-gold bg-brand-gold/5 flex gap-1 items-center px-3">
                    <Database className="w-3.5 h-3.5" />
                    Service Role Active
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <Card className="border-brand-blue/5 shadow-xl shadow-blue-900/5 bg-white/50 backdrop-blur-sm">
                        <CardHeader className="pb-3 border-b border-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                    <Play className="w-4 h-4 text-emerald-500" />
                                    Escreva seu SQL abaixo
                                </div>
                                <div className="text-[10px] uppercase tracking-widest text-gray-400">Suporte a SELECT, INSERT, UPDATE, DELETE</div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Textarea 
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="SELECT * FROM groups LIMIT 10;"
                                className="min-h-[250px] font-mono text-sm border-0 focus-visible:ring-0 resize-none p-6 leading-relaxed"
                            />
                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-9 px-3 text-xs" 
                                        onClick={() => setQuery("")}
                                    >
                                        Limpar
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-9 px-3 text-xs" 
                                        onClick={() => {
                                            const btn = document.activeElement as HTMLElement;
                                            navigator.clipboard.writeText(query);
                                            btn.textContent = "Copiado!";
                                            setTimeout(() => btn.textContent = "Copiar", 2000);
                                        }}
                                    >
                                        Copiar
                                    </Button>
                                </div>
                                <Button 
                                    onClick={handleRunQuery}
                                    disabled={loading || !query.trim()}
                                    className="bg-brand-blue hover:bg-blue-800 text-white h-10 px-6 gap-2 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Play className="w-4 h-4 fill-current" />
                                    )}
                                    {loading ? "Executando..." : "Explodir Query"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-brand-blue/5 shadow-xl shadow-blue-900/5 bg-white">
                        <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-600">
                                <Database className="w-4 h-4" />
                                Resultados
                                {results && !results.error && Array.isArray(results.data) && (
                                    <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100">
                                        {results.data.length} registros
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {renderResults()}
                            {!results && (
                                <div className="p-12 text-center text-gray-400 space-y-2">
                                    <Terminal className="w-12 h-12 mx-auto opacity-10 mb-4" />
                                    <p className="text-lg font-medium opacity-50">Pronto para execução</p>
                                    <p className="max-w-xs mx-auto text-sm opacity-40">Digite sua query acima e clique em "Explodir" para ver os dados.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-brand-blue/5 shadow-lg bg-white/70 backdrop-blur-sm sticky top-6">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center justify-between">
                                Histórico Recente
                                <Button variant="ghost" size="icon" className="w-6 h-6 hover:text-red-500" onClick={clearHistory}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {history.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic text-center py-4">Nenhuma query executada ainda.</p>
                                ) : (
                                    history.map((h, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => setQuery(h)}
                                            className="w-full text-left p-3 rounded-lg bg-white border border-gray-100 hover:border-brand-gold/50 hover:bg-brand-gold/5 transition-all group relative"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-brand-gold" />
                                                <span className="text-[10px] font-bold text-gray-300 group-hover:text-brand-gold/50">SQL #{history.length - i}</span>
                                            </div>
                                            <p className="text-xs font-mono truncate text-gray-600 group-hover:text-brand-blue">
                                                {h}
                                            </p>
                                        </button>
                                    ))
                                )}
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dicas Rápidas</h4>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 h-5 text-[9px]">Tabelas</Badge>
                                        <p className="text-[11px] text-gray-500">`groups`, `posts`, `users`, `conselho_membros`</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge className="bg-amber-50 text-amber-600 border-amber-100 h-5 text-[9px]">Dica</Badge>
                                        <p className="text-[11px] text-gray-500">Use `LIMIT` em SELECTs grandes para carregar mais rápido.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
