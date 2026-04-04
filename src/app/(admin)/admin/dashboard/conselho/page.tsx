"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Plus, Search, Trash2, Edit, Loader2,
    Users, Calendar, CheckCircle, XCircle
} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function ConselhoAdminPage() {
    const [activeTab, setActiveTab] = useState<"mandatos" | "membros">("mandatos");
    const [isLoading, setIsLoading] = useState(true);
    const [mandatos, setMandatos] = useState<any[]>([]);
    const [membros, setMembros] = useState<any[]>([]);
    const [grupos, setGrupos] = useState<any[]>([]);
    const [selectedMandato, setSelectedMandato] = useState<string | null>(null);

    // Dialog States
    const [isMandatoDialogOpen, setIsMandatoDialogOpen] = useState(false);
    const [isMembroDialogOpen, setIsMembroDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchMandatos();
    }, []);

    useEffect(() => {
        if (selectedMandato) {
            fetchMembros(selectedMandato);
            fetchGrupos(selectedMandato);
        } else {
            setMembros([]);
            setGrupos([]);
        }
    }, [selectedMandato]);

    async function fetchMandatos() {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("conselho_mandatos")
            .select("*")
            .order("ano_inicio", { ascending: false });

        if (error) console.error("Erro ao buscar mandatos:", error);
        else {
            setMandatos(data || []);
            // Select the first one by default if none selected
            if (!selectedMandato && data && data.length > 0) {
                setSelectedMandato(String(data[0].id));
            }
        }
        setIsLoading(false);
    }

    async function fetchMembros(mandatoId: string) {
        if (!mandatoId) return;
        const { data, error } = await supabase
            .from("conselho_membros")
            .select("*")
            .eq("mandato_id", mandatoId)
            .order("categoria", { ascending: false }) // presidencia first usually
            .order("ordem", { ascending: true });

        if (error) console.error("Erro ao buscar membros:", error);
        else setMembros(data || []);
    }

    async function fetchGrupos(mandatoId: string) {
        if (!mandatoId) return;
        const { data, error } = await supabase
            .from("groups")
            .select("id, nome, coordenador, coordenador_foto_url")
            .eq("mandato_id", mandatoId)
            .order("nome", { ascending: true });

        if (error) console.error("Erro ao buscar grupos do mandato:", error);
        else setGrupos(data || []);
    }

    // --- MANDATO ACTIONS ---
    async function handleMandatoSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        const data = {
            titulo: formData.titulo,
            ano_inicio: parseInt(formData.ano_inicio),
            ano_fim: parseInt(formData.ano_fim),
            ativo: formData.ativo || false
        };

        if (data.ativo) {
            // Deactivate others if this one is active
            await supabase.from("conselho_mandatos").update({ ativo: false }).neq("id", 0);
        }

        let error;
        if (editingItem) {
            const res = await supabase.from("conselho_mandatos").update(data).eq("id", editingItem.id);
            error = res.error;
        } else {
            const res = await supabase.from("conselho_mandatos").insert([data]);
            error = res.error;
        }

        if (error) alert("Erro: " + error.message);
        else {
            setIsMandatoDialogOpen(false);
            fetchMandatos();
        }
        setIsSubmitting(false);
    }

    async function deleteMandato(id: number) {
        if (!confirm("Tem certeza? Isso apagará todos os membros deste mandato também.")) return;
        await supabase.from("conselho_mandatos").delete().eq("id", id);
        fetchMandatos();
    }

    // --- MEMBRO ACTIONS ---
    async function handleMembroSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        const data = {
            mandato_id: parseInt(selectedMandato!),
            nome: formData.nome,
            cargo: formData.cargo,
            foto_url: formData.foto_url,
            categoria: formData.categoria || "presidencia",
            ordem: parseInt(formData.ordem || "0")
        };

        let error;
        if (editingItem) {
            const res = await supabase.from("conselho_membros").update(data).eq("id", editingItem.id);
            error = res.error;
        } else {
            const res = await supabase.from("conselho_membros").insert([data]);
            error = res.error;
        }

        if (error) alert("Erro: " + error.message);
        else {
            setIsMembroDialogOpen(false);
            fetchMembros(selectedMandato!);
        }
        setIsSubmitting(false);
    }

    async function deleteMembro(id: number) {
        if (!confirm("Excluir membro?")) return;
        await supabase.from("conselho_membros").delete().eq("id", id);
        fetchMembros(selectedMandato!);
    }

    // --- HELPER UI ---
    const openMandatoDialog = (item: any = null) => {
        setEditingItem(item);
        setFormData(item || { ativo: false });
        setIsMandatoDialogOpen(true);
    };

    const openMembroDialog = (item: any = null) => {
        setEditingItem(item);
        setFormData(item || { categoria: "presidencia", ordem: 0 });
        setIsMembroDialogOpen(true);
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-brand-blue italic flex items-center gap-3">
                    <Users className="w-8 h-8 text-brand-gold" />
                    Conselho Diocesano
                </h1>
                <p className="text-gray-500">Gerencie a presidência e conselho fiscal (mandatos e membros).</p>
            </div>

            <div className="flex gap-4 border-b">
                <button
                    onClick={() => setActiveTab("mandatos")}
                    className={`pb-3 px-4 font-bold transition-colors border-b-2 ${activeTab === "mandatos" ? "border-brand-blue text-brand-blue" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                    Mandatos (Biênios)
                </button>
                <button
                    onClick={() => setActiveTab("membros")}
                    className={`pb-3 px-4 font-bold transition-colors border-b-2 ${activeTab === "membros" ? "border-brand-blue text-brand-blue" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                    Membros do Conselho
                </button>
            </div>

            {/* --- TAB MANDATOS --- */}
            {activeTab === "mandatos" && (
                <div className="space-y-6">
                    <Button onClick={() => openMandatoDialog()} className="bg-brand-blue text-white rounded-xl">
                        <Plus className="w-4 h-4 mr-2" /> Novo Mandato
                    </Button>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {mandatos.map(m => (
                            <Card key={m.id} className="rounded-2xl border hover:shadow-md transition-all">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-brand-blue">{m.titulo}</h3>
                                            <p className="text-sm text-gray-500">{m.ano_inicio} — {m.ano_fim}</p>
                                        </div>
                                        {m.ativo && (
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Atual
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button size="sm" variant="outline" onClick={() => openMandatoDialog(m)} className="rounded-lg h-8 px-2">
                                            <Edit className="w-4 h-4 text-gray-500" />
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => deleteMandato(m.id)} className="rounded-lg h-8 px-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Dialog open={isMandatoDialogOpen} onOpenChange={setIsMandatoDialogOpen}>
                        <DialogContent className="rounded-[2rem]">
                            <DialogHeader>
                                <DialogTitle>{editingItem ? "Editar Mandato" : "Novo Mandato"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleMandatoSubmit} className="space-y-4">
                                <div>
                                    <Label>Título (ex: Biênio 2025-2026)</Label>
                                    <Input value={formData.titulo || ""} onChange={e => setFormData({ ...formData, titulo: e.target.value })} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Ano Início</Label>
                                        <Input type="number" value={formData.ano_inicio || ""} onChange={e => setFormData({ ...formData, ano_inicio: e.target.value })} required />
                                    </div>
                                    <div>
                                        <Label>Ano Fim</Label>
                                        <Input type="number" value={formData.ano_fim || ""} onChange={e => setFormData({ ...formData, ano_fim: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="ativo"
                                        checked={formData.ativo || false}
                                        onChange={e => setFormData({ ...formData, ativo: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                    />
                                    <Label htmlFor="ativo">Definir como mandato atual do site</Label>
                                </div>
                                <Button type="submit" className="w-full bg-brand-blue text-white rounded-xl" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Salvar"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            {/* --- TAB MEMBROS --- */}
            {activeTab === "membros" && (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center bg-gray-50 p-4 rounded-2xl border">
                        <Label className="whitespace-nowrap font-bold text-gray-600">Selecione o Mandato:</Label>
                        <Select value={selectedMandato || ""} onValueChange={setSelectedMandato}>
                            <SelectTrigger className="w-full md:w-64 bg-white rounded-xl">
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {mandatos.map(m => (
                                    <SelectItem key={m.id} value={String(m.id)}>{m.titulo}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedMandato && (
                            <Button onClick={() => openMembroDialog()} className="ml-auto bg-brand-blue text-white rounded-xl">
                                <Plus className="w-4 h-4 mr-2" /> Adicionar Membro
                            </Button>
                        )}
                    </div>

                    {!selectedMandato ? (
                        <div className="text-center py-10 text-gray-400">
                            <p>Selecione um mandato acima para ver os membros.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Presidência */}
                            <div>
                                <h3 className="text-lg font-bold text-brand-blue mb-3 border-b pb-2">Presidência</h3>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {membros.filter(m => m.categoria === 'presidencia').map(m => (
                                        <MembroCard key={m.id} membro={m} onEdit={() => openMembroDialog(m)} onDelete={() => deleteMembro(m.id)} />
                                    ))}
                                </div>
                            </div>

                            {/* Conselho Fiscal */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-600 mb-3 border-b pb-2">Conselho Fiscal</h3>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {membros.filter(m => m.categoria === 'fiscal').map(m => (
                                        <MembroCard key={m.id} membro={m} onEdit={() => openMembroDialog(m)} onDelete={() => deleteMembro(m.id)} />
                                    ))}
                                </div>
                            </div>

                            {/* Coordenadores de Grupos (Automático) */}
                            <div>
                                <div className="flex items-center justify-between mb-3 border-b pb-2">
                                    <h3 className="text-lg font-bold text-brand-blue">Coordenadores de Grupos de Oração</h3>
                                    <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest bg-brand-gold/5 px-2 py-1 rounded-full border border-brand-gold/20">
                                        Automático via Módulo de Grupos
                                    </span>
                                </div>
                                {grupos.length > 0 ? (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {grupos.map(g => (
                                            <Card key={g.id} className="rounded-2xl overflow-hidden bg-brand-blue/[0.02] border-brand-blue/10">
                                                <div className="flex items-center p-3 gap-4">
                                                    <img
                                                        src={g.coordenador_foto_url || "https://ui-avatars.com/api/?name=" + (g.coordenador || "C")}
                                                        alt={g.coordenador}
                                                        className="w-16 h-16 rounded-full object-cover bg-gray-100 shadow-sm border-2 border-white"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-gray-900 truncate">{g.coordenador || "Não Informado"}</h4>
                                                        <p className="text-[10px] text-brand-gold font-black uppercase truncate tracking-widest">{g.nome}</p>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-10 text-center border-2 border-dashed rounded-2xl text-gray-400">
                                        <p className="text-sm">Nenhum grupo de oração vinculado a este biênio.</p>
                                        <p className="text-[10px] uppercase mt-1">Vá em &quot;Grupos de Oração&quot; para vincular grupos a este mandato.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <Dialog open={isMembroDialogOpen} onOpenChange={setIsMembroDialogOpen}>
                        <DialogContent className="rounded-[2rem]">
                            <DialogHeader>
                                <DialogTitle>{editingItem ? "Editar Membro" : "Novo Membro"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleMembroSubmit} className="space-y-4">
                                <div>
                                    <Label>Nome</Label>
                                    <Input value={formData.nome || ""} onChange={e => setFormData({ ...formData, nome: e.target.value })} required />
                                </div>
                                <div>
                                    <Label>Cargo (ex: Presidente do Conselho)</Label>
                                    <Input value={formData.cargo || ""} onChange={e => setFormData({ ...formData, cargo: e.target.value })} required />
                                </div>
                                <div>
                                    <Label>Foto URL</Label>
                                    <Input value={formData.foto_url || ""} onChange={e => setFormData({ ...formData, foto_url: e.target.value })} placeholder="https://..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Categoria</Label>
                                        <Select value={formData.categoria || "presidencia"} onValueChange={v => setFormData({ ...formData, categoria: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="presidencia">Presidência</SelectItem>
                                                <SelectItem value="fiscal">Conselho Fiscal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Ordem (ex: 1, 2, 3)</Label>
                                        <Input type="number" value={formData.ordem || 0} onChange={e => setFormData({ ...formData, ordem: e.target.value })} />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-brand-blue text-white rounded-xl" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Salvar"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    );
}

function MembroCard({ membro, onEdit, onDelete }: { membro: any, onEdit: () => void, onDelete: () => void }) {
    return (
        <Card className="rounded-2xl overflow-hidden hover:shadow-md transition-all">
            <div className="flex items-center p-3 gap-4">
                <img
                    src={membro.foto_url || "https://ui-avatars.com/api/?name=" + membro.nome}
                    alt={membro.nome}
                    className="w-16 h-16 rounded-full object-cover bg-gray-100"
                />
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">{membro.nome}</h4>
                    <p className="text-xs text-brand-blue font-bold uppercase truncate">{membro.cargo}</p>
                </div>
            </div>
            <div className="bg-gray-50 p-2 flex justify-end gap-2 border-t">
                <Button size="sm" variant="ghost" onClick={onEdit} className="h-8 w-8 p-0 rounded-full hover:bg-white hover:text-brand-blue">
                    <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={onDelete} className="h-8 w-8 p-0 rounded-full hover:bg-white hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </Card>
    );
}
