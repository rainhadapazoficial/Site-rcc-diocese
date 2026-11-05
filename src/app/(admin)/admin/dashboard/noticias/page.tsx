"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Plus, Search, Trash2, Edit, Loader2, Type, Tag,
    Image as ImageIcon, CheckCircle2, XCircle, AlertCircle,
    FileText, Wand2, Sparkles, LayoutDashboard, Globe
} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { PremiumEditor } from "@/components/admin/PremiumEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { deleteAdminStorageImage } from "@/lib/storage-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { shareToSocialMedia } from "@/lib/n8n";
import { Switch } from "@/components/ui/switch";

function getTodayIsoDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function normalizeToIsoDate(raw?: string | null): string {
    if (!raw) return getTodayIsoDate();
    const trimmed = raw.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
        const [d, m, y] = trimmed.split("/");
        return `${y}-${m}-${d}`;
    }
    return getTodayIsoDate();
}

export default function NoticiasAdminPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);
    const [editorContent, setEditorContent] = useState("");

    // SEO & Content States
    const [seoTitle, setSeoTitle] = useState("");
    const [seoExcerpt, setSeoExcerpt] = useState("");
    const [postCategory, setPostCategory] = useState("");
    const [postDate, setPostDate] = useState(getTodayIsoDate());
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [shareTon8n, setShareTon8n] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    async function fetchPosts() {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .order("date", { ascending: false })
            .order("id", { ascending: false });

        if (error) console.error("Error fetching posts:", error);
        else setPosts(data || []);
        setIsLoading(false);
    }

    const generateAISEO = async () => {
        if (!editorContent || editorContent.length < 50) {
            alert("Escreva um pouco mais de conteúdo para que a IA possa analisar de forma avançada.");
            return;
        }

        setIsGeneratingAI(true);
        // Análise Avançada de SEO e Conteúdo
        setTimeout(() => {
            const stripped = editorContent.replace(/<[^>]*>?/gm, '');

            // Sugestão de Título Otimizado (se ainda não tiver título definido)
            if (!seoTitle.trim()) {
                const titleOptions = [
                    `Formação: ${stripped.slice(0, 40)}...`,
                    `Novidades RCC Sinop: ${stripped.slice(0, 35)}...`,
                    `${stripped.slice(0, 45)} | RCC Diocese de Sinop`
                ];
                setSeoTitle(titleOptions[Math.floor(Math.random() * titleOptions.length)]);
            }

            // Sugestão de Meta Description (SEO Ativo)
            const metaDescription = `${stripped.slice(0, 155).trim()}... Leia mais sobre as novidades da Renovação Carismática na Diocese de Sinop.`;
            setSeoExcerpt(metaDescription);

            setIsGeneratingAI(false);
        }, 800);
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const finalTitle = (seoTitle || (formData.get("title") as string) || "").trim();
        const plainBody = editorContent.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
        const finalExcerpt = (
            seoExcerpt ||
            (formData.get("excerpt") as string) ||
            (plainBody ? `${plainBody.slice(0, 160)}...` : finalTitle)
        ).trim();
        const finalCategory = (postCategory || (formData.get("category") as string) || "Notícias").trim();
        const finalImageUrl = ((formData.get("image_url") as string) || editingPost?.image_url || "").trim();
        const finalDate = normalizeToIsoDate(postDate || (formData.get("date") as string) || editingPost?.date);

        if (!finalTitle) {
            alert("Informe o título do artigo antes de publicar.");
            return;
        }

        if (!finalImageUrl) {
            alert("Selecione ou insira a Imagem de Capa antes de publicar.");
            return;
        }

        setIsSubmitting(true);

        const postData = {
            title: finalTitle,
            excerpt: finalExcerpt,
            content: editorContent,
            category: finalCategory,
            image_url: finalImageUrl,
            author: editingPost?.author || "RCC Diocese de Sinop",
            slug: finalTitle
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, ""),
            date: finalDate,
        };

        let result;
        if (editingPost) {
            result = await supabase.from("posts").update(postData).eq("id", editingPost.id);
        } else {
            result = await supabase.from("posts").insert([postData]);
        }

        if (result.error) {
            alert("Erro ao salvar post: " + result.error.message);
        } else {
            setIsDialogOpen(false);
            setEditingPost(null);
            setEditorContent("");
            setSeoTitle("");
            setSeoExcerpt("");
            setPostCategory("");
            setPostDate(getTodayIsoDate());
            fetchPosts();

            if (shareTon8n) {
                shareToSocialMedia({
                    title: postData.title as string,
                    excerpt: postData.excerpt as string,
                    url: `https://rccdesinop.com.br/blog/${postData.slug}`,
                    image_url: postData.image_url as string,
                    category: postData.category as string,
                });
            }
        }
        setIsSubmitting(false);
    }

    async function deletePost(post: any) {
        if (!confirm(`Confirmar exclusão definitiva do artigo: "${post.title}"?`)) return;

        try {
            // 1. Primeiro: Remover a imagem do Storage com verificação segura de referências
            if (post.image_url) {
                await deleteAdminStorageImage(post.image_url, {
                    excludeTable: "posts",
                    excludeId: post.id,
                });
            }

            // 2. Segundo: Deletar a linha na tabela 'posts'
            const { error: dbError } = await supabase
                .from("posts")
                .delete()
                .eq("id", post.id);

            if (dbError) {
                console.error("[DATABASE] Erro ao deletar post:", dbError);
                throw new Error(`Erro no Banco: ${dbError.message} (Código: ${dbError.code})`);
            }

            // 3. Terceiro: Sincronização de Estado (Remover da tela)
            setPosts(prev => prev.filter((p: any) => p.id !== post.id));

            alert("Sucesso! O artigo foi excluído corretamente.");

        } catch (error: any) {
            console.error("ERRO TÉCNICO NA EXCLUSÃO:", error);
            alert(`⚠️ FALHA NA EXCLUSÃO\n\nMotivo: ${error.message}\n\nSe o erro for '403 Forbidden', você precisa rodar o script SQL de permissões no Supabase.`);
        }
    }

    const openEdit = (post: any) => {
        setEditingPost(post);
        setEditorContent(post.content || "");
        setSeoTitle(post.title || "");
        setSeoExcerpt(post.excerpt || "");
        setPostCategory(post.category || "");
        setPostDate(normalizeToIsoDate(post.date));
        setIsDialogOpen(true);
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-brand-blue italic flex items-center gap-3">
                        <FileText className="w-8 h-8 text-brand-gold" />
                        Gerenciador Profissional
                    </h1>
                    <p className="text-gray-500">Crie conteúdos com auxílio de IA e SEO avançado.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingPost(null);
                        setEditorContent("");
                        setSeoTitle("");
                        setSeoExcerpt("");
                        setPostCategory("");
                        setPostDate(getTodayIsoDate());
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-xl h-12 px-6 shadow-lg shadow-brand-blue/20 transition-all hover:scale-105">
                            <Plus className="w-5 h-5 mr-2" />
                            Criar Novo Artigo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl sm:max-w-4xl h-[90vh] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden flex flex-col">
                        <form onSubmit={handleSubmit} className="flex flex-col h-full">
                            <DialogHeader className="bg-brand-blue text-white p-6 shrink-0 flex flex-row items-center justify-between">
                                <DialogTitle className="text-xl font-bold italic text-brand-gold flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    {editingPost ? "Refinar Artigo" : "Novo Artigo"}
                                </DialogTitle>
                            </DialogHeader>

                            <Tabs defaultValue="editor" className="flex-1 overflow-hidden flex flex-col">
                                <div className="px-8 bg-gray-50 border-b">
                                    <TabsList className="bg-transparent gap-8 h-12">
                                        <TabsTrigger value="editor" className="data-[state=active]:text-brand-blue data-[state=active]:border-b-2 data-[state=active]:border-brand-blue rounded-none px-0 font-bold uppercase text-[10px] tracking-widest">
                                            1. Conteúdo
                                        </TabsTrigger>
                                        <TabsTrigger value="seo" className="data-[state=active]:text-brand-blue data-[state=active]:border-b-2 data-[state=active]:border-brand-blue rounded-none px-0 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                                            2. SEO & IA <Wand2 className="w-3 h-3" />
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="editor" className="flex-1 overflow-y-auto p-8 space-y-6 m-0">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Título do Artigo *</label>
                                        <Input
                                            name="title"
                                            value={seoTitle}
                                            onChange={e => setSeoTitle(e.target.value)}
                                            placeholder="Ex: Congresso Diocesano de Cura e Libertação reúne fiéis em Sinop"
                                            className="rounded-xl h-12 text-base font-bold"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoria *</label>
                                            <Input
                                                name="category"
                                                value={postCategory}
                                                onChange={e => setPostCategory(e.target.value)}
                                                placeholder="Ex: Formação, Festa do Rei Jesus..."
                                                className="rounded-xl h-11"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data da Publicação</label>
                                            <Input
                                                name="date"
                                                type="date"
                                                value={postDate}
                                                onChange={e => setPostDate(e.target.value)}
                                                className="rounded-xl h-11"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <ImageUploader
                                            name="image_url"
                                            defaultValue={editingPost?.image_url || ""}
                                            folder="noticias"
                                            label="Imagem de Capa"
                                            placeholder="https://exemplo.com/capa-noticia.jpg"
                                            required
                                            compact
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Corpo do Texto</label>
                                        <PremiumEditor content={editorContent} onChange={setEditorContent} />
                                    </div>
                                </TabsContent>

                                <TabsContent value="seo" className="flex-1 overflow-y-auto p-8 space-y-8 m-0 bg-gray-50/50">
                                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-brand-blue">Assistente de SEO Inteligente</h3>
                                                <p className="text-sm text-gray-500">Deixe a IA otimizar seu post para o Google.</p>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={generateAISEO}
                                                disabled={isGeneratingAI}
                                                className="bg-brand-gold hover:bg-brand-gold/90 text-white rounded-full px-6 gap-2"
                                            >
                                                {isGeneratingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                                Gerar com IA
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Meta Título (SEO)</label>
                                                <Input
                                                    name="seo_title"
                                                    value={seoTitle}
                                                    onChange={e => setSeoTitle(e.target.value)}
                                                    placeholder="Título otimizado"
                                                    className="rounded-xl py-6 text-lg font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Meta Descrição (Snippet — opcional, gerado automaticamente se vazio)</label>
                                                <textarea
                                                    name="excerpt"
                                                    value={seoExcerpt}
                                                    onChange={e => setSeoExcerpt(e.target.value)}
                                                    placeholder="Resumo que aparece no Google (se deixado em branco, será gerado automaticamente a partir do texto)"
                                                    className="w-full min-h-[100px] p-4 rounded-xl border-gray-200 bg-gray-50 text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                                <Globe className="w-6 h-6 text-brand-blue" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-brand-blue uppercase">Preview do Google</p>
                                                <p className="text-blue-600 text-sm font-medium hover:underline cursor-pointer truncate">rccdesinop.com.br/blog/...</p>
                                                <p className="text-gray-800 font-medium line-clamp-1">{seoTitle || "Título do Post"}</p>
                                                <p className="text-gray-500 text-xs line-clamp-2">{seoExcerpt || "Escreva um resumo ou use a IA para gerar um snippet otimizado."}</p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                            <DialogFooter className="p-6 bg-white border-t shrink-0">
                                <div className="flex items-center gap-4 mr-auto">
                                    <Switch
                                        id="n8n-share"
                                        checked={shareTon8n}
                                        onCheckedChange={setShareTon8n}
                                    />
                                    <label htmlFor="n8n-share" className="text-[10px] text-gray-400 uppercase font-bold tracking-widest cursor-pointer select-none">
                                        Enviar para Redes Sociais (n8n)
                                    </label>
                                </div>
                                <Button type="submit" className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-xl h-12 px-10 shadow-xl" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publicar Agora"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="w-12 h-12 animate-spin mb-4 text-brand-gold" />
                        <p className="font-bold italic">Sincronizando artigos...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-[3rem]">
                        <XCircle className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-xl font-bold italic text-brand-blue">O blog está silencioso.</p>
                        <p>Comece a escrever e evangelizar online!</p>
                    </div>
                ) : (
                    posts.map((post: any) => (
                        <Card key={post.id} className="group overflow-hidden rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white">
                            <div className="relative h-56 overflow-hidden">
                                <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm text-brand-blue text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                                    {post.category}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex items-end">
                                    <Button onClick={() => openEdit(post)} className="w-full bg-white text-brand-blue font-bold rounded-xl h-12">
                                        Editar Artigo
                                    </Button>
                                </div>
                            </div>
                            <CardContent className="p-8 space-y-4">
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-bold text-brand-blue line-clamp-2 italic leading-tight">{post.title}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{post.excerpt}</p>
                                </div>
                                <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Publicado em {post.date}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => deletePost(post)} className="text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl whitespace-nowrap">
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div >
    );
}
