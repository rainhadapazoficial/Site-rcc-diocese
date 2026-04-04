"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
    Plus, Search, Trash2, Edit, Loader2,
    CheckCircle2, XCircle, Users, History,
    MapPin, Calendar, Clock, Phone, Globe, Facebook, Instagram
} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function GruposAdminPage() {
    const [groups, setGroups] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [mandatos, setMandatos] = useState<any[]>([]);
    const [coordinatorHistory, setCoordinatorHistory] = useState<{ nome: string; gestao: string; foto_url?: string; mandato_id?: string }[]>([]);

    // Page Settings State
    const [pageSettings, setPageSettings] = useState<any>({
        title: "Grupos de Oração",
        subtitle: "Encontre um Grupo de Oração da Renovação Carismática Católica mais próximo de você e venha vivenciar Pentecostes!",
        image_url: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=2000&auto=format&fit=crop"
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    useEffect(() => {
        fetchGroups();
        fetchPageSettings();
        fetchMandatos();
    }, []);

    async function fetchMandatos() {
        const { data, error } = await supabase
            .from("conselho_mandatos")
            .select("*")
            .order("ano_inicio", { ascending: false });
        if (data) setMandatos(data);
    }

    async function fetchPageSettings() {
        const { data, error } = await supabase
            .from("site_settings")
            .select("value")
            .eq("key", "groups_page")
            .single();

        if (data) setPageSettings(data.value);
    }

    async function handleSaveSettings(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSavingSettings(true);
        const formData = new FormData(e.currentTarget);
        const newSettings = {
            title: formData.get("title"),
            subtitle: formData.get("subtitle"),
            image_url: formData.get("image_url"),
        };

        const { error } = await supabase
            .from("site_settings")
            .upsert({ key: "groups_page", value: newSettings });

        if (error) alert("Erro ao salvar configurações: " + error.message);
        else {
            setPageSettings(newSettings);
            alert("Configurações salvas com sucesso!");
        }
        setIsSavingSettings(false);
    }

    async function fetchGroups() {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("groups")
            .select("*")
            .order("nome", { ascending: true });

        if (error) console.error("Error fetching groups:", error);
        else setGroups(data || []);
        setIsLoading(false);
    }

    async function fetchCoordinatorHistory(groupId: number) {
        const { data, error } = await supabase
            .from("group_coordinator_history")
            .select("id, nome, gestao, foto_url, mandato_id, ordem")
            .eq("group_id", groupId)
            .order("ordem", { ascending: true });
        if (error) {
            console.error("Error fetching coordinator history:", error);
            return [];
        }
        return (data || []).map((r: any) => ({
            nome: r.nome,
            gestao: r.gestao,
            foto_url: r.foto_url || "",
            mandato_id: r.mandato_id ? String(r.mandato_id) : ""
        }));
    }

    function addCoordinatorHistoryRow() {
        setCoordinatorHistory((prev) => [...prev, { nome: "", gestao: "", foto_url: "", mandato_id: "" }]);
    }

    function updateCoordinatorHistoryRow(index: number, field: string, value: string) {
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
        const groupData = {
            nome: formValues.get("nome"),
            dia: formValues.get("dia"),
            local: formValues.get("local"),
            cidade: formValues.get("cidade"),
            geolocalizacao: formValues.get("geolocalizacao"),
            coordenador: formValues.get("coordenador"),
            whatsapp: formValues.get("whatsapp"),
            site: formValues.get("site"),
            facebook: formValues.get("facebook"),
            instagram: formValues.get("instagram"),
            descricao: formData.descricao,
            imagem: formData.imagem,
            coordenador_foto_url: formData.coordenador_foto_url,
            mandato_id: formData.mandato_id ? parseInt(formData.mandato_id) : null,
            slug: (formValues.get("nome") as string).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "-").replace(/[^\w-]+/g, ""),
        };

        let groupId: number;
        if (editingGroup) {
            const result = await supabase.from("groups").update(groupData).eq("id", editingGroup.id).select("id").single();
            if (result.error) {
                alert("Erro ao salvar grupo: " + result.error.message);
                setIsSubmitting(false);
                return;
            }
            groupId = result.data.id;
        } else {
            const result = await supabase.from("groups").insert([groupData]).select("id").single();
            if (result.error) {
                alert("Erro ao salvar grupo: " + result.error.message);
                setIsSubmitting(false);
                return;
            }
            groupId = result.data.id;
        }

        await supabase.from("group_coordinator_history").delete().eq("group_id", groupId);
        const validHistory = coordinatorHistory.filter((h) => h.nome.trim() || h.gestao.trim());
        if (validHistory.length > 0) {
            await supabase.from("group_coordinator_history").insert(
                validHistory.map((h: any, i: number) => ({
                    group_id: groupId,
                    nome: h.nome.trim() || "(nome não informado)",
                    gestao: h.gestao.trim() || "(gestão não informada)",
                    foto_url: h.foto_url || null,
                    mandato_id: h.mandato_id ? parseInt(h.mandato_id) : null,
                    ordem: i,
                }))
            );
        }

        setIsDialogOpen(false);
        setEditingGroup(null);
        setCoordinatorHistory([]);
        fetchGroups();
        setIsSubmitting(false);
    }

    async function deleteGroup(id: number) {
        if (!confirm("Confirmar exclusão deste grupo?")) return;
        const { error } = await supabase.from("groups").delete().eq("id", id);
        if (error) alert("Erro ao deletar: " + error.message);
        else fetchGroups();
    }

    const openEdit = async (group: any) => {
        setEditingGroup(group);
        setFormData(group);
        const history = await fetchCoordinatorHistory(group.id);
        setCoordinatorHistory(history);
        setIsDialogOpen(true);
    };

    const openNew = () => {
        setEditingGroup(null);
        setFormData({});
        setCoordinatorHistory([]);
        setIsDialogOpen(true);
    };

    const filteredGroups = groups.filter(g =>
        g.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.cidade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-brand-blue italic flex items-center gap-3">
                        <Users className="w-8 h-8 text-brand-gold" />
                        Grupos de Oração
                    </h1>
                    <p className="text-gray-500">Gerencie os grupos de oração da RCC Diocese de Sinop.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Buscar grupo ou cidade..."
                            className="pl-10 rounded-xl w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setEditingGroup(null);
                    }}>
                        <DialogTrigger asChild>
                            <Button onClick={openNew} className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-xl h-12">
                                <Plus className="w-5 h-5 mr-2" />
                                Novo Grupo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl rounded-[2rem] p-0 overflow-hidden bg-white">
                            <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
                                <DialogHeader className="p-8 pb-0">
                                    <DialogTitle className="text-xl font-bold italic text-brand-blue">
                                        {editingGroup ? "Editar Grupo" : "Novo Grupo de Oração"}
                                    </DialogTitle>
                                </DialogHeader>

                                <ScrollArea className="flex-1 overflow-y-auto p-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="imagem">URL da Imagem (Opcional)</Label>
                                            <Input
                                                id="imagem"
                                                placeholder="https://exemplo.com/foto.jpg"
                                                value={formData.imagem || ""}
                                                onChange={(e) => setFormData({ ...formData, imagem: e.target.value })}
                                            />
                                            {formData.imagem && (
                                                <div className="mt-2 relative h-32 w-full rounded-md overflow-hidden bg-slate-100 border">
                                                    <img src={formData.imagem} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=Erro+Imagem")} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="descricao">Descrição do Grupo</Label>
                                            <textarea
                                                id="descricao"
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Fale um pouco sobre o carisma do grupo, atividades..."
                                                value={formData.descricao || ""}
                                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome do Grupo</label>
                                                <Input
                                                    name="nome"
                                                    value={formData.nome || ""}
                                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                                    placeholder="Ex: Grupo de Sinop"
                                                    required
                                                    className="rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dia e Horário</label>
                                                <Input name="dia" defaultValue={editingGroup?.dia} placeholder="Ex: Terça-feira, 19:30" required className="rounded-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cidade</label>
                                                <Input name="cidade" defaultValue={editingGroup?.cidade} placeholder="Ex: Sinop" required className="rounded-xl" />
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Local</label>
                                                <Input name="local" defaultValue={editingGroup?.local} placeholder="Ex: Paróquia Santo Antônio" required className="rounded-xl" />
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Geolocalização (Link Google Maps)</label>
                                                <Input name="geolocalizacao" defaultValue={editingGroup?.geolocalizacao} placeholder="Link do Google Maps" className="rounded-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Coordenador Atual</label>
                                                <Input name="coordenador" defaultValue={editingGroup?.coordenador} placeholder="Nome do coord." className="rounded-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Foto do Coordenador (URL)</label>
                                                <Input
                                                    value={formData.coordenador_foto_url || ""}
                                                    onChange={(e) => setFormData({ ...formData, coordenador_foto_url: e.target.value })}
                                                    placeholder="https://..."
                                                    className="rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Biênio / Mandato Atual</label>
                                                <Select
                                                    value={formData.mandato_id ? String(formData.mandato_id) : ""}
                                                    onValueChange={(v) => setFormData({ ...formData, mandato_id: v })}
                                                >
                                                    <SelectTrigger className="rounded-xl">
                                                        <SelectValue placeholder="Selecione o biênio..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {mandatos.map((m) => (
                                                            <SelectItem key={m.id} value={String(m.id)}>
                                                                {m.titulo} {m.ativo ? "(Atual)" : ""}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp Link</label>
                                                <Input name="whatsapp" defaultValue={editingGroup?.whatsapp} placeholder="https://wa.me/..." className="rounded-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Facebook Link</label>
                                                <Input name="facebook" defaultValue={editingGroup?.facebook} placeholder="Link do Facebook" className="rounded-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instagram Link</label>
                                                <Input name="instagram" defaultValue={editingGroup?.instagram} placeholder="Link do Instagram" className="rounded-xl" />
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Site</label>
                                                <Input
                                                    name="site"
                                                    value={formData.site || ""}
                                                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                                                    placeholder="Link do Site"
                                                    className="rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        {/* Histórico de coordenadores por gestão */}
                                        <div className="space-y-3 col-span-2 border-t pt-6">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <History className="w-4 h-4 text-brand-blue" />
                                                    Histórico de coordenadores por gestão
                                                </label>
                                                <Button type="button" variant="outline" size="sm" onClick={addCoordinatorHistoryRow} className="rounded-xl">
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    Adicionar gestão
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Registre coordenadores anteriores com o período da gestão (ex: 2020-2022, 2022-2024). A primeira linha pode ser a gestão atual.
                                            </p>
                                            {coordinatorHistory.length === 0 ? (
                                                <p className="text-sm text-gray-400 italic py-2">Nenhum registro. Clique em &quot;Adicionar gestão&quot; para incluir.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {coordinatorHistory.map((row, index) => (
                                                        <div key={index} className="flex gap-2 items-center rounded-xl border bg-gray-50/50 p-2">
                                                                <div className="flex flex-col flex-1 gap-2">
                                                                    <Input
                                                                        placeholder="Nome do coordenador"
                                                                        value={row.nome}
                                                                        onChange={(e) => updateCoordinatorHistoryRow(index, "nome", e.target.value)}
                                                                        className="rounded-lg w-full"
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <Input
                                                                            placeholder="URL da Foto"
                                                                            value={row.foto_url}
                                                                            onChange={(e) => updateCoordinatorHistoryRow(index, "foto_url", e.target.value)}
                                                                            className="rounded-lg flex-1"
                                                                        />
                                                                        <Select
                                                                            value={row.mandato_id || ""}
                                                                            onValueChange={(v) => updateCoordinatorHistoryRow(index, "mandato_id", v)}
                                                                        >
                                                                            <SelectTrigger className="rounded-lg w-40 h-10 border-gray-200">
                                                                                <SelectValue placeholder="Biênio" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {mandatos.map((m) => (
                                                                                    <SelectItem key={m.id} value={String(m.id)}>
                                                                                        {m.titulo}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                </div>
                                                                <Input
                                                                    placeholder="Gestão"
                                                                    value={row.gestao}
                                                                    onChange={(e) => updateCoordinatorHistoryRow(index, "gestao", e.target.value)}
                                                                    className="rounded-lg w-32"
                                                                />
                                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeCoordinatorHistoryRow(index)} className="text-gray-400 hover:text-red-500 shrink-0">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </ScrollArea>

                                <DialogFooter className="p-8 pt-0 mt-4">
                                    <Button type="submit" className="bg-brand-blue text-white w-full rounded-xl" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Grupo"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Page Settings Section */}
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-8">
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold italic text-brand-blue flex items-center gap-2">
                                <Globe className="w-5 h-5 text-brand-gold" />
                                Configurações da Página Pública
                            </h2>
                            <Button type="submit" disabled={isSavingSettings} className="bg-brand-gold hover:bg-brand-gold/90 text-brand-blue font-bold rounded-xl h-10 px-6">
                                {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Alterações"}
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Título da Página</label>
                                <Input name="title" defaultValue={pageSettings.title} placeholder="Ex: Grupos de Oração" required className="rounded-xl border-gray-100" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Imagem de Fundo (URL)</label>
                                <Input name="image_url" defaultValue={pageSettings.image_url} placeholder="https://..." required className="rounded-xl border-gray-100" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subtítulo / Descrição</label>
                                <Input name="subtitle" defaultValue={pageSettings.subtitle} placeholder="Uma breve descrição..." required className="rounded-xl border-gray-100" />
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="w-12 h-12 animate-spin mb-4 text-brand-gold" />
                        <p className="font-bold italic">Carregando grupos...</p>
                    </div>
                ) : filteredGroups.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-[3rem]">
                        <XCircle className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-xl font-bold italic text-brand-blue">Nenhum grupo encontrado.</p>
                    </div>
                ) : (
                    filteredGroups.map((group) => (
                        <Card key={group.id} className="group overflow-hidden rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all bg-white p-6">
                            <CardContent className="p-0 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-brand-blue/5 rounded-2xl">
                                        <Users className="w-6 h-6 text-brand-blue" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(group)} className="text-gray-400 hover:text-brand-blue rounded-xl">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteGroup(group.id)} className="text-gray-400 hover:text-red-500 rounded-xl">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-brand-blue italic">{group.nome}</h3>
                                    <p className="text-brand-gold font-medium text-sm flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {group.cidade}
                                    </p>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-brand-blue/40" />
                                        <span>{group.dia}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-brand-blue/40 shrink-0 mt-0.5" />
                                        <span>{group.local}</span>
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
