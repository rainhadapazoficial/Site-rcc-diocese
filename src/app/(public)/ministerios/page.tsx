"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
    Mic2, Heart, Baby, Flame, Users, ShieldCheck,
    BookOpen, Music, Share2, Scale, HandHelping,
    GraduationCap, ArrowRight, History, Loader2, MapPin, Clock
} from "lucide-react";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// Maple icons from Lucide for fallback/default
const iconMap: Record<string, any> = {
    "Mic2": Mic2,
    "Heart": Heart,
    "Baby": Baby,
    "Flame": Flame,
    "Users": Users,
    "ShieldCheck": ShieldCheck,
    "BookOpen": BookOpen,
    "Music": Music,
    "Share2": Share2,
    "Scale": Scale,
    "HandHelping": HandHelping,
    "GraduationCap": GraduationCap
};

export default function MinisteriosPublicPage() {
    const [ministerios, setMinisterios] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMinistry, setSelectedMinistry] = useState<any>(null);

    useEffect(() => {
        fetchMinisterios();
    }, []);

    async function fetchMinisterios() {
        setIsLoading(true);
        // Fetch ministries
        const { data: minData, error: minError } = await supabase
            .from("ministerios")
            .select("*")
            .order("ordem", { ascending: true });

        if (minError) {
            console.error("Error fetching ministerios:", minError);
            setIsLoading(false);
            return;
        }

        const list = minData || [];
        if (list.length === 0) {
            setMinisterios([]);
            setIsLoading(false);
            return;
        }

        // Fetch history for all fetched ministries
        const ids = list.map((m: any) => m.id);
        const { data: historyData } = await supabase
            .from("ministerio_coordinator_history")
            .select("ministerio_id, nome, gestao, ordem")
            .in("ministerio_id", ids)
            .order("ordem", { ascending: true });

        const historyByMin: Record<number, any[]> = {};
        (historyData || []).forEach((row: any) => {
            if (!historyByMin[row.ministerio_id]) historyByMin[row.ministerio_id] = [];
            historyByMin[row.ministerio_id].push({ nome: row.nome, gestao: row.gestao });
        });

        setMinisterios(list.map((m: any) => ({
            ...m,
            history: historyByMin[m.id] || []
        })));
        setIsLoading(false);
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            {/* Header Section */}
            <section className="bg-brand-blue py-24 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.rccdesinop.com.br/wp-content/uploads/2025/06/Renocacao-Carismatica-cartolica-fundo.png')] bg-cover bg-center" />
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 italic text-brand-gold">Nossos Ministérios</h1>
                    <p className="text-xl text-blue-100 leading-relaxed">
                        Na RCC Diocese de Sinop, a evangelização se faz viva através de diversos ministérios
                        que servem à Igreja e à comunidade com seus dons.
                    </p>
                </div>
            </section>

            {/* Grid de Ministérios */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-brand-blue mb-4">Onde o Espírito Santo te chama?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Conheça cada um deles, quem os coordena hoje e a história de quem já serviu com amor.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="w-12 h-12 animate-spin mb-4 text-brand-gold" />
                            <p className="font-bold italic">Carregando ministérios...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {ministerios.map((min, idx) => {
                                // Find icon based on name or use Flame as default
                                const IconComp = iconMap[min.nome.split(' ').pop() || ""] || iconMap[Object.keys(iconMap).find(k => min.nome.includes(k)) || ""] || Flame;

                                return (
                                    <div key={min.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100/50 hover:shadow-2xl transition-all duration-500 group flex flex-col">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className={`w-16 h-16 rounded-2xl ${min.cor || 'bg-brand-blue/5 text-brand-blue'} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                                                <IconComp className="w-8 h-8" />
                                            </div>
                                            {min.bienio && (
                                                <span className="text-[10px] font-bold text-brand-gold bg-brand-gold/5 px-3 py-1 rounded-full uppercase tracking-widest">
                                                    Gestão {min.bienio}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-2xl font-bold text-brand-blue mb-4 italic transition-colors">
                                            {min.nome}
                                        </h3>

                                        <p className="text-gray-500 leading-relaxed mb-6 italic text-sm line-clamp-3">
                                            "{min.descricao}"
                                        </p>

                                        <div className="space-y-4 pt-4 mt-auto border-t border-gray-50">
                                            <div className="flex items-center gap-3">
                                                {min.imagem_url ? (
                                                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-brand-blue/5 shadow-sm">
                                                        <img src={min.imagem_url} alt={min.coordenador} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-2xl bg-brand-blue/5 flex items-center justify-center text-brand-blue shadow-sm">
                                                        <Users className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400">Coordenador atual</p>
                                                    <p className="font-bold text-brand-blue">{min.coordenador || "A definir"}</p>
                                                </div>
                                            </div>

                                            {min.history && min.history.length > 0 && (
                                                <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-2xl">
                                                    <History className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Histórico de gestões</p>
                                                        <ul className="text-xs text-gray-600 space-y-1">
                                                            {min.history.slice(0, 2).map((h: any, i: number) => (
                                                                <li key={i} className="flex flex-wrap gap-1 items-baseline">
                                                                    <span className="font-medium text-brand-blue/80">{h.nome}</span>
                                                                    <span className="text-gray-400">({h.gestao})</span>
                                                                </li>
                                                            ))}
                                                            {min.history.length > 2 && (
                                                                <li className="text-brand-gold font-bold">+{min.history.length - 2} outras gestões...</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}

                                            <Button
                                                onClick={() => setSelectedMinistry(min)}
                                                className={`w-full h-12 rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-sm ${min.cor || 'bg-brand-blue text-white'}`}
                                            >
                                                Saiba Mais
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Ministry Details Modal */}
            <Dialog open={!!selectedMinistry} onOpenChange={(open) => !open && setSelectedMinistry(null)}>
                <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none max-h-[90vh] flex flex-col">
                    {selectedMinistry && (() => {
                        const IconComp = iconMap[selectedMinistry.nome.split(' ').pop() || ""] || iconMap[Object.keys(iconMap).find(k => selectedMinistry.nome.includes(k)) || ""] || Flame;
                        return (
                            <>
                                <div className={`relative h-64 shrink-0 flex items-center justify-center ${selectedMinistry.cor || 'bg-brand-blue text-white'}`}>
                                    <div className="absolute inset-0 bg-black/5" />
                                    <IconComp className="w-32 h-32 opacity-20 transform -rotate-12" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-6 left-8 right-8">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-bold text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-md border border-brand-gold/20">
                                                {selectedMinistry.bienio ? `Gestão ${selectedMinistry.bienio}` : "Ministério Diocesano"}
                                            </span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-white italic">{selectedMinistry.nome}</h2>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Flame className="w-4 h-4 text-brand-gold" />
                                                Missão e Chamado
                                            </h4>
                                            <p className="text-gray-600 leading-relaxed italic text-lg">
                                                "{selectedMinistry.descricao || "Nenhuma descrição disponível."}"
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="bg-gray-50 p-6 rounded-[2rem] space-y-4 border border-gray-100 flex flex-col">
                                                <div className="flex items-start gap-4">
                                                    {selectedMinistry.imagem_url ? (
                                                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                                                            <img src={selectedMinistry.imagem_url} alt={selectedMinistry.coordenador} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-blue shrink-0">
                                                            <Users className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold text-gray-400">Coordenação Atual</p>
                                                        <p className="font-bold text-brand-blue text-xl">{selectedMinistry.coordenador || "A definir"}</p>
                                                        <p className="text-sm text-brand-gold font-bold italic">{selectedMinistry.bienio}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <Link href="/contato" className="block">
                                                <Button className="w-full h-14 rounded-2xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold gap-2 shadow-lg transform hover:-translate-y-1 transition-all">
                                                    Quero servir neste ministério
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>

                                    {selectedMinistry.history && selectedMinistry.history.length > 0 && (
                                        <div className="space-y-4 pt-4">
                                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <History className="w-4 h-4 text-brand-blue" />
                                                Histórico de Servos (Coordenadores)
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {selectedMinistry.history.map((h: any, i: number) => (
                                                    <div key={i} className="flex flex-col p-5 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:border-brand-gold/30 transition-colors">
                                                        <p className="font-bold text-brand-blue text-lg">{h.nome}</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{h.gestao}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* CTA Section */}
            <section className="py-20 bg-brand-blue text-white mt-auto">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-8 italic text-brand-gold">Quer Servir em um Ministério?</h2>
                    <p className="text-lg mb-10 text-blue-100">
                        Se você sente o chamado para servir a Deus e aos irmãos em algum de nossos ministérios,
                        entre em contato conosco e venha fazer parte desta grande família de servos!
                    </p>
                    <Link href="/contato">
                        <Button size="lg" className="bg-brand-gold hover:bg-yellow-600 text-brand-blue font-bold px-12 rounded-full transform hover:scale-105 transition-all h-14">
                            Quero me tornar um servo
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
