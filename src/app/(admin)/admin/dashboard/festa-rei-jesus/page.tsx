"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Plus, Search, Trash2, Edit, Loader2,
    XCircle, Calendar,
    MapPin, ImageIcon, Star, UserPlus
} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface Atracao {
    nome: string;
    descricao: string;
    foto_url: string;
}

export default function FestaReiJesusAdminPage() {
    const [editions, setEditions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEdition, setEditingEdition] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [atracoes, setAtracoes] = useState<Atracao[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchEditions();
    }, []);

    async function fetchEditions() {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("festa_rei_jesus_editions")
            .select("*")
            .order("ano", { ascending: false });

        if (error) console.error("Error fetching editions:", error);
        else setEditions(data || []);
        setIsLoading(false);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);

        const formValues = new FormData(e.currentTarget);
        const editionData = {
            ano: parseInt(formValues.get("ano") as string),
            tema: formValues.get("tema"),
            local: formValues.get("local"),
            data_inicio: formValues.get("data_inicio") || null,
            data_fim: formValues.get("data_fim") || null,
            descricao: formData.descricao,
            imagem_url: formData.imagem_url,
            atracoes: atracoes,
        };

        let result;
        if (editingEdition) {
            result = await supabase
                .from("festa_rei_jesus_editions")
                .update(editionData)
                .eq("id", editingEdition.id);
        } else {
            result = await supabase
                .from("festa_rei_jesus_editions")
                .insert([editionData]);
        }

        if (result.error) {
            alert("Erro ao salvar edição: " + result.error.message);
        } else {
            setIsDialogOpen(false);
            setEditingEdition(null);
            setFormData({});
            setAtracoes([]);
            fetchEditions();
        }
        setIsSubmitting(false);
    }

    async function deleteEdition(id: number) {
        if (!confirm("Confirmar exclusão desta edição?")) return;
        const { error } = await supabase.from("festa_rei_jesus_editions").delete().eq("id", id);
        if (error) alert("Erro ao deletar: " + error.message);
        else fetchEditions();
    }

    const openEdit = (edition: any) => {
        setEditingEdition(edition);
        setFormData(edition);
        setAtracoes(edition.atracoes || []);
        setIsDialogOpen(true);
    };

    const openNew = () => {
        setEditingEdition(null);
        setFormData({});
        setAtracoes([]);
        setIsDialogOpen(true);
    };

    const addAtracao = () => {
        setAtracoes([...atracoes, { nome: "", descricao: "", foto_url: "" }]);
    };

    const updateAtracao = (index: number, field: keyof Atracao, value: string) => {
        const updated = [...atracoes];
        updated[index] = { ...updated[index], [field]: value };
        setAtracoes(updated);
    };

    const removeAtracao = (index: number) => {
        setAtracoes(atracoes.filter((_, i) => i !== index));
    };

    const filteredEditions = editions.filter((e: any) =>
        e.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.ano.toString().includes(searchTerm)
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-brand-blue italic flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-brand-gold" />
                        Histórico Festa do Rei Jesus
                    </h1>
                    <div className="flex items-center gap-4 mt-1">
                        <p className="text-gray-500">Gerencie as edições passadas e futuras do evento.</p>
                        <span className="text-gray-300">|</span>
                        <Link
                            href="/admin/dashboard/paginas"
                            className="text-brand-blue font-bold text-sm hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full border border-blue-100"
                        >
                            <Edit className="w-3 h-3" />
                            Editar &quot;Sobre o Evento&quot; e Imagem
                        </Link>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por tema ou ano..."
                            className="pl-10 rounded-xl w-64"
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
                        setIsDialogOpen(open);
                        if (!open) {
                            setEditingEdition(null);
                            setFormData({});
                            setAtracoes([]);
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button onClick={openNew} className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-xl h-12">
                                <Plus className="w-5 h-5 mr-2" />
                                Nova Edição
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl rounded-[2rem] max-h-[90vh] overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold italic text-brand-blue">
                                        {editingEdition ? "Editar Edição" : "Nova Edição"}
                                    </DialogTitle>
                                </DialogHeader>

                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ano">Ano</Label>
                                        <Input
                                            name="ano"
                                            type="number"
                                            value={formData.ano || ""}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, ano: e.target.value })}
                                            placeholder="Ex: 2026"
                                            required
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="local">Local</Label>
                                        <Input
                                            name="local"
                                            value={formData.local || ""}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, local: e.target.value })}
                                            placeholder="Ex: Ginásio Olímpico"
                                            required
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="tema">Tema</Label>
                                        <Input
                                            name="tema"
                                            value={formData.tema || ""}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, tema: e.target.value })}
                                            placeholder="Ex: O Amor de Deus foi derramado..."
                                            required
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="data_inicio">Data de Início</Label>
                                        <Input
                                            name="data_inicio"
                                            type="date"
                                            value={formData.data_inicio || ""}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, data_inicio: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="data_fim">Data de Término</Label>
                                        <Input
                                            name="data_fim"
                                            type="date"
                                            value={formData.data_fim || ""}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, data_fim: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>

                                {/* Image */}
                                <ImageUploader
                                    label="Imagem da Edição (Opcional)"
                                    placeholder="https://exemplo.com/foto.jpg"
                                    value={formData.imagem_url || ""}
                                    onChange={(url) => setFormData({ ...formData, imagem_url: url })}
                                    folder="eventos"
                                />

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="descricao">Descrição / Memória</Label>
                                    <Textarea
                                        id="descricao"
                                        className="min-h-[100px]"
                                        placeholder="Conte um pouco sobre como foi essa edição..."
                                        value={formData.descricao || ""}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, descricao: e.target.value })}
                                    />
                                </div>

                                {/* Attractions */}
                                <div className="space-y-4 border-t pt-6">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-lg font-bold text-brand-blue flex items-center gap-2">
                                            <Star className="w-5 h-5 text-brand-gold" />
                                            Atrações ({atracoes.length})
                                        </Label>
                                        <Button type="button" variant="outline" onClick={addAtracao} className="rounded-xl">
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Adicionar Atração
                                        </Button>
                                    </div>

                                    {atracoes.map((atracao, index) => (
                                        <div key={index} className="border rounded-2xl p-4 space-y-3 bg-gray-50 relative">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeAtracao(index)}
                                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 h-8 w-8 rounded-xl"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-10">
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-gray-500">Nome</Label>
                                                    <Input
                                                        placeholder="Ex: Padre Fábio de Melo"
                                                        value={atracao.nome}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAtracao(index, "nome", e.target.value)}
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-gray-500">Descrição</Label>
                                                    <Input
                                                        placeholder="Cantor, Pregador, Banda..."
                                                        value={atracao.descricao}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAtracao(index, "descricao", e.target.value)}
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                            <ImageUploader
                                                label="Foto da Atração (Pregador, Cantor, Sacerdote)"
                                                placeholder="https://..."
                                                value={atracao.foto_url || ""}
                                                onChange={(url) => updateAtracao(index, "foto_url", url)}
                                                folder="pessoas"
                                                aspectRatio="square"
                                                compact
                                            />
                                        </div>
                                    ))}
                                </div>

                                <DialogFooter>
                                    <Button type="submit" className="bg-brand-blue text-white w-full rounded-xl" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Edição"}
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
                        <p className="font-bold italic">Carregando histórico...</p>
                    </div>
                ) : filteredEditions.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-[3rem]">
                        <XCircle className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-xl font-bold italic text-brand-blue">Nenhuma edição encontrada.</p>
                    </div>
                ) : (
                    filteredEditions.map((edition) => (
                        <Card key={edition.id} className="group overflow-hidden rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all bg-white p-6">
                            <CardContent className="p-0 space-y-4">
                                <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-gray-100 mb-4">
                                    {edition.imagem_url ? (
                                        <img src={edition.imagem_url} alt={edition.tema} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-brand-blue/5 text-brand-blue/20">
                                            <ImageIcon className="w-12 h-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-brand-gold text-brand-blue font-bold px-3 py-1 rounded-full text-xs shadow-md">
                                        {edition.ano}
                                    </div>
                                </div>

                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-brand-blue italic line-clamp-1">{edition.tema}</h3>
                                        <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                                            <MapPin className="w-3 h-3" /> {edition.local}
                                        </p>
                                        {(edition.data_inicio || edition.data_fim) && (
                                            <p className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                                                <Calendar className="w-3 h-3" />
                                                {edition.data_inicio && new Date(edition.data_inicio).toLocaleDateString("pt-BR")}
                                                {edition.data_inicio && edition.data_fim && " - "}
                                                {edition.data_fim && new Date(edition.data_fim).toLocaleDateString("pt-BR")}
                                            </p>
                                        )}
                                        {edition.atracoes && edition.atracoes.length > 0 && (
                                            <p className="text-brand-gold text-xs font-bold mt-1 flex items-center gap-1">
                                                <Star className="w-3 h-3" />
                                                {edition.atracoes.length} {edition.atracoes.length === 1 ? "atração" : "atrações"}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(edition)} className="text-gray-400 hover:text-brand-blue rounded-xl h-8 w-8">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteEdition(edition.id)} className="text-gray-400 hover:text-red-500 rounded-xl h-8 w-8">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {edition.descricao && (
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {edition.descricao}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
