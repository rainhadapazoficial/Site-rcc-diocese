"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
    Plus,
    Trash2,
    Edit,
    Loader2,
    Calendar,
    Clock,
    MapPin,
    Type,
    Image as ImageIcon,
    CheckCircle2,
    XCircle,
    AlertCircle,
    CalendarDays,
    Link as LinkIcon,
    ExternalLink
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { PremiumEditor } from "@/components/admin/PremiumEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { deleteAdminStorageImage } from "@/lib/storage-client";

function extractLinkFromDescricao(desc: string | null | undefined): { cleanDesc: string; link: string } {
    if (!desc) return { cleanDesc: "", link: "" };
    const markerMatch = desc.match(/<!--\s*lp_link:\s*([^\s>]+)\s*-->/);
    if (markerMatch) {
        return {
            cleanDesc: desc.replace(/<!--\s*lp_link:\s*[^\s>]+\s*-->\s*/, "").trim(),
            link: markerMatch[1],
        };
    }
    const textMatch = desc.match(/(?:Link Inscrição|Link LP|Inscrição|Landing Page):\s*(https?:\/\/[^\s]+)/i);
    if (textMatch) {
        return {
            cleanDesc: desc.replace(/(?:Link Inscrição|Link LP|Inscrição|Landing Page):\s*https?:\/\/[^\s]+/i, "").trim(),
            link: textMatch[1],
        };
    }
    return { cleanDesc: desc, link: "" };
}

function buildDescricaoWithLink(desc: string, link: string): string {
    const clean = desc.replace(/<!--\s*lp_link:\s*[^\s>]+\s*-->\s*/g, "").replace(/(?:Link Inscrição|Link LP|Inscrição|Landing Page):\s*https?:\/\/[^\s]+/gi, "").trim();
    if (!link || !link.trim()) return clean;
    const trimmed = link.trim();
    return `${clean}\n\n<!-- lp_link: ${trimmed} -->\nLink Inscrição: ${trimmed}`.trim();
}

