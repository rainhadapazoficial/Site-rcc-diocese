"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Calendar, ChevronLeft, ChevronRight, MapPin, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const CATEGORIAS: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    diocesano: { label: "Diocesano", bg: "bg-brand-blue/10", text: "text-brand-blue", dot: "bg-brand-blue" },
    estadual: { label: "Estadual", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-600" },
    nacional: { label: "Nacional", bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-600" },
    grupo_oracao: { label: "Grupo de Oração", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-600" },
};

export default function CalendarioPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth() + 1);

    useEffect(() => {
        fetchEvents();
    }, [year]);

    async function fetchEvents() {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("calendario_diocesano")
            .select("*")
            .eq("ano", year)
            .order("data_inicio", { ascending: true });

        if (error) console.error("Error fetching calendar:", error);
        else setEvents(data || []);
        setIsLoading(false);
    }

    // Group by month
    const byMonth: Record<number, any[]> = {};
    events.forEach((ev: any) => {
        if (!byMonth[ev.mes]) byMonth[ev.mes] = [];
        byMonth[ev.mes].push(ev);
    });

    function formatDateRange(inicio: string, fim: string | null) {
        const d1 = new Date(inicio + (inicio.includes('T') ? '' : 'T12:00:00'));
        const day1 = d1.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
        if (!fim) return day1;
        const d2 = new Date(fim + (fim.includes('T') ? '' : 'T12:00:00'));
        const day2 = d2.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
        return `${day1} — ${day2}`;
    }

    function parseEventLink(ev: any): { cleanDesc: string; link: string | null } {
        if (ev.link_inscricao) {
            return { cleanDesc: ev.descricao || "", link: ev.link_inscricao };
        }
        const desc = ev.descricao || "";
        const match = desc.match(/(https?:\/\/[^\s]+)/i);
        if (!match) return { cleanDesc: desc, link: null };

        const link = match[1];
        const cleanDesc = desc
            .replace(new RegExp(`(link(\\s+da)?\\s+inscrição:?\\s*)?${link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi'), '')
            .trim();

        return { cleanDesc, link };
    }

    const getCat = (cat: string) => {
        if (!cat) return CATEGORIAS.diocesano;
        const norm = cat.toLowerCase().trim();
        if (norm === "grupo de oracao" || norm === "grupo de oração" || norm === "grupo_oracao" || norm === "grupo-de-oracao") {
            return CATEGORIAS.grupo_oracao;
        }
        return CATEGORIAS[norm] || CATEGORIAS.diocesano;
    };

    const displayMonths = selectedMonth !== null ? [selectedMonth] : Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-brand-blue py-20 text-white text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-brand-gold font-bold uppercase tracking-widest text-xs mb-6 border border-white/20">
                        <Calendar className="w-4 h-4" />
                        RCC Diocese de Sinop
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 italic text-brand-gold">Calendário Diocesano</h1>
                    <p className="text-xl text-blue-100">
                        Acompanhe todos os eventos, reuniões e encontros da diocese.
                    </p>
                    {/* Year Selector */}
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <Button variant="ghost" size="icon" onClick={() => setYear(y => y - 1)} className="text-white hover:bg-white/10 rounded-full">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <span className="text-4xl font-black">{year}</span>
                        <Button variant="ghost" size="icon" onClick={() => setYear(y => y + 1)} className="text-white hover:bg-white/10 rounded-full">
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Legend + Month Filter */}
            <section className="bg-white border-b sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-wrap gap-4 text-sm">
                        {Object.entries(CATEGORIAS).map(([key, cat]) => (
                            <div key={key} className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${cat.dot}`}></span>
                                <span className="text-gray-600 font-medium">{cat.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        <Button
                            variant={selectedMonth === null ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedMonth(null)}
                            className={`rounded-full text-xs h-8 ${selectedMonth === null ? "bg-brand-blue text-white" : ""}`}
                        >
                            Todos
                        </Button>
                        {MESES.map((m, idx) => {
                            const hasEvents = byMonth[idx + 1] && byMonth[idx + 1].length > 0;
                            return (
                                <Button
                                    key={idx}
                                    variant={selectedMonth === idx + 1 ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setSelectedMonth(idx + 1)}
                                    className={`rounded-full text-xs h-8 ${selectedMonth === idx + 1 ? "bg-brand-blue text-white" : ""} ${!hasEvents ? "opacity-40" : ""}`}
                                >
                                    {m.substring(0, 3)}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Calendar Grid */}
            <section className="py-12 flex-1">
                <div className="max-w-5xl mx-auto px-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Loader2 className="w-12 h-12 animate-spin mb-4 text-brand-gold" />
                            <p className="font-bold italic">Carregando calendário...</p>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-20">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-400">Nenhum evento para {year}</h3>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {displayMonths.map(mesNum => {
                                const monthEvents = byMonth[mesNum];
                                if (!monthEvents || monthEvents.length === 0) return null;
                                return (
                                    <div key={mesNum}>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="bg-brand-blue text-white font-black text-lg px-5 py-2 rounded-2xl">
                                                {MESES[mesNum - 1]}
                                            </div>
                                            <div className="flex-1 h-[2px] bg-brand-gold/20 rounded-full"></div>
                                            <span className="text-sm text-gray-400 font-bold">{monthEvents.length} evento{monthEvents.length > 1 ? "s" : ""}</span>
                                        </div>
                                        <div className="space-y-3">
                                            {monthEvents.map((ev: any) => {
                                                const cat = getCat(ev.categoria);
                                                const { cleanDesc, link } = parseEventLink(ev);
                                                return (
                                                    <div key={ev.id} className={`${cat.bg} rounded-2xl p-5 border border-transparent hover:border-gray-200 hover:shadow-md transition-all`}>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                            {/* Date badge */}
                                                            <div className="flex-shrink-0 bg-white rounded-xl px-4 py-2.5 text-center shadow-sm min-w-[130px]">
                                                                <span className="text-sm font-bold text-gray-800">
                                                                    {formatDateRange(ev.data_inicio, ev.data_fim)}
                                                                </span>
                                                            </div>
                                                            {/* Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className={`font-bold text-lg ${cat.text}`}>{ev.titulo}</h3>
                                                                {cleanDesc && (
                                                                    <p className="text-gray-600 text-sm mt-1">{cleanDesc}</p>
                                                                )}
                                                            </div>
                                                            {/* Actions & Category badge */}
                                                            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                                                                {link && (
                                                                    <a
                                                                        href={link}
                                                                        target={link.startsWith("http") ? "_blank" : "_self"}
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <Button size="sm" className="bg-brand-gold hover:bg-brand-gold/90 text-white font-bold rounded-xl text-xs gap-1.5 shadow-sm h-9 px-4">
                                                                            <span>Inscrever-se / LP</span>
                                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                                        </Button>
                                                                    </a>
                                                                )}
                                                                <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-full text-white ${cat.dot}`}>
                                                                    {cat.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
