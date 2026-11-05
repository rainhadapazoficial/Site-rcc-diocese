"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, Image as ImageIcon, History, Globe, Info, CheckCircle2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface DioceseAdminClientProps {
    initialData: any;
}

export function DioceseAdminClient({ initialData }: DioceseAdminClientProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState(initialData || {
        hero: {
            title: "História da Diocese de Sinop",
            subtitle: "Conheça a caminhada de fé em nossa região.",
            image_url: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=2000"
        },
        section1: {
            title: "Origens e Fundação",
            description: "A Diocese de Sinop foi criada em 06 de fevereiro de 1982 pelo Papa João Paulo II, desmembrada da Diocese de Diamantino e da Prelazia de Cristalândia.",
            content: "Desde o início, a Diocese foi marcada pelo espírito missionário e pelo acolhimento aos migrantes que chegavam para povoar o norte de Mato Grosso. O primeiro Bispo foi Dom Henrique Froehlich, SJ, que lançou as bases para uma Igreja viva e atuante."
        },
        section2: {
            title: "Missão e Evangelização",
            description: "Com uma vasta extensão territorial, a Diocese se organiza em paróquias e comunidades que levam o Evangelho a cada canto do norte mato-grossense.",
            content: "A Renovação Carismática Católica tem sido um braço forte na evangelização desta diocese, promovendo o batismo no Espírito Santo e o surgimento de novos grupos de oração em todas as cidades da nossa jurisdição."
        },
        image_url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2000"
    });

    const handleSave = async () => {
        setIsLoading(true);
        setStatus('idle');
        try {
            const { error } = await supabase
                .from("site_settings")
                .upsert({
                    key: "historia_diocese_content",
                    value: formData,
                    updated_at: new Date().toISOString(),
                }, { onConflict: "key" });

            if (error) throw error;
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (error) {
            console.error(error);
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    const updateHero = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            hero: { ...prev.hero, [field]: value }
        }));
    };

    const updateSection = (section: string, field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">História Diocese de Sinop</h1>
                    <p className="text-gray-500">Gerencie o conteúdo da página histórica da diocese.</p>
                </div>
                <Button onClick={handleSave} disabled={isLoading} className="bg-brand-blue hover:bg-brand-blue/90 gap-2">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Alterações
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hero Section Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-brand-gold" />
                            Seção Hero
                        </CardTitle>
                        <CardDescription>Primeira imagem e textos que o usuário vê.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Título Principal</label>
                            <Input value={formData.hero.title} onChange={(e) => updateHero("title", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subtítulo</label>
                            <Input value={formData.hero.subtitle} onChange={(e) => updateHero("subtitle", e.target.value)} />
                        </div>
                        <ImageUploader
                            label="Imagem de Fundo (Hero)"
                            value={formData.hero.image_url || ""}
                            onChange={(url) => updateHero("image_url", url)}
                            folder="banners"
                            aspectRatio="banner"
                        />
                    </CardContent>
                </Card>

                {/* Section 1 Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="w-5 h-5 text-brand-gold" />
                            Origens e Fundação
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Título</label>
                            <Input value={formData.section1.title} onChange={(e) => updateSection("section1", "title", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Resumo</label>
                            <Textarea value={formData.section1.description} onChange={(e) => updateSection("section1", "description", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Conteúdo Detalhado</label>
                            <Textarea value={formData.section1.content} onChange={(e) => updateSection("section1", "content", e.target.value)} rows={4} />
                        </div>
                    </CardContent>
                </Card>

                {/* Section 2 Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-brand-gold" />
                            Missão e Evangelização
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Título</label>
                            <Input value={formData.section2.title} onChange={(e) => updateSection("section2", "title", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Resumo</label>
                            <Textarea value={formData.section2.description} onChange={(e) => updateSection("section2", "description", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Conteúdo Detalhado</label>
                            <Textarea value={formData.section2.content} onChange={(e) => updateSection("section2", "content", e.target.value)} rows={4} />
                        </div>
                    </CardContent>
                </Card>

                {/* General Image */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="w-5 h-5 text-brand-gold" />
                            Imagem Destacada
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ImageUploader
                            label="Imagem Lateral Destacada"
                            value={formData.image_url || ""}
                            onChange={(url) => setFormData({ ...formData, image_url: url })}
                            folder="galerias"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
