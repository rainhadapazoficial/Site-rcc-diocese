"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, CheckCircle2, GraduationCap, Play, Download } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface FormacaoAdminClientProps {
    initialData: any;
}

export function FormacaoAdminClient({ initialData }: FormacaoAdminClientProps) {
    const [formData, setFormData] = useState(initialData || {
        hero: {
            title: "PROCESSO FORMATIVO",
            subtitle: "Conheça as etapas da formação na Renovação Carismática Católica.",
            image_url: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=2000"
        },
        stages: [
            {
                id: "stage1",
                title: "1ª Etapa: Querigma",
                description: "O anúncio alegre e destemido do amor de Deus, que nos leva a um encontro pessoal com Jesus e ao Batismo no Espírito Santo.",
                video_url: "https://www.youtube.com/embed/nU5O4M44u8A"
            },
            {
                id: "stage2",
                title: "2ª Etapa: Módulo Básico",
                description: "O aprofundamento na vida cristã, através do ensino da sã doutrina da Igreja e da vivência dos carismas no Grupo de Oração.",
                video_url: "https://www.youtube.com/embed/uG-H29G0qis"
            },
            {
                id: "stage3",
                title: "3ª Etapa: Formações Específicas",
                description: "O aperfeiçoamento para o serviço em cada ministério, capacitando os servos para a missão na Igreja e no mundo.",
                video_url: "https://www.youtube.com/embed/fA3p6z9fG94"
            }
        ],
        download: {
            title: "Materiais de Apoio",
            text: "Baixe a apresentação completa sobre o Processo Formativo da RCC Brasil.",
            button_text: "DOWNLOAD DO MATERIAL",
            url: "https://www.rccbrasil.org.br/portal/images/formacao/Apresentacao-Processo-Formativo.pdf"
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
                key: 'formacao_content',
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

    const updateStage = (index: number, field: string, value: string) => {
        const newStages = [...formData.stages];
        newStages[index] = { ...newStages[index], [field]: value };
        setFormData({ ...formData, stages: newStages });
    };

    return (
        <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-brand-blue italic flex items-center gap-3">
                        <GraduationCap className="w-8 h-8 text-brand-gold" />
                        Gestão do Processo Formativo
                    </h1>
                    <p className="text-gray-500 text-sm">Atualize as etapas, vídeos e materiais da formação.</p>
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
                    Conteúdo da formação atualizado com sucesso!
                </div>
            )}

            <div className="grid gap-8">
                {/* Hero Section */}
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-brand-blue p-8 text-white">
                        <CardTitle className="text-xl font-bold italic">Seção Hero (Topo)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
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
                        </div>
                        <div className="space-y-4">
                            <ImageUploader
                                label="Imagem de Fundo (Hero)"
                                value={formData.hero.image_url || ""}
                                onChange={(url) => setFormData({ ...formData, hero: { ...formData.hero, image_url: url } })}
                                folder="banners"
                                aspectRatio="banner"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Stages Section */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {formData.stages.map((stage: any, index: number) => (
                        <Card key={stage.id} className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                            <CardHeader className="bg-brand-blue/5 p-6 text-brand-blue border-b border-brand-blue/10">
                                <CardTitle className="text-lg font-bold italic flex items-center gap-2">
                                    <Play className="w-4 h-4" /> Etapa {index + 1}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label>Título da Etapa</Label>
                                    <Input
                                        value={stage.title}
                                        onChange={(e) => updateStage(index, 'title', e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Descrição</Label>
                                    <Textarea
                                        value={stage.description}
                                        onChange={(e) => updateStage(index, 'description', e.target.value)}
                                        className="rounded-xl min-h-[100px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>URL do Embed YouTube</Label>
                                    <Input
                                        value={stage.video_url}
                                        onChange={(e) => updateStage(index, 'video_url', e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Download Section */}
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-brand-gold/10 p-8 text-brand-blue">
                        <CardTitle className="text-xl font-bold italic flex items-center gap-2">
                            <Download className="w-5 h-5" /> Seção de Download
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Título da Chamada</Label>
                                <Input
                                    value={formData.download.title}
                                    onChange={(e) => setFormData({ ...formData, download: { ...formData.download, title: e.target.value } })}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Texto Descritivo</Label>
                                <Textarea
                                    value={formData.download.text}
                                    onChange={(e) => setFormData({ ...formData, download: { ...formData.download, text: e.target.value } })}
                                    className="rounded-xl min-h-[80px]"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Texto do Botão</Label>
                                <Input
                                    value={formData.download.button_text}
                                    onChange={(e) => setFormData({ ...formData, download: { ...formData.download, button_text: e.target.value } })}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>URL do Arquivo</Label>
                                <Input
                                    value={formData.download.url}
                                    onChange={(e) => setFormData({ ...formData, download: { ...formData.download, url: e.target.value } })}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
