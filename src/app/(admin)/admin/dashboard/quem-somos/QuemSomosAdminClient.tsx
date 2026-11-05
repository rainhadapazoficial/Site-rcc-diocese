"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, CheckCircle2, Info, Target, Shield, Heart } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface QuemSomosAdminClientProps {
    initialData: any;
}

export function QuemSomosAdminClient({ initialData }: QuemSomosAdminClientProps) {
    const [formData, setFormData] = useState(initialData || {
        hero: {
            title: "Quem Somos",
            subtitle: "Conheça a história, a missão e os valores que movem a RCC Diocese de Sinop.",
            image_url: "https://images.unsplash.com/photo-1510915228340-29c85a43dbfe?q=80&w=2000"
        },
        history: {
            badge: "Nossa Herança",
            title: "Uma Caminhada de Fé e Adoração",
            p1: "A RCC Diocese de Sinop nasceu do desejo profundo de buscar uma experiência viva com o Espírito Santo, expandindo-se por todas as paróquias e comunidades da nossa região.",
            p2: "Movidos pelo compromisso com a Renovação Carismática Católica (RCC), somos uma expressão de fé que busca o Batismo no Espírito Santo, a cura interior e o crescimento na vida espiritual de todo o povo de Deus.",
            p3: "Hoje, somos uma grande família diocesana unida pelo amor de Maria e pela força de um novo Pentecostes.",
            quote: "A Renovação Carismática Católica é um grande dom do Espírito Santo à Igreja e ao mundo.",
            image_url: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=1000&auto=format&fit=crop"
        },
        mission: {
            title: "Missão",
            text: "Evangelizar com renovado ardor missionário, através da experiência do Pentecostes, formando discípulos apaixonados pelo Reino de Deus."
        },
        vision: {
            title: "Visão",
            text: "Ser um centro vibrante de espiritualidade e acolhimento em Sinop, onde cada pessoa possa encontrar seu lugar no coração de Jesus."
        },
        values: {
            title: "Valores",
            text: "Fidelidade à Igreja, Docilidade ao Espírito Santo, Fraternidade Genuína, Oração Persistente e Serviço Desinteressado."
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
                key: 'quem_somos_content',
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

    return (
        <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-brand-blue italic flex items-center gap-3">
                        <Info className="w-8 h-8 text-brand-gold" />
                        Gestão da Página Quem Somos
                    </h1>
                    <p className="text-gray-500 text-sm">Atualize a identidade, missão e história da Diocese.</p>
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
                            <Label>Subtítulo</Label>
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

                {/* History Section */}
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-brand-blue/5 p-8 text-brand-blue border-b border-brand-blue/10">
                        <CardTitle className="text-xl font-bold italic">Nossa História / Herança</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Badge (Texto curto)</Label>
                                <Input
                                    value={formData.history.badge}
                                    onChange={(e) => setFormData({ ...formData, history: { ...formData.history, badge: e.target.value } })}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Título da Seção</Label>
                                <Input
                                    value={formData.history.title}
                                    onChange={(e) => setFormData({ ...formData, history: { ...formData.history, title: e.target.value } })}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Parágrafo 1</Label>
                            <Textarea
                                value={formData.history.p1}
                                onChange={(e) => setFormData({ ...formData, history: { ...formData.history, p1: e.target.value } })}
                                className="rounded-xl min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Parágrafo 2</Label>
                            <Textarea
                                value={formData.history.p2}
                                onChange={(e) => setFormData({ ...formData, history: { ...formData.history, p2: e.target.value } })}
                                className="rounded-xl min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Parágrafo 3</Label>
                            <Textarea
                                value={formData.history.p3}
                                onChange={(e) => setFormData({ ...formData, history: { ...formData.history, p3: e.target.value } })}
                                className="rounded-xl min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Citação (Aspas)</Label>
                            <Input
                                value={formData.history.quote}
                                onChange={(e) => setFormData({ ...formData, history: { ...formData.history, quote: e.target.value } })}
                                className="rounded-xl"
                            />
                        </div>
                        <ImageUploader
                            label="Imagem de Apoio (Nossa História)"
                            value={formData.history.image_url || ""}
                            onChange={(url) => setFormData({ ...formData, history: { ...formData.history, image_url: url } })}
                            folder="galerias"
                        />
                    </CardContent>
                </Card>

                {/* Mission, Vision, Values */}
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white lg:col-span-2">
                    <CardHeader className="bg-brand-gold/10 p-8 text-brand-blue">
                        <CardTitle className="text-xl font-bold italic">Missão, Visão e Valores</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 grid md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-brand-blue font-bold">
                                <Target className="w-5 h-5" /> Missão
                            </div>
                            <Textarea
                                value={formData.mission.text}
                                onChange={(e) => setFormData({ ...formData, mission: { ...formData.mission, text: e.target.value } })}
                                className="rounded-xl min-h-[120px]"
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-brand-gold font-bold">
                                <Shield className="w-5 h-5" /> Visão
                            </div>
                            <Textarea
                                value={formData.vision.text}
                                onChange={(e) => setFormData({ ...formData, vision: { ...formData.vision, text: e.target.value } })}
                                className="rounded-xl min-h-[120px]"
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-600 font-bold">
                                <Heart className="w-5 h-5" /> Valores
                            </div>
                            <Textarea
                                value={formData.values.text}
                                onChange={(e) => setFormData({ ...formData, values: { ...formData.values, text: e.target.value } })}
                                className="rounded-xl min-h-[120px]"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
