"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Globe, Eye } from "lucide-react";
import Link from "next/link";

export default function PaginasAdminPage() {
    const [pages, setPages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPages();
    }, []);

    async function fetchPages() {
        const { data, error } = await supabase
            .from("custom_pages")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setPages(data);
        }
        setIsLoading(false);
    }

    async function deletePage(id: number) {
        if (!confirm("Tem certeza que deseja excluir esta página?")) return;

        const { error } = await supabase
            .from("custom_pages")
            .delete()
            .eq("id", id);

        if (!error) {
            fetchPages();
        }
    }

    return (
        <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-brand-blue italic flex items-center gap-3">
                        <Globe className="w-8 h-8 text-brand-gold" />
                        Gerenciar Páginas Dinâmicas
                    </h1>
                    <p className="text-gray-500 text-sm">Crie e edite submenus e páginas personalizadas para o site.</p>
                </div>
                <Link href="/admin/dashboard/paginas/novo">
                    <Button className="bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl px-6">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Nova Página
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6">
                {isLoading ? (
                    <p>Carregando páginas...</p>
                ) : pages.length > 0 ? (
                    pages.map((page: any) => (
                        <Card key={page.id} className="rounded-3xl border-none shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-gray-900">{page.title}</h3>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold uppercase">/{page.slug}</span>
                                        <span>Submenu: <strong className="text-brand-blue">{page.parent_menu || 'Nenhum'}</strong></span>
                                        <span className={page.is_published ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                                            {page.is_published ? "Publicado" : "Rascunho"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/p/${page.slug}`} target="_blank">
                                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-brand-blue">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                    <Link href={`/admin/dashboard/paginas/${page.id}`}>
                                        <Button variant="outline" size="icon" className="rounded-xl border-gray-200 text-brand-blue hover:bg-brand-blue hover:text-white transition-all">
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => deletePage(page.id)}
                                        className="rounded-xl border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                        <p className="text-gray-400 italic">Nenhuma página dinâmica criada ainda.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
