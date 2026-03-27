"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon } from "lucide-react";

interface BannerClientProps {
    initialData: any;
}

export function BannerClient({ initialData }: BannerClientProps) {
    const [banners, setBanners] = useState<any[]>(
        Array.isArray(initialData) ? initialData : [initialData || {
            title: "",
            subtitle: "",
            image_url: "",
            button1_text: "",
            button1_link: "",
            button2_text: "",
            button2_link: ""
        }]
    );
    const [activeIndex, setActiveIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSave = async () => {
        setIsSaving(true);
        setStatus('idle');

        // Filter out completely empty banners
        const validBanners = banners.filter((b: any) => b.title || b.image_url);

        const { error } = await supabase
            .from('site_settings')
            .upsert({
                key: 'home_banner',
                value: validBanners,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error("Error saving banners:", error);
            setStatus('error');
        } else {
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        }
        setIsSaving(false);
    };

    const addBanner = () => {
        setBanners([...banners, {
            title: "",
            subtitle: "",
            image_url: "",
            button1_text: "",
            button1_link: "",
            button2_text: "",
            button2_link: ""
        }]);
        setActiveIndex(banners.length);
    };

    const removeBanner = (index: number) => {
        if (banners.length <= 1) return;
        const newBanners = banners.filter((_, i: number) => i !== index);
        setBanners(newBanners);
        setActiveIndex(Math.max(0, index - 1));
    };

    const updateBanner = (index: number, field: string, value: string) => {
        const newBanners = [...banners];
        newBanners[index] = { ...newBanners[index], [field]: value };
        setBanners(newBanners);
    };

    const currentBanner = banners[activeIndex] || {};

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap gap-2">
                {banners.map((_, idx: number) => (
                    <Button
                        key={idx}
                        variant={activeIndex === idx ? "default" : "outline"}
                        onClick={() => setActiveIndex(idx)}
                        className={`rounded-xl h-12 px-6 font-bold ${activeIndex === idx ? 'bg-brand-blue text-white' : 'text-brand-blue'}`}
                    >
                        Banner {idx + 1}
                    </Button>
                ))}
                <Button
                    onClick={addBanner}
                    variant="outline"
                    className="rounded-xl h-12 px-6 border-dashed text-gray-500 hover:text-brand-blue hover:border-brand-blue"
                >
                    + Adicionar Banner
                </Button>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-brand-blue p-8 text-white relative">
                        <CardTitle className="text-2xl font-bold italic flex items-center gap-2">
                            <Save className="w-6 h-6 text-brand-gold" />
                            Editar Banner {activeIndex + 1}
                        </CardTitle>
                        <CardDescription className="text-blue-100 opacity-80">
                            Configure os textos e botões para este banner específico.
                        </CardDescription>
                        {banners.length > 1 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeBanner(activeIndex)}
                                className="absolute top-8 right-8 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-100 border-none"
                            >
                                Excluir
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Título Principal</Label>
                                <Input
                                    value={currentBanner.title}
                                    onChange={(e) => updateBanner(activeIndex, 'title', e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Subtítulo</Label>
                                <Textarea
                                    value={currentBanner.subtitle}
                                    onChange={(e) => updateBanner(activeIndex, 'subtitle', e.target.value)}
                                    className="rounded-xl min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>URL da Imagem de Fundo</Label>
                                <Input
                                    value={currentBanner.image_url}
                                    onChange={(e) => updateBanner(activeIndex, 'image_url', e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Texto Botão 1</Label>
                                    <Input
                                        value={currentBanner.button1_text}
                                        onChange={(e) => updateBanner(activeIndex, 'button1_text', e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Link Botão 1</Label>
                                    <Input
                                        value={currentBanner.button1_link}
                                        onChange={(e) => updateBanner(activeIndex, 'button1_link', e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Texto Botão 2</Label>
                                    <Input
                                        value={currentBanner.button2_text}
                                        onChange={(e) => updateBanner(activeIndex, 'button2_text', e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Link Botão 2</Label>
                                    <Input
                                        value={currentBanner.button2_link}
                                        onChange={(e) => updateBanner(activeIndex, 'button2_link', e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl px-8"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Salvando Tudo...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Salvar Todos os Banners
                                    </>
                                )}
                            </Button>

                            {status === 'success' && (
                                <div className="flex items-center gap-2 text-emerald-600 font-bold animate-in fade-in slide-in-from-left duration-300">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Tudo salvo!
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-rose-600 font-bold animate-in fade-in slide-in-from-left duration-300">
                                    <AlertCircle className="w-5 h-5" />
                                    Erro ao salvar.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-gray-50 p-8 border-b">
                        <CardTitle className="text-xl font-bold text-brand-blue italic flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            Pré-visualização (Banner {activeIndex + 1})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="relative h-[400px] flex items-center justify-center bg-brand-blue text-white text-center overflow-hidden">
                            <div className="absolute inset-0 bg-black/40 z-10" />
                            <div
                                className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500"
                                style={{ backgroundImage: `url('${currentBanner.image_url || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=2000&auto=format&fit=crop'}')` }}
                            />

                            <div className="relative z-20 max-w-md px-4 scale-75 md:scale-90 lg:scale-100">
                                <h1 className="text-3xl font-bold italic mb-4">
                                    {currentBanner.title || "Título do Banner"}
                                </h1>
                                <p className="text-sm mb-6 text-blue-100 font-medium">
                                    {currentBanner.subtitle || "Subtítulo do banner aparecerá aqui."}
                                </p>
                                <div className="flex gap-2 justify-center">
                                    <Button size="sm" className="bg-brand-gold text-white text-xs h-10 px-4">
                                        {currentBanner.button1_text || "Botão 1"}
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-white border-white text-xs h-10 px-4">
                                        {currentBanner.button2_text || "Botão 2"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-amber-50 border-t border-amber-100">
                            <p className="text-xs text-amber-800 flex items-center gap-2 italic">
                                <AlertCircle className="w-4 h-4" />
                                Visualização do banner selecionado. Lembre-se de clicar em "Salvar Todos os Banners" após editar.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