export default function EventosAdminPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [editorContent, setEditorContent] = useState("");
    const [linkInscricao, setLinkInscricao] = useState("");

    useEffect(() => {
        fetchEvents();
    }, []);

    async function fetchEvents() {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .order("date", { ascending: true });

        if (error) console.error("Error fetching events:", error);
        else setEvents(data || []);
        setIsLoading(false);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const rawLink = ((formData.get("link_inscricao") as string) || "").trim();
        const baseDescription = editorContent;

        const eventDataWithCol: any = {
            title: formData.get("title"),
            description: baseDescription,
            date: formData.get("date"),
            time: formData.get("time"),
            location: formData.get("location"),
            image_url: formData.get("image_url"),
            category: formData.get("category"),
            link_inscricao: rawLink || null,
        };

        const eventDataFallback: any = {
            title: formData.get("title"),
            description: buildDescricaoWithLink(baseDescription, rawLink),
            date: formData.get("date"),
            time: formData.get("time"),
            location: formData.get("location"),
            image_url: formData.get("image_url"),
            category: formData.get("category"),
        };

        let result;
        if (editingEvent) {
            result = await supabase
                .from("events")
                .update(eventDataWithCol)
                .eq("id", editingEvent.id);

            // Fallback se coluna não existir no Postgres
            if (result.error && (result.error.code === '42703' || result.error.code === 'PGRST204' || result.error.message.includes('link_inscricao'))) {
                result = await supabase
                    .from("events")
                    .update(eventDataFallback)
                    .eq("id", editingEvent.id);
            }
        } else {
            result = await supabase
                .from("events")
                .insert([eventDataWithCol]);

            // Fallback se coluna não existir no Postgres
            if (result.error && (result.error.code === '42703' || result.error.code === 'PGRST204' || result.error.message.includes('link_inscricao'))) {
                result = await supabase
                    .from("events")
                    .insert([eventDataFallback]);
            }
        }

        if (result.error) {
            alert("Erro ao salvar evento: " + result.error.message);
        } else {
            setIsDialogOpen(false);
            setEditingEvent(null);
            setEditorContent("");
            setLinkInscricao("");
            fetchEvents();
        }
        setIsSubmitting(false);
    }

    async function deleteEvent(event: any) {
        if (!confirm(`Confirmar exclusão definitiva do evento: "${event.title}"?`)) return;

        try {
            // 1. Limpeza de imagem no Storage (Com proteção contra exclusão de imagem em uso)
            if (event.image_url) {
                await deleteAdminStorageImage(event.image_url, {
                    excludeTable: "events",
                    excludeId: event.id,
                });
            }

            // 2. Deletar no banco
            const { error: dbError } = await supabase
                .from("events")
                .delete()
                .eq("id", event.id);

            if (dbError) {
                console.error("[DATABASE] Erro ao deletar evento:", dbError);
                throw new Error(`Erro no Banco: ${dbError.message} (Código: ${dbError.code})`);
            }

            // 3. Sincronização de Estado
            setEvents(prev => prev.filter(e => e.id !== event.id));
            alert("Sucesso! O evento foi removido da agenda.");

        } catch (error: any) {
            console.error("ERRO TÉCNICO NA EXCLUSÃO:", error);
            alert(`⚠️ FALHA NA EXCLUSÃO\n\nMotivo: ${error.message}\n\nSe o erro for '403 Forbidden', verifique as permissões de DELETE no Supabase.`);
        }
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-brand-blue italic">Agenda da Diocese</h1>
                    <p className="text-gray-500">Gerencie os encontros, retiros e missas.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingEvent(null);
                        setEditorContent("");
                        setLinkInscricao("");
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => {
                                setEditingEvent(null);
                                setEditorContent("");
                                setLinkInscricao("");
                            }}
                            className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-xl h-12 px-6 shadow-lg shadow-brand-blue/20"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Novo Evento
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl sm:max-w-3xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader className="bg-brand-blue text-white p-8">
                                <DialogTitle className="text-2xl font-bold italic text-brand-gold">
                                    {editingEvent ? "Editar Evento" : "Novo Evento"}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-brand-blue uppercase tracking-widest flex items-center gap-2">
                                        <Type className="w-4 h-4" /> Nome do Evento
                                    </label>
                                    <Input
                                        name="title"
                                        defaultValue={editingEvent?.title}
                                        placeholder="Ex: Retiro de Carnaval 2024"
                                        className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-brand-blue uppercase tracking-widest flex items-center gap-2">
                                            <Calendar className="w-4 h-4" /> Data
                                        </label>
                                        <Input
                                            name="date"
                                            type="date"
                                            defaultValue={editingEvent?.date}
                                            className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-brand-blue uppercase tracking-widest flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Horário
                                        </label>
                                        <Input
                                            name="time"
                                            defaultValue={editingEvent?.time}
                                            placeholder="Ex: 19:30"
                                            className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-brand-blue uppercase tracking-widest flex items-center gap-2">
                                            <MapPin className="w-4 h-4" /> Localização
                                        </label>
                                        <Input
                                            name="location"
                                            defaultValue={editingEvent?.location}
                                            placeholder="Ex: Matriz da Paróquia Santo Antônio"
                                            className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-brand-blue uppercase tracking-widest flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" /> Categoria
                                        </label>
                                        <Input
                                            name="category"
                                            list="event-categories"
                                            defaultValue={editingEvent?.category}
                                            placeholder="Ex: Grupo de Oração, Retiro..."
                                            className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
                                            required
                                        />
                                        <datalist id="event-categories">
                                            <option value="Grupo de Oração" />
                                            <option value="Retiro" />
                                            <option value="Encontro" />
                                            <option value="Missa / Vigília" />
                                            <option value="Formação" />
                                            <option value="Congresso" />
                                        </datalist>
                                    </div>
                                </div>

                                <div>
                                    <ImageUploader
                                        name="image_url"
                                        defaultValue={editingEvent?.image_url || ""}
                                        folder="eventos"
                                        label="Banner / Capa do Evento"
                                        placeholder="https://exemplo.com/banner-evento.jpg"
                                        compact
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-brand-blue uppercase tracking-widest flex items-center gap-2">
                                        <LinkIcon className="w-4 h-4 text-brand-gold" /> Link da Landing Page / Inscrição (LP)
                                    </label>
                                    <Input
                                        name="link_inscricao"
                                        value={linkInscricao}
                                        onChange={(e) => setLinkInscricao(e.target.value)}
                                        placeholder="Ex: https://eventos.sistemaprover.com.br/... ou /festa-rei-jesus"
                                        className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
                                    />
                                    <p className="text-[11px] text-gray-400">
                                        Insira a URL da página de inscrições ou Landing Page oficial para gerar o botão aos fiéis.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-brand-blue uppercase tracking-widest flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> Descrição
                                    </label>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Descrição Completa</label>
                                        <PremiumEditor
                                            content={editorContent}
                                            onChange={setEditorContent}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="p-8 bg-gray-50 border-t">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="rounded-xl h-12 px-6"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-brand-gold hover:bg-brand-gold/90 text-white font-bold rounded-xl h-12 px-10 shadow-lg shadow-brand-gold/20"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Evento"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="w-12 h-12 animate-spin mb-4 text-brand-gold" />
                        <p className="font-bold italic">Carregando agenda...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-[3rem]">
                        <XCircle className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-xl font-bold italic">Nenhum evento agendado.</p>
                    </div>
                ) : (
                    events.map((event) => (
                        <Card key={event.id} className="group overflow-hidden rounded-[2rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500">
                            <div className="relative h-40 bg-brand-blue/5 overflow-hidden">
                                {event.image_url ? (
                                    <img src={event.image_url} alt={event.title || "Evento"} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-brand-blue/20">
                                        <Calendar className="w-20 h-20" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-brand-blue uppercase tracking-widest border border-brand-blue/10">
                                    {event.category}
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-brand-blue line-clamp-1 italic">{event.title}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-brand-gold" />
                                            {new Date(event.date + (event.date?.includes('T') ? '' : 'T12:00:00')).toLocaleDateString("pt-BR")}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-brand-gold" />
                                            {event.time}
                                        </div>
                                    </div>
                                    {(() => {
                                        const lp = event.link_inscricao || extractLinkFromDescricao(event.description).link;
                                        if (!lp) return null;
                                        return (
                                            <a
                                                href={lp}
                                                target={lp.startsWith("http") ? "_blank" : undefined}
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md mt-2 hover:bg-emerald-100 transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3 text-emerald-600" />
                                                LP / Inscrição
                                            </a>
                                        );
                                    })()}
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-1 text-xs text-gray-400 truncate">
                                        <MapPin className="w-3 h-3" />
                                        {event.location}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setEditingEvent(event);
                                                const extracted = extractLinkFromDescricao(event.description);
                                                setEditorContent(extracted.cleanDesc || "");
                                                setLinkInscricao(event.link_inscricao || extracted.link || "");
                                                setIsDialogOpen(true);
                                            }}
                                            className="h-10 w-10 rounded-xl text-brand-blue hover:bg-brand-blue/5"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteEvent(event)}
                                            className="h-10 w-10 rounded-xl text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
