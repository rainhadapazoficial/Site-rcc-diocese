import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, MapPin, Clock, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import FestaCountdown from "@/components/public/festa-countdown";

export const metadata: Metadata = {
    title: "Agenda de Eventos | Igreja Católica Sinop MT",
    description: "Confira o calendário diocesano, retiros e encontros da RCC em Sinop e região do Mato Grosso.",
};

export const revalidate = 60; // Revalidate every minute

async function getEvents() {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

    if (error) {
        console.error("Error fetching events:", error);
        return [];
    }
    return data || [];
}

export default async function EventosPage() {
    const events = await getEvents();

    // Fallback mock data if DB is empty
    const displayEvents = events;

    return (
        <div className="flex flex-col">
            {/* Festa do Rei Jesus Hero - Destaque Principal */}
            <FestaCountdown />

            {/* Header Eventos */}
            <section className="bg-white py-16 text-center border-b">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-5xl font-bold mb-6 italic text-brand-blue">Agenda de Eventos</h1>
                    <p className="text-xl text-gray-600">
                        Fique por dentro de todos os encontros e atividades da nossa diocese.
                    </p>
                </div>
            </section>

            {/* Events List */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-5xl mx-auto px-4">
                    {displayEvents.length > 0 ? (
                        <div className="space-y-8">
                            {displayEvents.map((event: any) => (
                                <div key={event.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border flex flex-col md:flex-row hover:shadow-xl transition-all duration-300">
                                    <div className="bg-brand-blue md:w-48 p-8 flex flex-col items-center justify-center text-white text-center">
                                        <span className="text-sm font-bold uppercase text-brand-gold mb-2">{event.category || "Evento"}</span>
                                        <CalendarIcon className="w-8 h-8 mb-2" />
                                        <span className="text-lg font-bold leading-tight">
                                            {event.date && event.date.includes('-')
                                                ? new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                                                : (event.date ? event.date.split(',')[0] : "A definir")}
                                        </span>
                                    </div>
                                    <div className="flex-1 p-8 md:p-12 space-y-4">
                                        <h3 className="text-3xl font-bold text-gray-900">{event.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{event.description}</p>
                                        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-brand-gold" />
                                                <span>{event.time || "A confirmar"}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-5 h-5 text-brand-gold flex-shrink-0" />
                                                <span>{event.location}</span>
                                            </div>
                                        </div>
                                        <div className="pt-6">
                                            <Link href={`/eventos/${event.id}`}>
                                                <Button className="bg-brand-blue text-white group">
                                                    Mais Informações
                                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200 max-w-2xl mx-auto shadow-sm">
                            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-400 italic font-medium">Novas programações em breve! Fique atento às nossas atualizações.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
