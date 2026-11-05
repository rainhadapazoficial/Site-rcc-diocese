"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, CheckCircle2, History, Play, Image as ImageIcon } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface HistoriaRCCAdminClientProps {
    initialData: any;
}

export function HistoriaRCCAdminClient({ initialData }: HistoriaRCCAdminClientProps) {
    const [formData, setFormData] = useState(initialData || {
        hero: {
            title: "História da RCC",
            subtitle: "Conheça como o Espírito Santo soprou sobre o mundo e iniciou esta corrente de graça.",
            image_url: "https://rccbrasil.org.br/wp-content/uploads/2021/01/duquene-weekend.jpg"
        },
        origin: {
            title: "O Fim de Semana de Duquesne",
            p1: "A Renovação Carismática Católica (RCC) teve seu início oficial em um retiro realizado por estudantes e professores da Universidade de Duquesne, em Pittsburgh (EUA), em fevereiro de 1967.",
            p2: "Eles buscavam uma renovação espiritual profunda e, ao rezarem 'Vem, Espírito Santo', experimentaram um derramamento extraordinário de dons carismáticos, semelhante ao relato bíblico de Pentecostes.",
            p3: "Daquele pequeno grupo, a chama se espalhou rapidamente para outras universidades, paróquias e, em poucos anos, alcançou todos os continentes, tornando-se uma das maiores forças de renovação na Igreja Católica.",
            image_url: "https://rccbrasil.org.br/wp-content/uploads/2021/01/patty-mansfield.jpg"
        },
        documentary: {
            title: "Documentário Oficial",
            video_url: "https://www.youtube.com/embed/fA3p6z9fG94",
            description: "Assista ao documentário que conta detalhes sobre os primeiros anos e a expansão da RCC no Brasil e no mundo."
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
                key: 'historia_rcc_content',
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
                        <History className="w-8 h-8 text-brand-gold" />
                        Gestão da História da RCC
                    </h1>
                    <p className="text-gray-500 text-sm">Atualize os textos e o vídeo histórico da página.</p>
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
                    Conteúdo da história atualizado com sucesso!
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

                {/* Origin Section */}
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-brand-blue/5 p-8 text-brand-blue border-b border-brand-blue/10">
                        <CardTitle className="text-xl font-bold italic">As Origens (Duquesne)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        <div className="space-y-2">
                            <Label>Título da Seção</Label>
                            <Input
                                value={formData.origin.title}
                                onChange={(e) => setFormData({ ...formData, origin: { ...formData.origin, title: e.target.value } })}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Parágrafo 1</Label>
                            <Textarea
                                value={formData.origin.p1}
                                onChange={(e) => setFormData({ ...formData, origin: { ...formData.origin, p1: e.target.value } })}
                                className="rounded-xl min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Parágrafo 2</Label>
                            <Textarea
                                value={formData.origin.p2}
                                onChange={(e) => setFormData({ ...formData, origin: { ...formData.origin, p2: e.target.value } })}
                                className="rounded-xl min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Parágrafo 3</Label>
                            <Textarea
                                value={formData.origin.p3}
                                onChange={(e) => setFormData({ ...formData, origin: { ...formData.origin, p3: e.target.value } })}
                                className="rounded-xl min-h-[80px]"
                            />
                        </div>
                        <ImageUploader
                            label="Imagem de Apoio (As Origens)"
                            value={formData.origin.image_url || ""}
                            onChange={(url) => setFormData({ ...formData, origin: { ...formData.origin, image_url: url } })}
                            folder="galerias"
                        />
                    </CardContent>
                </Card>

                {/* Documentary Section */}
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white lg:col-span-2">
                    <CardHeader className="bg-brand-gold/10 p-8 text-brand-blue">
                        <CardTitle className="text-xl font-bold italic flex items-center gap-2">
                            <Play className="w-5 h-5" /> Documentário e Vídeos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Título da Seção de Vídeo</Label>
                                <Input
                                    value={formData.documentary.title}
                                    onChange={(e) => setFormData({ ...formData, documentary: { ...formData.documentary, title: e.target.value } })}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>URL do Embed do YouTube (ex: https://www.youtube.com/embed/ID)</Label>
                                <Input
                                    value={formData.documentary.video_url}
                                    onChange={(e) => setFormData({ ...formData, documentary: { ...formData.documentary, video_url: e.target.value } })}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Descrição Curta</Label>
                                <Textarea
                                    value={formData.documentary.description}
                                    onChange={(e) => setFormData({ ...formData, documentary: { ...formData.documentary, description: e.target.value } })}
                                    className="rounded-xl min-h-[80px]"
                                />
                            </div>
                        </div>
                        <div className="bg-gray-100 rounded-3xl flex items-center justify-center p-4">
                            {formData.documentary.video_url ? (
                                <iframe
                                    className="w-full h-full aspect-video rounded-2xl shadow-lg"
                                    src={formData.documentary.video_url}
                                    title="Preview"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="text-gray-400 italic">Preencha a URL para ver o preview.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
