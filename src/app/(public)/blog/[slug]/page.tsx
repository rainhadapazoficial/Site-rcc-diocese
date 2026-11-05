import { supabase } from "@/lib/supabase";
import parse from "html-react-parser";
import { sanitizeHtml } from "@/lib/sanitize";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const revalidate = 60;

async function getPost(slugOrId: string) {
    // Try to find by slug
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slugOrId)
        .single();

    // Fallback try to find by ID if slug fails (for legacy links)
    if (error || !data) {
        const isNumeric = /^\d+$/.test(slugOrId);
        if (isNumeric) {
            const { data: idData, error: idError } = await supabase
                .from('posts')
                .select('*')
                .eq('id', parseInt(slugOrId))
                .single();

            if (!idError && idData) return idData;
        }
        return null;
    }

    return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) return { title: "Post não encontrado" };

    return {
        title: post.title,
        description: post.excerpt || post.content?.substring(0, 160).replace(/<[^>]*>/g, ""),
        openGraph: {
            title: post.title,
            description: post.excerpt || post.content?.substring(0, 160).replace(/<[^>]*>/g, ""),
            images: [post.image_url || ""],
            type: "article",
            publishedTime: post.date || post.created_at,
        },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    return (
        <article className="min-h-screen bg-white">
            {/* Hero Header */}
            <section className="relative h-[60vh] min-h-[400px] w-full bg-brand-blue overflow-hidden">
                <img
                    src={post.image_url || "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=2000"}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-blue via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8 pb-16">
                    <div className="max-w-4xl mx-auto">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-brand-gold hover:text-white transition-colors mb-8 font-bold text-sm uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-4 h-4" /> Voltar ao Blog
                        </Link>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="bg-brand-gold text-white text-[10px] font-bold uppercase px-4 py-1.5 rounded-full shadow-lg">
                                {post.category || "Notícia"}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight italic">
                            {post.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-8 text-blue-100 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-brand-gold" />
                                {new Date(post.date || post.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-brand-gold" />
                                {post.author || "Coordenação Diocesana"}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Excerpt/Intro */}
                    {post.excerpt && (
                        <div className="mb-12 p-8 bg-gray-50 border-l-4 border-brand-gold rounded-r-3xl text-xl text-gray-700 italic leading-relaxed">
                            "{post.excerpt}"
                        </div>
                    )}

                    {/* Main Body */}
                    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl prose-blue max-w-none prose-headings:text-brand-blue prose-headings:italic prose-a:text-brand-gold prose-img:rounded-3xl prose-img:shadow-2xl">
                        {typeof post.content === 'string' && post.content.startsWith('<')
                            ? parse(sanitizeHtml(post.content))
                            : <p className="whitespace-pre-wrap">{post.content}</p>
                        }
                    </div>

                    {/* Footer / Tags */}
                    <div className="mt-20 pt-10 border-t flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-3">
                            <Tag className="w-5 h-5 text-brand-gold" />
                            <div className="flex gap-2">
                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{post.category}</span>
                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Espiritualidade</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-brand-blue uppercase tracking-widest">Compartilhar:</span>
                            <div className="flex gap-2">
                                {/* Social links here if needed */}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </article>
    );
}
