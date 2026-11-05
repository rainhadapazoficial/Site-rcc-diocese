"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, CheckCircle2, Heart, List, ImageIcon } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface SeminarioVidaAdminClientProps {
    initialData: any;
}

export function SeminarioVidaAdminClient({ initialData }: SeminarioVidaAdminClientProps) {
    const [formData, setFormData] = useState(initialData || {
        hero: {
            title: "Seminário de Vida no Espírito Santo",
            subtitle: "Experimente um novo Pentecostes em sua vida.",
            image_url: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=2000"
        },
        about: {
            title: "O que é o Seminário?",
            description: "O Seminário de Vida no Espírito Santo é o instrumento de evangelização fundamental da Renovação Carismática Católica. É um encontro de 9 semanas focado nos temas do querigma.",
            p1: "Através da pregação, oração e partilha, somos levados a um encontro pessoal com Jesus Cristo.",
            p2: "O ponto alto é a Oração por Efusão do Espírito Santo, onde renovamos as promessas do nosso batismo."
        },
        themes: [
            { id: "1", title: "O Amor de Deus", icon: "Heart" },
            { id: "2", title: "Pecado e Salvação", icon: "Shield" },
            { id: "3", title: "Fé e Conversão", icon: "Target" },
            { id: "4", title: "Senhorio de Jesus", icon: "Crown" },
            { id: "5", title: "Cura Interior", icon: "Sparkles" },
            { id: "6", title: "Batismo no Espírito", icon: "Flame" }
        ],
        image_url: "https://images.unsplash.com/photo-1510915228340-29c85a43dbfe?q=80&w=1000"
    });

    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSave = async () => {
        setIsSaving(true);
        setStatus('idle');

        const { error } = await supabase
            .from('site_settings')
            .upsert({
                key: 'seminario_vida_content',
                value: formData,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error("Error saving content:", error);
            setStatus('error');
        } else {
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        }
        setIsSaving(false);
    };

    const updateTheme = (index: number, value: string) => {
        const newThemes = [...formData.themes];
        newThemes[index] = { ...newThemes[index], title: value };
        setFormData({ ...formData, themes: newThemes });
    };

    return (
        <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-brand-blue italic flex items-center gap-3">
                        <Heart className="w-8 h-8 text-brand-gold" />
                        Gestão do Seminário de Vida
                    </h1>
                    <p className="text-gray-500 text-sm">Atualize os textos, temas e imagens do Seminário.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl px-8 shadow-lg shadow-brand-blue/20"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2 text-brand-gold" />}
                    Salvar Alterações
                </Button>
            </div>

            {status === 'success' && (
                <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    Conteúdo atualizado com sucesso!
                </div>
            )}

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Hero & Image */}
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-brand-blue p-8 text-white">
                        <CardTitle className="text-xl font-bold italic">Visual (Hero e Fotos)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        <div className="space-y-2">
                            <Label>Título do Hero</Label>
                            <Input
                                value={formData.hero.title}
                                onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, title: e.target.value } })}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Subtítulo do Hero</Label>
                            <Input
                                value={formData.hero.subtitle}
                                onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, subtitle: e.target.value } })}
                                className="rounded-xl"
                            />
                        </div>
                        <ImageUploader
                            label="Imagem Hero (Topo)"
                            value={formData.hero.image_url || ""}
                            onChange={(url) => setFormData({ ...formData, hero: { ...formData.hero, image_url: url } })}
                            folder="banners"
                            aspectRatio="banner"
                        />
                        <ImageUploader
                            label="Imagem Seção Sobre"
                            value={formData.image_url || ""}
                            onChange={(url) => setFormData({ ...formData, image_url: url })}
                            folder="galerias"
                        />
                    </CardContent>
                </Card>

                {/* About Section */}
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-brand-blue/5 p-8 text-brand-blue border-b border-brand-blue/10">
                        <CardTitle className="text-xl font-bold italic">Sobre o Seminário</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        <div className="space-y-2">
                            <Label>Título da Seção</Label>
                            <Input
                                value={formData.about.title}
                                onChange={(e) => setFormData({ ...formData, about: { ...formData.about, title: e.target.value } })}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição Principal</Label>
                            <Textarea
                                value={formData.about.description}
                                onChange={(e) => setFormData({ ...formData, about: { ...formData.about, description: e.target.value } })}
                                className="rounded-xl min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Parágrafo 1</Label>
                            <Textarea
                                value={formData.about.p1}
                                onChange={(e) => setFormData({ ...formData, about: { ...formData.about, p1: e.target.value } })}
                                className="rounded-xl min-h-[60px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Parágrafo 2</Label>
                            <Textarea
                                value={formData.about.p2}
                                onChange={(e) => setFormData({ ...formData, about: { ...formData.about, p2: e.target.value } })}
                                className="rounded-xl min-h-[60px]"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Themes Section */}
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white lg:col-span-2">
                    <CardHeader className="bg-brand-gold/10 p-8 text-brand-blue">
                        <CardTitle className="text-xl font-bold italic flex items-center gap-2">
                            <List className="w-5 h-5" /> Temas do Seminário (Lista)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 grid md:grid-cols-3 gap-6">
                        {formData.themes.map((theme: any, index: number) => (
                            <div key={theme.id} className="space-y-2">
                                <Label>Tema {index + 1}</Label>
                                <Input
                                    value={theme.title}
                                    onChange={(e) => updateTheme(index, e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
