"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Users, ChevronDown, CheckCircle, History } from "lucide-react";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ConselhoPublicPage() {
    const [mandatos, setMandatos] = useState<any[]>([]);
    const [selectedMandatoId, setSelectedMandatoId] = useState<string | null>(null);
    const [membros, setMembros] = useState<any[]>([]);
    const [grupos, setGrupos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedMandatoId) {
            fetchMembros(selectedMandatoId);
            fetchGrupos(selectedMandatoId);
        }
    }, [selectedMandatoId]);

    async function fetchData() {
        setIsLoading(true);
        // Fetch mandatos
        const { data: mandatosData } = await supabase
            .from("conselho_mandatos")
            .select("*")
            .order("ano_inicio", { ascending: false });

        if (mandatosData && mandatosData.length > 0) {
            setMandatos(mandatosData);
            // Default to active, or first one
            const active = mandatosData.find((m: any) => m.ativo);
            if (active) setSelectedMandatoId(String(active.id));
            else setSelectedMandatoId(String(mandatosData[0].id));
        }
        setIsLoading(false);
    }

    async function fetchMembros(id: string) {
        const { data } = await supabase
            .from("conselho_membros")
            .select("*")
            .eq("mandato_id", id)
            .order("ordem", { ascending: true });

        setMembros(data || []);
    }

    async function fetchGrupos(mandatoId: string) {
        const { data } = await supabase
            .from("groups")
            .select("id, nome, coordenador, coordenador_foto_url")
            .eq("mandato_id", mandatoId)
            .order("nome", { ascending: true });

        setGrupos(data || []);
    }

    const currentMandato = mandatos.find(m => String(m.id) === selectedMandatoId);

    // Group members
    const presidencia = membros.filter(m => m.categoria === "presidencia");
    const fiscal = membros.filter(m => m.categoria === "fiscal");

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <section className="bg-brand-blue py-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('/pattern-grid.svg')]"></div>
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-brand-gold font-bold uppercase tracking-widest text-xs mb-6 border border-white/20">
                        <Users className="w-4 h-4" />
                        Quem Somos
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 italic">Conselho Diocesano</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Conheça os irmãos eleitos para servir a Renovação Carismática Católica na Diocese de Sinop neste tempo.
                    </p>
                </div>
            </section>

            {/* Mandate Selector */}
            <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
                <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-brand-gold/20 p-3 rounded-full">
                            <History className="w-6 h-6 text-brand-gold" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Histórico de Mandatos</h3>
                            <p className="text-sm text-gray-500">Selecione o período para visualizar</p>
                        </div>
                    </div>
                    <div className="w-full md:w-64">
                        <Select value={selectedMandatoId || ""} onValueChange={setSelectedMandatoId}>
                            <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Carregando..." />
                            </SelectTrigger>
                            <SelectContent>
                                {mandatos.map(m => (
                                    <SelectItem key={m.id} value={String(m.id)}>
                                        <span className="font-bold">{m.titulo}</span>
                                        {m.ativo && <span className="ml-2 text-xs text-brand-blue">(Atual)</span>}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Members Grid */}
            <div className="max-w-6xl mx-auto px-4 mt-16 space-y-16">
                {isLoading ? (
                    <div className="text-center py-20 text-gray-400">Carregando...</div>
                ) : !currentMandato ? (
                    <div className="text-center py-20 text-gray-400">Nenhum mandato encontrado.</div>
                ) : (
                    <>
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h2 className="text-3xl font-bold text-brand-blue text-center mb-10 flex items-center justify-center gap-3">
                                <span className="w-12 h-1 bg-brand-gold rounded-full"></span>
                                Presidência do Conselho
                                <span className="w-12 h-1 bg-brand-gold rounded-full"></span>
                            </h2>
                            {presidencia.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                                    {presidencia.map((m) => (
                                        <MemberCard key={m.id} member={m} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-400 italic">Nenhum membro cadastrado.</p>
                            )}
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                            <h2 className="text-3xl font-bold text-gray-700 text-center mb-10 flex items-center justify-center gap-3">
                                <span className="w-8 h-1 bg-gray-300 rounded-full"></span>
                                Conselho Fiscal
                                <span className="w-8 h-1 bg-gray-300 rounded-full"></span>
                            </h2>
                            {fiscal.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                                    {fiscal.map((m) => (
                                        <MemberCard key={m.id} member={m} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-400 italic">Nenhum conselheiro fiscal cadastrado.</p>
                            )}
                        </div>

                        {/* Coordenadores de Grupos */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                            <h2 className="text-3xl font-bold text-brand-blue text-center mb-10 flex items-center justify-center gap-3">
                                <span className="w-8 h-1 bg-brand-gold rounded-full"></span>
                                Coordenadores de Grupos de Oração
                                <span className="w-8 h-1 bg-brand-gold rounded-full"></span>
                            </h2>
                            {grupos.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                                    {grupos.map((g) => (
                                        <div key={g.id} className="group bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
                                            <div className="relative mb-6">
                                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                                                    <img
                                                        src={g.coordenador_foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(g.coordenador || "C")}&background=1e3a5f&color=fff`}
                                                        alt={g.coordenador}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                                                    Coordenador(a)
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-brand-blue transition-colors">
                                                {g.coordenador || "Não informado"}
                                            </h3>
                                            <p className="text-brand-gold font-bold uppercase text-xs tracking-widest">
                                                {g.nome}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-400 italic py-10">
                                    Nenhum coordenador de grupo vinculado a este mandato.
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function MemberCard({ member }: { member: any }) {
    return (
        <div className="group bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
            <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <img
                        src={member.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nome)}&background=1e3a5f&color=fff`}
                        alt={member.nome}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-brand-gold text-brand-blue text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                    RCC Sinop
                </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-blue transition-colors">
                {member.nome}
            </h3>
            <p className="text-brand-blue font-medium uppercase text-sm tracking-wide">
                {member.cargo}
            </p>
        </div>
    );
}
