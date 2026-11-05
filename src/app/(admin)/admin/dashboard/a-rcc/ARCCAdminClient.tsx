"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, CheckCircle2, AlertCircle, LayoutDashboard } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface ARCCAdminClientProps {
    initialData: any;
}

export function ARCCAdminClient({ initialData }: ARCCAdminClientProps) {
    const [formData, setFormData] = useState(initialData || {
        hero: {
            title: "A RCC",
            subtitle: "\"O Movimento Eclesial Renovação Carismática Católica é uma Corrente de Graça para a Igreja e para o mundo.\"",
            image_url: "https://images.unsplash.com/photo-1510915228340-29c85a43dbfe?q=80&w=2000"
        },
        baptism: {
            title: "Batismo no Espírito Santo",
            image_url: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=1000&auto=format&fit=crop",
            p1: "A espiritualidade carismática nasce em Pentecostes! No Cenáculo, com Maria e os apóstolos, vemos o derramamento do Espírito Santo sobre a Igreja. Esse evento se atualiza respondendo ao clamor por um Novo Pentecostes.",
            p2: "O Batismo no Espírito Santo é uma experiência que renova e transforma a vida. É uma experiência profunda com o amor de Deus derramado no coração humano, recebido através da submissão ao senhorio de Jesus Cristo.",
            p3: "Ele atualiza o batismo e o crisma sacramentais, aprofunda a comunhão com Deus e com os outros cristãos, reaviva o fervor evangelístico e equipa as pessoas com carismas para o serviço e a missão.",
            quote: "Nosso apostolado é ser rosto e memória de Pentecostes nos dias de hoje!"
        }
    });

    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSave = async () => {
        setIsSaving(true);
        setStatus('idle');

        const { error } = await supabase
            .from('site_settings')
            .upsert({
                key: 'a_rcc_content',
                value: formData,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error("Error saving A RCC content:", error);
            setStatus('error');
        } else {
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        }
        setIsSaving(false);
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-brand-blue italic">Gestão da Página A RCC</h1>
                    <p className="text-gray-500 text-sm">Atualize os textos e imagens da página institucional da RCC.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl px-8 shadow-lg shadow-brand-blue/20"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2 text-brand-gold" />
                            Salvar Alterações
                        </>
                    )}
                </Button>
            </div>

            {status === 'success' && (
                <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 font-bold animate-in fade-in slide-in-from-top duration-300">
                    <CheckCircle2 className="w-5 h-5" />
                    Conteúdo da página A RCC atualizado com sucesso!
                </div>
            )}

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Hero Section */}
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-brand-blue p-8 text-white">
                        <CardTitle className="text-xl font-bold italic">Seção Hero (Topo)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        <div className="space-y-2">
                            <Label>Título Principal</Label>
                            <Input
                                value={formData.hero.title}
                                onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, title: e.target.value } })}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Frase/Subtítulo (Aspas)</Label>
                            <Textarea
                                value={formData.hero.subtitle}
                                onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, subtitle: e.target.value } })}
                                className="rounded-xl min-h-[80px]"
                            />
                        </div>
                        <ImageUploader
                            label="Imagem de Fundo (Hero)"
                            value={formData.hero.image_url || ""}
                            onChange={(url) => setFormData({ ...formData, hero: { ...formData.hero, image_url: url } })}
                            folder="banners"
                            aspectRatio="banner"
                        />
                    </CardContent>
                </Card>

                {/* Baptism Section */}
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-brand-blue/5 p-8 text-brand-blue border-b border-brand-blue/10">
                        <CardTitle className="text-xl font-bold italic">Batismo no Espírito Santo</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        <div className="space-y-2">
                            <Label>Título</Label>
                            <Input
                                value={formData.baptism.title}
                                onChange={(e) => setFormData({ ...formData, baptism: { ...formData.baptism, title: e.target.value } })}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Parágrafo 1</Label>
                            <Textarea
                                value={formData.baptism.p1}
                                onChange={(e) => setFormData({ ...formData, baptism: { ...formData.baptism, p1: e.target.value } })}
                                className="rounded-xl min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Parágrafo 2</Label>
                            <Textarea
                                value={formData.baptism.p2}
                                onChange={(e) => setFormData({ ...formData, baptism: { ...formData.baptism, p2: e.target.value } })}
                                className="rounded-xl min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Parágrafo 3</Label>
                            <Textarea
                                value={formData.baptism.p3}
                                onChange={(e) => setFormData({ ...formData, baptism: { ...formData.baptism, p3: e.target.value } })}
                                className="rounded-xl min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Citação Lateral</Label>
                            <Input
                                value={formData.baptism.quote}
                                onChange={(e) => setFormData({ ...formData, baptism: { ...formData.baptism, quote: e.target.value } })}
                                className="rounded-xl"
                            />
                        </div>
                        <ImageUploader
                            label="Imagem Lateral (Batismo no Espírito Santo)"
                            value={formData.baptism.image_url || ""}
                            onChange={(url) => setFormData({ ...formData, baptism: { ...formData.baptism, image_url: url } })}
                            folder="galerias"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
