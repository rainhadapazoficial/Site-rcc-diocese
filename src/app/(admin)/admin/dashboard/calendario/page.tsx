"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Plus, Search, Trash2, Edit, Loader2,
    XCircle, Calendar, MapPin
} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const CATEGORIAS = [
    { value: "diocesano", label: "Diocesano", color: "bg-brand-blue" },
    { value: "estadual", label: "Estadual", color: "bg-red-600" },
    { value: "nacional", label: "Nacional", color: "bg-gray-600" },
];

export default function CalendarioAdminPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchEvents();
    }, [filterYear]);

    async function fetchEvents() {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("calendario_diocesano")
            .select("*")
            .eq("ano", filterYear)
            .order("data_inicio", { ascending: true });

        if (error) console.error("Error fetching calendar:", error);
        else setEvents(data || []);
        setIsLoading(false);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);

        const dataInicio = formData.data_inicio;
        const mes = dataInicio ? new Date(dataInicio).getMonth() + 1 : 1;
        const ano = dataInicio ? new Date(dataInicio).getFullYear() : filterYear;

        const eventData = {
            titulo: formData.titulo,
            data_inicio: formData.data_inicio,
            data_fim: formData.data_fim || null,
            mes,
            ano,
            categoria: formData.categoria || "diocesano",
            descricao: formData.descricao || null,
        };

        let result;
        if (editingEvent) {
            result = await supabase
                .from("calendario_diocesano")
                .update(eventData)
                .eq("id", editingEvent.id);
        } else {
            result = await supabase
                .from("calendario_diocesano")
                .insert([eventData]);
        }

        if (result.error) {
            alert("Erro ao salvar: " + result.error.message);
        } else {
            setIsDialogOpen(false);
            setEditingEvent(null);
            setFormData({});
            fetchEvents();
        }
        setIsSubmitting(false);
    }

    async function deleteEvent(id: number) {
        if (!confirm("Confirmar exclusão deste evento?")) return;
        const { error } = await supabase.from("calendario_diocesano").delete().eq("id", id);
        if (error) alert("Erro ao deletar: " + error.message);
        else fetchEvents();
    }

    const openEdit = (event: any) => {
        setEditingEvent(event);
        setFormData(event);
        setIsDialogOpen(true);
    };

    const openNew = () => {
        setEditingEvent(null);
        setFormData({ categoria: "diocesano", ano: filterYear });
        setIsDialogOpen(true);
    };

    const filteredEvents = events.filter((e: any) =>
        e.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group events by month
    const byMonth: Record<number, any[]> = {};
    filteredEvents.forEach((ev: any) => {
        if (!byMonth[ev.mes]) byMonth[ev.mes] = [];
        byMonth[ev.mes].push(ev);
    });

    function getCatColor(cat: string) {
        const c = CATEGORIAS.find(c => c.value === cat);
        return c ? c.color : "bg-gray-400";
    }

    function getCatLabel(cat: string) {
        const c = CATEGORIAS.find(c => c.value === cat);
        return c ? c.label : cat;
    }

    function formatDate(d: string) {
        if (!d) return "";
        return new Date(d + (d.includes('T') ? '' : 'T12:00:00')).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-blue italic flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-brand-gold" />
                        Calendário Diocesano
                    </h1>
                    <p className="text-gray-500">Gerencie o calendário de eventos da diocese.</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3">
                        <Label className="text-xs text-gray-500 whitespace-nowrap">Ano:</Label>
                        <Select value={String(filterYear)} onValueChange={(v: string) => setFilterYear(parseInt(v))}>
                            <SelectTrigger className="w-24 border-none bg-transparent">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[2024, 2025, 2026, 2027, 2028].map(y => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Buscar evento..."
                            className="pl-10 rounded-xl w-56"
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
                        setIsDialogOpen(open);
                        if (!open) { setEditingEvent(null); setFormData({}); }
                    }}>
                        <DialogTrigger asChild>
                            <Button onClick={openNew} className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-xl h-12">
                                <Plus className="w-5 h-5 mr-2" />
                                Novo Evento
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl rounded-[2rem]">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold italic text-brand-blue">
                                        {editingEvent ? "Editar Evento" : "Novo Evento"}
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-2">
                                    <Label>Título</Label>
                                    <Input
                                        placeholder="Ex: Encontro de Pentecostes"
                                        value={formData.titulo || ""}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, titulo: e.target.value })}
                                        required
                                        className="rounded-xl"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Data Início</Label>
                                        <Input
                                            type="date"
                                            value={formData.data_inicio || ""}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, data_inicio: e.target.value })}
                                            required
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Data Fim (Opcional)</Label>
                                        <Input
                                            type="date"
                                            value={formData.data_fim || ""}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, data_fim: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Categoria</Label>
                                    <Select value={formData.categoria || "diocesano"} onValueChange={(v: string) => setFormData({ ...formData, categoria: v })}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIAS.map(c => (
                                                <SelectItem key={c.value} value={c.value}>
                                                    <span className="flex items-center gap-2">
                                                        <span className={`w-3 h-3 rounded-full ${c.color}`}></span>
                                                        {c.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Descrição (Opcional)</Label>
                                    <Textarea
                                        placeholder="Detalhes do evento..."
                                        value={formData.descricao || ""}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, descricao: e.target.value })}
                                        className="min-h-[80px]"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="submit" className="bg-brand-blue text-white w-full rounded-xl" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
                {CATEGORIAS.map(c => (
                    <div key={c.value} className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${c.color}`}></span>
                        <span className="text-gray-600 font-medium">{c.label}</span>
                    </div>
                ))}
            </div>

            {/* Calendar Grid by Month */}
            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                    <Loader2 className="w-12 h-12 animate-spin mb-4 text-brand-gold" />
                    <p className="font-bold italic">Carregando calendário...</p>
                </div>
            ) : Object.keys(byMonth).length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-[3rem]">
                    <XCircle className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-xl font-bold italic text-brand-blue">Nenhum evento encontrado para {filterYear}.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.keys(byMonth).sort((a, b) => Number(a) - Number(b)).map(mesStr => {
                        const mesNum = Number(mesStr);
                        return (
                            <div key={mesNum}>
                                <h2 className="text-2xl font-bold text-brand-blue italic mb-4 border-b-2 border-brand-gold/30 pb-2">
                                    {MESES[mesNum - 1]}
                                </h2>
                                <div className="space-y-2">
                                    {byMonth[mesNum].map((ev: any) => (
                                        <div key={ev.id} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border hover:shadow-md transition-all group">
                                            <div className={`w-2 h-12 rounded-full ${getCatColor(ev.categoria)} flex-shrink-0`}></div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate">{ev.titulo}</h3>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(ev.data_inicio)}
                                                        {ev.data_fim && ` — ${formatDate(ev.data_fim)}`}
                                                    </span>
                                                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full text-white ${getCatColor(ev.categoria)}`}>
                                                        {getCatLabel(ev.categoria)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(ev)} className="text-gray-400 hover:text-brand-blue rounded-xl h-8 w-8">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => deleteEvent(ev.id)} className="text-gray-400 hover:text-red-500 rounded-xl h-8 w-8">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
