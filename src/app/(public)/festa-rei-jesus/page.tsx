"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Calendar, MapPin, Crown, ChevronRight, History, Info, Star, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import parse from "html-react-parser";
import { sanitizeHtml } from "@/lib/sanitize";

interface Atracao {
    nome: string;
    descricao: string;
    foto_url: string;
}

export default function FestaReiJesusPage() {
    const [editions, setEditions] = useState<any[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pageContent, setPageContent] = useState<any>(null);

    useEffect(() => {
        fetchEditions();
        fetchPageContent();
    }, []);

    async function fetchPageContent() {
        const { data } = await supabase
            .from("custom_pages")
            .select("*")
            .eq("slug", "festa-rei-jesus")
            .single();

        if (data) setPageContent(data);
    }

    async function fetchEditions() {
        const { data, error } = await supabase
            .from("festa_rei_jesus_editions")
            .select("*")
            .order("ano", { ascending: false });

        if (error) {
            console.error("Error fetching history:", error);
        } else if (data && data.length > 0) {
            setEditions(data);
            setSelectedYear(data[0].ano);
        }
        setIsLoading(false);
    }

    const currentEdition = editions.find((e: any) => e.ano === selectedYear);

    function formatDate(dateStr: string) {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header / Hero Section */}
            <section className="relative bg-brand-blue py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-brand-gold font-bold uppercase tracking-widest text-xs mb-6 border border-white/20"
                    >
                        <Crown className="w-4 h-4" />
                        Nossa História de Fé
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-white mb-6 italic"
                    >
                        Festa do Rei Jesus
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed"
                    >
                        A maior festa cristã da região norte de Mato Grosso! Um encontro de louvor, adoração, pregação e muita alegria na presença de Jesus.
                    </motion.p>
                </div>
            </section>

            {/* About Section */}
            <section className="py-16 bg-white">
                <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 bg-brand-gold/10 text-brand-gold font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest">
                            <Info className="w-4 h-4" />
                            Sobre o Evento
                        </div>
                        <h2 className="text-4xl font-bold text-brand-blue italic">{pageContent?.title || "O que é a Festa do Rei Jesus?"}</h2>
                        <div className="text-gray-600 leading-relaxed text-lg space-y-4">
                            {pageContent ? (
                                parse(sanitizeHtml(pageContent.content))
                            ) : (
                                <>
                                    <p>
                                        A Festa do Rei Jesus é um evento tradicional da Renovação Carismática Católica da Diocese de Sinop.
                                        Todos os anos, reunimos milhares de fiéis para celebrar a realeza de Cristo em nossas vidas com shows nacionais, pregações impactantes e momentos profundos de oração.
                                    </p>
                                    <p>
                                        É um tempo de renovação espiritual e confraternização para toda a família católica.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="relative h-80 rounded-[2rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-all duration-500">
                        {pageContent?.image_url ? (
                            <img src={pageContent.image_url} alt="Sobre o evento" className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 bg-brand-blue text-white flex flex-col items-center justify-center p-8 text-center">
                                <Crown className="w-20 h-20 mb-4 text-brand-gold" />
                                <p className="font-bold text-xl">Venha Celebrar Conosco!</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-12 h-12 animate-spin mb-4 text-brand-gold" />
                        <p className="font-bold italic">Carregando história...</p>
                    </div>
                ) : editions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-gray-100">
                        <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-400">Nenhum registro encontrado</h3>
                        <p className="text-gray-500 mt-2">O histórico das edições será adicionado em breve.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* Timeline / Year Selector (Sidebar) */}
                        <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-4">Linha do Tempo</h3>
                            <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-4 lg:pb-0 px-1 scrollbar-hide">
                                {editions.map((edition: any) => (
                                    <button
                                        key={edition.id}
                                        onClick={() => setSelectedYear(edition.ano)}
                                        className={`
                                            whitespace-nowrap px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-between group
                                            ${selectedYear === edition.ano
                                                ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/30 scale-105"
                                                : "bg-white text-gray-600 hover:bg-white hover:shadow-md hover:text-brand-blue"
                                            }
                                        `}
                                    >
                                        <span className="text-lg">{edition.ano}</span>
                                        {selectedYear === edition.ano && (
                                            <ChevronRight className="w-5 h-5 text-brand-gold" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-9">
                            <AnimatePresence mode="wait">
                                {currentEdition && (
                                    <motion.div
                                        key={currentEdition.ano}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-brand-blue/5">

                                            {/* Image Banner */}
                                            <div className="relative h-64 md:h-96 w-full bg-gray-100">
                                                {currentEdition.imagem_url ? (
                                                    <img
                                                        src={currentEdition.imagem_url}
                                                        alt={`Festa do Rei Jesus ${currentEdition.ano}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-brand-blue/5 text-brand-blue/20">
                                                        <Crown className="w-24 h-24 mb-4" />
                                                        <span className="font-bold text-xl uppercase tracking-widest">Sem Imagem</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                                <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
                                                    <div className="bg-brand-gold text-brand-blue font-bold px-4 py-1 rounded-full text-sm inline-block mb-4 shadow-lg">
                                                        Edição {currentEdition.ano}
                                                    </div>
                                                    <h2 className="text-3xl md:text-5xl font-black italic shadow-black drop-shadow-lg leading-tight">
                                                        &quot;{currentEdition.tema}&quot;
                                                    </h2>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="p-8 md:p-12 space-y-8">
                                                <div className="flex flex-wrap items-center gap-4 text-gray-600 border-b border-gray-100 pb-8">
                                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                                                        <Calendar className="w-5 h-5 text-brand-blue" />
                                                        {currentEdition.data_inicio ? (
                                                            <span className="font-bold">
                                                                {formatDate(currentEdition.data_inicio)}
                                                                {currentEdition.data_fim && ` — ${formatDate(currentEdition.data_fim)}`}
                                                            </span>
                                                        ) : (
                                                            <span className="font-bold">{currentEdition.ano}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                                                        <MapPin className="w-5 h-5 text-brand-blue" />
                                                        <span className="font-medium">{currentEdition.local}</span>
                                                    </div>
                                                </div>

                                                <div className="prose prose-lg text-gray-600 leading-relaxed max-w-none">
                                                    <h3 className="text-2xl font-bold text-brand-blue italic mb-4">Sobre esta edição</h3>
                                                    {currentEdition.descricao ? (
                                                        <p className="whitespace-pre-wrap">{currentEdition.descricao}</p>
                                                    ) : (
                                                        <p className="italic text-gray-400">Nenhuma descrição disponível para esta edição.</p>
                                                    )}
                                                </div>

                                                {/* Attractions */}
                                                {currentEdition.atracoes && currentEdition.atracoes.length > 0 && (
                                                    <div className="border-t border-gray-100 pt-8">
                                                        <h3 className="text-2xl font-bold text-brand-blue italic mb-6 flex items-center gap-2">
                                                            <Star className="w-6 h-6 text-brand-gold" />
                                                            Atrações
                                                        </h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {currentEdition.atracoes.map((atracao: Atracao, index: number) => (
                                                                <Card key={index} className="overflow-hidden rounded-2xl border shadow-sm hover:shadow-lg transition-all group">
                                                                    <CardContent className="p-0">
                                                                        <div className="h-40 w-full bg-gray-100 overflow-hidden">
                                                                            {atracao.foto_url ? (
                                                                                <img
                                                                                    src={atracao.foto_url}
                                                                                    alt={atracao.nome}
                                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                                />
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center bg-brand-blue/5 text-brand-blue/20">
                                                                                    <User className="w-12 h-12" />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="p-4">
                                                                            <h4 className="font-bold text-brand-blue text-lg">{atracao.nome}</h4>
                                                                            {atracao.descricao && (
                                                                                <p className="text-gray-500 text-sm mt-1">{atracao.descricao}</p>
                                                                            )}
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
