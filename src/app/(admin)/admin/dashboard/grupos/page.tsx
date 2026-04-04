"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Plus, Search, Trash2, Edit, Loader2,
    CheckCircle2, XCircle, Users, History,
    MapPin, Calendar, Clock, Phone, Globe,
    Facebook, Instagram, Image as ImageIcon
} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter, DialogDescription,
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
    const [selectedForania, setSelectedForania] = useState<string>("all");
    const [selectedCity, setSelectedCity] = useState<string>("all");
    const [mandatos, setMandatos] = useState<any[]>([]);
    const [foranias, setForanias] = useState<any[]>([]);
    const [coordinatorHistory, setCoordinatorHistory] = useState<{ nome: string; gestao: string; foto_url?: string; mandato_id?: string }[]>([]);

    // Page Settings State
    const [pageSettings, setPageSettings] = useState<any>({
        title: "Grupos de Oração",
        subtitle: "Encontre um Grupo de Oração da Renovação Carismática Católica mais próximo de você e venha vivenciar Pentecostes!",
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [uploadingField, setUploadingField] = useState<string | null>(null);

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>, fieldName: string, subfolder: string, callback: (url: string) => void) {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingField(fieldName);
        try {
            const publicUrl = await uploadImage(file, subfolder);
            callback(publicUrl);
        } catch (error: any) {
            alert("Erro ao fazer upload: " + error.message);
        } finally {
            setUploadingField(null);
        }
    }

    async function uploadImage(file: File, subfolder: string) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `${subfolder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from("media")
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("media").getPublicUrl(filePath);
        return data.publicUrl;
    }

    useEffect(() => {
        fetchGroups();
        fetchPageSettings();
        fetchMandatos();
        fetchForanias();
    }, []);

    async function fetchForanias() {
        const { data, error } = await supabase
            .from("foranias")
            .select("*")
            .order("nome", { ascending: true });
        if (data) setForanias(data);
    }

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
            logo_url: formData.logo_url,
            coordenador_foto_url: formData.coordenador_foto_url,
            mandato_id: formData.mandato_id ? parseInt(formData.mandato_id) : null,
            forania_id: formData.forania_id || null,
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

    const cities = Array.from(new Set(groups.map(g => g.cidade))).sort();

    const filteredGroups = groups.filter(g => {
        const matchesSearch = g.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.cidade.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesForania = selectedForania === "all" || String(g.forania_id) === selectedForania;
        const matchesCity = selectedCity === "all" || g.cidade === selectedCity;
        return matchesSearch && matchesForania && matchesCity;
    });

    // Grouping logic for the list
    const groupsByForania: Record<string, any[]> = {};
    filteredGroups.forEach(group => {
        const foraniaName = foranias.find(f => f.id === group.forania_id)?.nome || "Sem Forania";
        if (!groupsByForania[foraniaName]) groupsByForania[foraniaName] = [];
        groupsByForania[foraniaName].push(group);
    });

    const foraniaNames = Object.keys(groupsByForania).sort((a, b) => {
        if (a === "Sem Forania") return 1;
        if (b === "Sem Forania") return -1;
        return a.localeCompare(b);
    });

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
                            placeholder="Buscar grupo..."
                            className="pl-10 rounded-xl w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={selectedForania} onValueChange={setSelectedForania}>
                        <SelectTrigger className="w-48 rounded-xl h-12 bg-white">
                            <SelectValue placeholder="Todas as Foranias" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Foranias</SelectItem>
                            {foranias.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.nome}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger className="w-48 rounded-xl h-12 bg-white">
                            <SelectValue placeholder="Todas as Cidades" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Cidades</SelectItem>
                            {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
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
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="imagem" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Banner do Grupo (Fundo do Modal)</Label>
                                                    <p className="text-[9px] text-brand-blue/60 mt-[-8px] px-1 font-medium italic">Recomendado: 1920x250px (panorâmico)</p>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="imagem"
                                                            placeholder="https://exemplo.com/banner.jpg"
                                                            value={formData.imagem || ""}
                                                            onChange={(e) => setFormData({ ...formData, imagem: e.target.value })}
                                                            className="rounded-xl"
                                                        />
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                id="upload-group-img"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => handleFileChange(e, 'group-img', 'grupos', (url) => setFormData({ ...formData, imagem: url }))}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => document.getElementById('upload-group-img')?.click()}
                                                                disabled={uploadingField === 'group-img'}
                                                                className="rounded-xl border-brand-blue text-brand-blue hover:bg-brand-blue/10 h-10 px-3"
                                                            >
                                                                {uploadingField === 'group-img' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="logo_url" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Logotipo do Grupo</Label>
                                                    <p className="text-[9px] text-brand-blue/60 mt-[-8px] px-1 font-medium italic">Recomendado: 512x512px (quadrado, PNG transparente)</p>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="logo_url"
                                                            placeholder="https://exemplo.com/logo.png"
                                                            value={formData.logo_url || ""}
                                                            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                                            className="rounded-xl"
                                                        />
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                id="upload-group-logo"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => handleFileChange(e, 'group-logo', 'grupos', (url) => setFormData({ ...formData, logo_url: url }))}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => document.getElementById('upload-group-logo')?.click()}
                                                                disabled={uploadingField === 'group-logo'}
                                                                className="rounded-xl border-brand-blue text-brand-blue hover:bg-brand-blue/10 h-10 px-3"
                                                            >
                                                                {uploadingField === 'group-logo' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {(formData.imagem || formData.logo_url) && (
                                                <div className="mt-2 flex gap-4">
                                                    {formData.imagem && (
                                                        <div className="flex-1">
                                                            <p className="text-[9px] uppercase font-bold text-gray-400 mb-1">Preview Banner</p>
                                                            <div className="relative h-24 w-full rounded-xl overflow-hidden bg-slate-100 border">
                                                                <img src={formData.imagem} alt="Banner Preview" className="w-full h-full object-cover" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {formData.logo_url && (
                                                        <div className="w-24">
                                                            <p className="text-[9px] uppercase font-bold text-gray-400 mb-1">Preview Logo</p>
                                                            <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-slate-100 border flex items-center justify-center p-2">
                                                                <img src={formData.logo_url} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}


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
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={formData.coordenador_foto_url || ""}
                                                        onChange={(e) => setFormData({ ...formData, coordenador_foto_url: e.target.value })}
                                                        placeholder="https://..."
                                                        className="rounded-xl"
                                                    />
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            id="upload-coord-photo"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileChange(e, 'coord-photo', 'coordenadores', (url) => setFormData({ ...formData, coordenador_foto_url: url }))}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => document.getElementById('upload-coord-photo')?.click()}
                                                            disabled={uploadingField === 'coord-photo'}
                                                            className="rounded-xl border-brand-blue text-brand-blue hover:bg-brand-blue/10 h-10 px-3"
                                                        >
                                                            {uploadingField === 'coord-photo' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                                        </Button>
                                                    </div>
                                                </div>
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
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-[#003366]">Forania</label>
                                                <Select
                                                    value={formData.forania_id || ""}
                                                    onValueChange={(v) => setFormData({ ...formData, forania_id: v })}
                                                >
                                                    <SelectTrigger className="rounded-xl border-gray-200">
                                                        <SelectValue placeholder="Selecione a forania..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {foranias.map((f) => (
                                                            <SelectItem key={f.id} value={f.id}>
                                                                {f.nome}
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
                                                <div className="space-y-4">
                                                    {coordinatorHistory.map((row, index) => (
                                                        <div key={index} className="relative space-y-4 rounded-[1.5rem] border bg-gray-50/50 p-6 pt-10">
                                                            <Button 
                                                                type="button" 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => removeCoordinatorHistoryRow(index)} 
                                                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 rounded-full h-8 w-8"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>

                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Nome do Coordenador</label>
                                                                <Input
                                                                    placeholder="Ex: João da Silva"
                                                                    value={row.nome}
                                                                    onChange={(e) => updateCoordinatorHistoryRow(index, "nome", e.target.value)}
                                                                    className="rounded-xl h-11"
                                                                />
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Anos da Gestão</label>
                                                                    <Input
                                                                        placeholder="Ex: 2022-2024"
                                                                        value={row.gestao}
                                                                        onChange={(e) => updateCoordinatorHistoryRow(index, "gestao", e.target.value)}
                                                                        className="rounded-xl h-11"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Biênio Vinculado</label>
                                                                    <Select
                                                                        value={row.mandato_id || ""}
                                                                        onValueChange={(v) => updateCoordinatorHistoryRow(index, "mandato_id", v)}
                                                                    >
                                                                        <SelectTrigger className="rounded-xl h-11 border-gray-200">
                                                                            <SelectValue placeholder="Selecione..." />
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

                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">URL da Foto do Coordenador</label>
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        placeholder="https://exemplo.com/foto.jpg"
                                                                        value={row.foto_url}
                                                                        onChange={(e) => updateCoordinatorHistoryRow(index, "foto_url", e.target.value)}
                                                                        className="rounded-xl h-11"
                                                                    />
                                                                    <div className="relative">
                                                                        <input
                                                                            type="file"
                                                                            id={`upload-history-${index}`}
                                                                            className="hidden"
                                                                            accept="image/*"
                                                                            onChange={(e) => handleFileChange(e, `history-${index}`, 'coordenadores', (url) => updateCoordinatorHistoryRow(index, "foto_url", url))}
                                                                        />
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            onClick={() => document.getElementById(`upload-history-${index}`)?.click()}
                                                                            disabled={uploadingField === `history-${index}`}
                                                                            className="rounded-xl border-brand-blue text-brand-blue hover:bg-brand-blue/10 h-11 px-3"
                                                                        >
                                                                            {uploadingField === `history-${index}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
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
                <CardHeader className="bg-gray-50/50 p-8 border-b border-gray-100 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold italic text-brand-blue flex items-center gap-2">
                            <Globe className="w-5 h-5 text-brand-gold" />
                            Configurações da Página Pública
                        </CardTitle>
                        <CardDescription>Configure como a página de grupos aparece para os visitantes.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSaveSettings} className="grid md:grid-cols-2 gap-8 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-gray-500 font-bold uppercase text-[10px] tracking-widest px-1">Título da Página</Label>
                            <Input id="title" name="title" defaultValue={pageSettings.title} className="rounded-xl border-gray-100 bg-gray-50/50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image_url" className="text-gray-500 font-bold uppercase text-[10px] tracking-widest px-1">Imagem de Fundo (URL)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="image_url"
                                    name="image_url"
                                    value={pageSettings.image_url}
                                    onChange={(e) => setPageSettings({ ...pageSettings, image_url: e.target.value })}
                                    className="rounded-xl border-gray-100 bg-gray-50/50"
                                />
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="upload-page-bg"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'page-bg', 'paginas', (url) => setPageSettings({ ...pageSettings, image_url: url }))}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('upload-page-bg')?.click()}
                                        disabled={uploadingField === 'page-bg'}
                                        className="rounded-xl border-brand-blue text-brand-blue hover:bg-brand-blue/10 h-10 px-3"
                                    >
                                        {uploadingField === 'page-bg' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="subtitle" className="text-gray-500 font-bold uppercase text-[10px] tracking-widest px-1">Subtítulo / Descrição</Label>
                            <Input id="subtitle" name="subtitle" defaultValue={pageSettings.subtitle} className="rounded-xl border-gray-100 bg-gray-50/50 h-12" />
                        </div>
                        <div className="md:col-span-2 flex justify-end pt-4">
                            <Button type="submit" disabled={isSavingSettings} className="bg-brand-gold hover:bg-brand-gold/90 text-brand-blue font-bold rounded-xl h-12 px-8 shadow-sm">
                                {isSavingSettings ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                                ) : (
                                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Salvar Alterações</>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-12 pb-20">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="w-12 h-12 animate-spin mb-4 text-brand-gold" />
                        <p className="font-bold italic">Carregando grupos...</p>
                    </div>
                ) : foraniaNames.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-[3rem]">
                        <XCircle className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-xl font-bold italic text-brand-blue">Nenhum grupo encontrado.</p>
                    </div>
                ) : (
                    foraniaNames.map((foraniaName) => (
                        <div key={foraniaName} className="space-y-6">
                            <div className="flex items-center gap-4 px-2">
                                <h2 className="text-xl font-black text-brand-blue italic uppercase tracking-tight flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-brand-gold rounded-full" />
                                    {foraniaName}
                                </h2>
                                <div className="h-[1px] bg-brand-blue/5 flex-1" />
                                <span className="text-[9px] font-bold text-gray-400 bg-gray-100/50 px-3 py-1 rounded-full border border-gray-100">
                                    {groupsByForania[foraniaName].length} {groupsByForania[foraniaName].length === 1 ? "Grupo" : "Grupos"}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groupsByForania[foraniaName].map((group) => (
                                    <GroupAdminCard key={group.id} group={group} foranias={foranias} openEdit={openEdit} deleteGroup={deleteGroup} />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function GroupAdminCard({ group, foranias, openEdit, deleteGroup }: any) {
    return (
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
                    <div className="flex flex-wrap gap-2 mt-1">
                        <p className="text-brand-gold font-medium text-xs flex items-center gap-1 bg-brand-gold/5 px-2 py-1 rounded-lg">
                            <MapPin className="w-3 h-3" /> {group.cidade}
                        </p>
                        {group.forania_id && (
                            <p className="text-brand-blue font-medium text-xs flex items-center gap-1 bg-brand-blue/5 px-2 py-1 rounded-lg">
                                <Globe className="w-3 h-3" /> {foranias.find((f: any) => f.id === group.forania_id)?.nome || "Forania carregando..."}
                            </p>
                        )}
                    </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-blue/40" />
                        <span>{group.dia}</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-brand-blue/40 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{group.local}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
