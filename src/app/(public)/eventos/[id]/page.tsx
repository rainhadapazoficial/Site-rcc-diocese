import { supabase } from "@/lib/supabase";
import parse from "html-react-parser";
import { sanitizeHtml } from "@/lib/sanitize";
import { Calendar, MapPin, Clock, ArrowLeft, Share2, Info } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

async function getEvent(id: string) {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) return null;
    return data;
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) {
        notFound();
    }

    const dateObj = new Date(event.date);
    const day = dateObj.toLocaleDateString('pt-BR', { day: '2-digit' });
    const month = dateObj.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header / Hero */}
            <section className="bg-brand-blue py-20 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=2000')] opacity-10 bg-cover bg-center" />
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <Link
                        href="/eventos"
                        className="inline-flex items-center gap-2 text-brand-gold hover:text-white transition-colors mb-12 font-bold text-sm uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4" /> Voltar para Agenda
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-end">
                        <div className="lg:col-span-2 space-y-6">
                            <span className="bg-brand-gold/20 text-brand-gold border border-brand-gold/30 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                {event.category || "Encontro"}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-bold italic leading-tight">
                                {event.title}
                            </h1>
                        </div>
                        <div className="flex lg:justify-end">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl flex items-center gap-6">
                                <div className="text-center border-r border-white/20 pr-6">
                                    <span className="block text-4xl font-bold text-brand-gold">{day}</span>
                                    <span className="block text-sm font-bold uppercase tracking-widest">{month}</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-brand-gold" />
                                        {event.time}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-brand-gold" />
                                        {event.location.split(',')[0]}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">

                    {/* Content Left */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-brand-blue mb-8 flex items-center gap-3">
                                <Info className="w-6 h-6 text-brand-gold" /> Sobre o Evento
                            </h2>
                            <div className="prose prose-sm sm:prose lg:prose-lg max-w-none prose-headings:text-brand-blue prose-img:rounded-3xl">
                                {typeof event.description === 'string' && event.description.startsWith('<')
                                    ? parse(sanitizeHtml(event.description))
                                    : <p className="whitespace-pre-wrap">{event.description}</p>
                                }
                            </div>
                        </div>

                        {/* CTA / Invite */}
                        <div className="bg-brand-gold/10 p-12 rounded-[3.5rem] border-2 border-dashed border-brand-gold flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl font-bold text-brand-blue mb-2">Vai participar conosco?</h3>
                                <p className="text-gray-600">Convide seus amigos e familiares para este momento de bênção.</p>
                            </div>
                            <Button asChild className="bg-brand-blue text-white w-full md:w-auto h-14 px-8 rounded-2xl gap-2 font-bold shadow-xl shadow-brand-blue/20 transition-all hover:-translate-y-1">
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(`Venha participar do evento "${event.title}" da RCC Diocese de Sinop! Local: ${event.location || "Sinop - MT"}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Share2 className="w-5 h-5" /> Compartilhar Convite
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Sidebar Right */}
                    <div className="space-y-8">
                        {event.image_url && (
                            <div className="rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                                <img src={event.image_url} alt={event.title} className="w-full h-auto" />
                            </div>
                        )}

                        <div className="bg-brand-blue text-white p-10 rounded-[3rem] shadow-xl space-y-8">
                            <h4 className="text-xl font-bold italic text-brand-gold border-b border-white/10 pb-4">Detalhes do Local</h4>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <MapPin className="w-6 h-6 text-brand-gold flex-shrink-0" />
                                    <span className="text-blue-50 leading-relaxed font-medium">{event.location}</span>
                                </div>
                                <Button asChild variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 h-12 rounded-xl">
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || "Sinop MT")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Ver no Google Maps
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
