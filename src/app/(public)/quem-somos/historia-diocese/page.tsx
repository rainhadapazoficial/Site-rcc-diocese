"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Loader2, History, Info } from "lucide-react";

type HistoriaDioceseContent = {
    hero: { title: string; subtitle: string; image_url: string };
    section1: { title: string; description: string; content: string };
    section2: { title: string; description: string; content: string };
    image_url: string;
};

export default function HistoriaDiocesePage() {
    const [content, setContent] = useState<HistoriaDioceseContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchContent() {
            try {
                const { data } = await supabase
                    .from("site_settings")
                    .select("value")
                    .eq("key", "historia_diocese_content")
                    .single();

                if (data?.value) {
                    setContent(data.value);
                }
            } catch (err) {
                console.error("Error fetching content:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchContent();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-brand-gold" />
            </div>
        );
    }

    const data = content || {
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
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[400px] flex items-center justify-center bg-brand-blue text-white text-center">
                <div className="absolute inset-0 bg-black/50 z-10" />
                <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url('${data.hero.image_url}')` }} />

                <div className="relative z-20 max-w-4xl px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold italic mb-6 animate-in fade-in slide-in-from-bottom duration-1000">
                        {data.hero.title}
                    </h1>
                    <div className="w-24 h-1 bg-brand-gold mx-auto mb-6 rounded-full" />
                </div>
            </section>

            {/* Introduction */}
            <section className="py-20 bg-white">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 text-brand-gold mb-2">
                                <History className="w-6 h-6" />
                                <span className="font-bold uppercase tracking-widest text-sm">Nossas Raízes</span>
                            </div>
                            <h2 className="text-4xl font-bold text-brand-blue italic">{data.section1.title}</h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                {data.section1.description}
                            </p>
                            <p className="text-gray-600 border-l-4 border-brand-gold pl-6 italic">
                                {data.section1.content}
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-brand-gold/10 rounded-[3rem] -rotate-3" />
                            <Image
                                src={data.image_url}
                                alt="Catedral de Sinop"
                                fill
                                className="relative rounded-[3rem] shadow-2xl object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 bg-brand-blue/5">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <div className="mb-16">
                        <Info className="w-12 h-12 text-brand-gold mx-auto mb-6" />
                        <h2 className="text-4xl font-bold text-brand-blue italic mb-6">{data.section2.title}</h2>
                        <div className="w-24 h-1 bg-brand-gold mx-auto rounded-full" />
                    </div>

                    <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-brand-blue/10 max-w-4xl mx-auto">
                        <p className="text-gray-600 text-xl leading-relaxed mb-8">
                            {data.section2.description}
                        </p>
                        <p className="text-gray-700 font-medium">
                            {data.section2.content}
                        </p>
                    </div>
                </div>
            </section>

            {/* Call to Action or Footer Image */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="rounded-[4rem] overflow-hidden relative h-[400px] shadow-2xl group">
                        <Image
                            src="https://images.unsplash.com/photo-1466096115517-bceecbfb6fde?q=80&w=2000"
                            alt="Diocese de Sinop"
                            fill
                            className="object-cover transform transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/90 via-brand-blue/40 to-transparent flex items-center justify-center text-center p-8">
                            <div className="max-w-2xl">
                                <h3 className="text-3xl font-bold text-white italic mb-6">Uma Igreja em Saída</h3>
                                <p className="text-white/80 text-lg">&quot;Ide por todo o mundo e pregai o Evangelho a toda criatura.&quot; (Mc 16, 15)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
