"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
    Plus, Search, Trash2, Edit, Loader2,
    CheckCircle2, XCircle, Flame, History,
    Users, Info, Palette
} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";

export default function MinisteriosAdminPage() {
    const [ministerios, setMinisterios] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMinistry, setEditingMinistry] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [coordinatorHistory, setCoordinatorHistory] = useState<{ nome: string; gestao: string }[]>([]);

    useEffect(() => {
        fetchMinisterios();
    }, []);

    async function fetchMinisterios() {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("ministerios")
            .select("*")
            .order("ordem", { ascending: true });

        if (error) console.error("Error fetching ministerios:", error);
        else setMinisterios(data || []);
        setIsLoading(false);
    }

    async function fetchCoordinatorHistory(ministryId: number) {
        const { data, error } = await supabase
            .from("ministerio_coordinator_history")
            .select("id, nome, gestao, ordem")
            .eq("ministerio_id", ministryId)
            .order("ordem", { ascending: true });
        if (error) {
            console.error("Error fetching coordinator history:", error);
            return [];
        }
        return (data || []).map((r: { nome: string; gestao: string }) => ({ nome: r.nome, gestao: r.gestao }));
    }

    function addCoordinatorHistoryRow() {
        setCoordinatorHistory((prev) => [...prev, { nome: "", gestao: "" }]);
    }

    function updateCoordinatorHistoryRow(index: number, field: "nome" | "gestao", value: string) {
        setCoordinatorHistory((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    }

    function removeCoordinatorHistoryRow(index: number) {
        setCoordinatorHistory((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);

        const formValues = new FormData(e.currentTarget);
        const ministryData = {
            nome: formValues.get("nome"),
            descricao: formData.descricao,
            coordenador: formValues.get("coordenador"),
            bienio: formValues.get("bienio"),
            imagem_url: formData.imagem_url,
            cor: formValues.get("cor") || 'bg-blue-100 text-blue-600',
            ordem: parseInt(formValues.get("ordem") as string) || 0,
        };

        let ministryId: number;
        if (editingMinistry) {
            const result = await supabase.from("ministerios").update(ministryData).eq("id", editingMinistry.id).select("id").single();
            if (result.error) {
                alert("Erro ao salvar ministério: " + result.error.message);
                setIsSubmitting(false);
                return;
            }
            ministryId = result.data.id;
        } else {
            const result = await supabase.from("ministerios").insert([ministryData]).select("id").single();
            if (result.error) {
                alert("Erro ao salvar ministério: " + result.error.message);
                setIsSubmitting(false);
                return;
            }
            ministryId = result.data.id;
        }

        // Update History
        await supabase.from("ministerio_coordinator_history").delete().eq("ministerio_id", ministryId);
        const validHistory = coordinatorHistory.filter((h) => h.nome.trim() || h.gestao.trim());
        if (validHistory.length > 0) {
            await supabase.from("ministerio_coordinator_history").insert(
                validHistory.map((h: { nome: string; gestao: string }, i: number) => ({
                    ministerio_id: ministryId,
                    nome: h.nome.trim() || "(nome não informado)",
                    gestao: h.gestao.trim() || "(gestão não informada)",
                    ordem: i,
                }))
            );
        }

        setIsDialogOpen(false);
        setEditingMinistry(null);
        setCoordinatorHistory([]);
        fetchMinisterios();
        setIsSubmitting(false);
    }

    async function deleteMinistry(id: number) {
        if (!confirm("Confirmar exclusão deste ministério?")) return;
        const { error } = await supabase.from("ministerios").delete().eq("id", id);
        if (error) alert("Erro ao deletar: " + error.message);
        else fetchMinisterios();
    }

    const openEdit = async (ministry: any) => {
        setEditingMinistry(ministry);
        setFormData(ministry);
        const history = await fetchCoordinatorHistory(ministry.id);
        setCoordinatorHistory(history);
        setIsDialogOpen(true);
    };

    const openNew = () => {
        setEditingMinistry(null);
        setFormData({});
        setCoordinatorHistory([]);
        setIsDialogOpen(true);
    };

    const filteredMinisterios = ministerios.filter(m =>
        m.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-brand-blue italic flex items-center gap-3">
                        <Flame className="w-8 h-8 text-brand-gold" />
                        Ministérios
                    </h1>
                    <p className="text-gray-500">Gerencie os ministérios da RCC Diocese de Sinop e seus coordenadores.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Buscar ministério..."
                            className="pl-10 rounded-xl w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setEditingMinistry(null);
                    }}>
                        <DialogTrigger asChild>
                            <Button onClick={openNew} className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-xl h-12">
                                <Plus className="w-5 h-5 mr-2" />
                                Novo Ministério
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl rounded-[2rem] max-h-[90vh] overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold italic text-brand-blue">
                                        {editingMinistry ? "Editar Ministério" : "Novo Ministério"}
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome do Ministério</label>
                                        <Input
                                            name="nome"
                                            value={formData.nome || ""}
                                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                            placeholder="Ex: Ministério de Pregação"
                                            required
                                            className="rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="descricao">Descrição / Missão</Label>
                                        <textarea
                                            id="descricao"
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Fale sobre o objetivo deste ministério..."
                                            value={formData.descricao || ""}
                                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Coordenador Atual</label>
                                        <Input name="coordenador" defaultValue={editingMinistry?.coordenador} placeholder="Nome do coordenador" className="rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gestão Atual (Biénio)</label>
                                        <Input name="bienio" defaultValue={editingMinistry?.bienio} placeholder="Ex: 2025-2026" className="rounded-xl" />
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="imagem_url">URL da Foto / Banner</Label>
                                        <Input
                                            id="imagem_url"
                                            placeholder="https://exemplo.com/foto.jpg"
                                            value={formData.imagem_url || ""}
                                            onChange={(e) => setFormData({ ...formData, imagem_url: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estilo Visual (Classes CSS)</label>
                                        <Input name="cor" defaultValue={editingMinistry?.cor || "bg-blue-100 text-blue-600"} placeholder="bg-blue-100 text-blue-600" className="rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ordem de Exibição</label>
                                        <Input name="ordem" type="number" defaultValue={editingMinistry?.ordem || 0} required className="rounded-xl" />
                                    </div>
                                </div>

                                {/* Histórico de coordenadores por gestão */}
                                <div className="space-y-3 col-span-2 border-t pt-6">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <History className="w-4 h-4 text-brand-blue" />
                                            Histórico de coordenadores (Ano a Ano)
                                        </label>
                                        <Button type="button" variant="outline" size="sm" onClick={addCoordinatorHistoryRow} className="rounded-xl">
                                            <Plus className="w-4 h-4 mr-1" />
                                            Adicionar gestão
                                        </Button>
                                    </div>
                                    {coordinatorHistory.length === 0 ? (
                                        <p className="text-sm text-gray-400 italic py-2">Nenhum registro histórico.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {coordinatorHistory.map((row, index) => (
                                                <div key={index} className="flex gap-2 items-center rounded-xl border bg-gray-50/50 p-2">
                                                    <Input
                                                        placeholder="Nome do coordenador"
                                                        value={row.nome}
                                                        onChange={(e) => updateCoordinatorHistoryRow(index, "nome", e.target.value)}
                                                        className="rounded-lg flex-1"
                                                    />
                                                    <Input
                                                        placeholder="Gestão (ex: 2020-2022)"
                                                        value={row.gestao}
                                                        onChange={(e) => updateCoordinatorHistoryRow(index, "gestao", e.target.value)}
                                                        className="rounded-lg w-36"
                                                    />
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCoordinatorHistoryRow(index)} className="text-gray-400 hover:text-red-500 shrink-0">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <DialogFooter className="sticky bottom-0 bg-white pt-4">
                                    <Button type="submit" className="bg-brand-blue text-white w-full rounded-xl" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Ministério"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="w-12 h-12 animate-spin mb-4 text-brand-gold" />
                        <p className="font-bold italic">Carregando ministérios...</p>
                    </div>
                ) : filteredMinisterios.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-[3rem]">
                        <XCircle className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-xl font-bold italic text-brand-blue">Nenhum ministério encontrado.</p>
                    </div>
                ) : (
                    filteredMinisterios.map((ministry) => (
                        <Card key={ministry.id} className="group overflow-hidden rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all bg-white p-6">
                            <CardContent className="p-0 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className={`p-3 rounded-2xl ${ministry.cor || "bg-brand-blue/5 text-brand-blue"}`}>
                                        <Flame className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(ministry)} className="text-gray-400 hover:text-brand-blue rounded-xl">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteMinistry(ministry.id)} className="text-gray-400 hover:text-red-500 rounded-xl">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-brand-blue italic">{ministry.nome}</h3>
                                    <p className="text-brand-gold font-medium text-sm flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {ministry.coordenador || "Não definido"}
                                    </p>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 line-clamp-2 italic">
                                    {ministry.descricao}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
