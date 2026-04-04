"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
    Plus, Search, Trash2, Edit, Loader2,
    CheckCircle2, XCircle, MapPin
} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ForaniasAdminPage() {
    const [foranias, setForanias] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingForania, setEditingForania] = useState<any>(null);
    const [formData, setFormData] = useState<any>({ nome: "" });
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchForanias();
    }, []);

    async function fetchForanias() {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("foranias")
            .select("*")
            .order("nome", { ascending: true });

        if (error) console.error("Error fetching foranias:", error);
        else setForanias(data || []);
        setIsLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingForania) {
                const { error } = await supabase
                    .from("foranias")
                    .update({ nome: formData.nome })
                    .eq("id", editingForania.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("foranias")
                    .insert([{ nome: formData.nome }]);

                if (error) throw error;
            }

            setIsDialogOpen(false);
            setFormData({ nome: "" });
            setEditingForania(null);
            fetchForanias();
        } catch (error: any) {
            alert("Erro ao salvar forania: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir esta forania? Isso pode afetar os grupos vinculados.")) return;

        const { error } = await supabase
            .from("foranias")
            .delete()
            .eq("id", id);

        if (error) alert("Erro ao excluir: " + error.message);
        else fetchForanias();
    }

    const filteredForanias = foranias.filter(f =>
        f.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-brand-blue/5">
                <div>
                    <h1 className="text-3xl font-bold text-brand-blue flex items-center gap-3">
                        <MapPin className="text-brand-gold w-8 h-8" />
                        Gerenciar Foranias
                    </h1>
                    <p className="text-gray-500 mt-1">Configure as regiões administrativas da diocese.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingForania(null);
                        setFormData({ nome: "" });
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-brand-blue hover:bg-brand-blue/90 text-white gap-2 h-12 px-6 rounded-xl shadow-lg shadow-brand-blue/20 transition-all hover:scale-105">
                            <Plus className="w-5 h-5" />
                            Nova Forania
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
                        <DialogHeader className="bg-brand-blue p-8 text-white">
                            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                {editingForania ? "Editar Forania" : "Nova Forania"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="nome" className="text-brand-blue font-bold tracking-wide uppercase text-xs">Nome da Forania</Label>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    placeholder="Ex: FORANIA DE SINOP"
                                    required
                                    className="h-14 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-lg"
                                />
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-lg font-bold shadow-xl shadow-brand-blue/20">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        "Salvar Forania"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-blue transition-colors" />
                <Input
                    placeholder="Pesquisar foranias..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 rounded-2xl border-none shadow-sm bg-white focus:ring-2 focus:ring-brand-blue/20 text-lg transition-all"
                />
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-3xl border border-brand-blue/5">
                    <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">Carregando foranias...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredForanias.map((forania) => (
                        <Card key={forania.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden bg-white hover:-translate-y-1">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-blue/5 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold text-gray-800 text-lg leading-tight uppercase tracking-wide">
                                            {forania.nome}
                                        </h3>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setEditingForania(forania);
                                                setFormData({ nome: forania.nome });
                                                setIsDialogOpen(true);
                                            }}
                                            className="h-10 w-10 rounded-xl hover:bg-blue-50 text-blue-600"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(forania.id)}
                                            className="h-10 w-10 rounded-xl hover:bg-red-50 text-red-600"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredForanias.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                            <MapPin className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg">Nenhuma forania encontrada.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
