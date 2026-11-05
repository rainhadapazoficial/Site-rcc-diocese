"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PremiumEditor } from "@/components/admin/PremiumEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Save, ArrowLeft, Loader2, Globe, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function PaginaEditorPage() {
    const params = useParams();
    const router = useRouter();
    const isNew = params.id === "novo";

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        content: "",
        parent_menu: "quem-somos",
        is_published: true,
        image_url: ""
    });

    useEffect(() => {
        if (!isNew) {
            fetchPage();
        }
    }, [params.id]);

    async function fetchPage() {
        const { data, error } = await supabase
            .from("custom_pages")
            .select("*")
            .eq("id", params.id)
            .single();

        if (!error && data) {
            setFormData(data);
        }
        setLoading(false);
    }

    async function handleSave() {
        setSaving(true);
        setSuccess(false);

        const dataToSave = {
            ...formData,
            updated_at: new Date().toISOString()
        };

        const { error } = isNew
            ? await supabase.from("custom_pages").insert(dataToSave)
            : await supabase.from("custom_pages").update(dataToSave).eq("id", params.id);

        if (error) {
            console.error("Erro ao salvar:", error.message);
            alert("Erro ao salvar: " + error.message);
        } else {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            if (isNew) {
                router.push("/admin/dashboard/paginas");
            }
        }
        setSaving(false);
    }

    if (loading) return <div className="p-8">Carregando editor...</div>;

    return (
        <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/dashboard/paginas">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-brand-blue italic flex items-center gap-3">
                            {isNew ? "Nova Página Dinâmica" : `Editando: ${formData.title}`}
                        </h1>
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl px-8 shadow-lg shadow-brand-blue/20"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2 text-brand-gold" />}
                    Salvar Página
                </Button>
            </div>

            {success && (
                <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    Página salva com sucesso!
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <Label className="text-lg font-bold text-brand-blue">Conteúdo da Página</Label>
                                <PremiumEditor
                                    content={formData.content}
                                    onChange={(html) => setFormData({ ...formData, content: html })}
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label>Título da Página</Label>
                                <Input
                                    placeholder="Ex: História RCC Sinop"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="rounded-xl h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug (Link amigável)</Label>
                                <Input
                                    placeholder="Ex: historia-rcc-sinop"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="rounded-xl h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Submenu Pai (Onde aparecerá)</Label>
                                <Select
                                    value={formData.parent_menu}
                                    onValueChange={(val) => setFormData({ ...formData, parent_menu: val })}
                                >
                                    <SelectTrigger className="rounded-xl h-12">
                                        <SelectValue placeholder="Selecione o menu" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="quem-somos">Quem Somos</SelectItem>
                                        <SelectItem value="formacao">Formação</SelectItem>
                                        <SelectItem value="eventos">Eventos</SelectItem>
                                        <SelectItem value="nenhum">Nenhum (Página isolada)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <ImageUploader
                                    label="Imagem de Destaque"
                                    placeholder="Ex: https://.../foto.jpg"
                                    value={formData.image_url || ""}
                                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                                    folder="galerias"
                                    hint="Esta imagem aparecerá ao lado do texto explicativo (ex: Festa do Rei Jesus)."
                                    compact
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Status de Publicação</Label>
                                    <p className="text-xs text-gray-400">Páginas não publicadas ficam ocultas.</p>
                                </div>
                                <Switch
                                    checked={formData.is_published}
                                    onCheckedChange={(val) => setFormData({ ...formData, is_published: val })}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
