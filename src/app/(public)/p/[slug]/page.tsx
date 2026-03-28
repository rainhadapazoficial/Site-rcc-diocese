import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import parse from "html-react-parser";
import { Metadata } from "next";

export const revalidate = 60; // Revalidate every minute

async function getPageData(slug: string) {
    const { data, error } = await supabase
        .from("custom_pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

    if (error || !data) return null;
    return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const page = await getPageData(slug);

    if (!page) return { title: "Página não encontrada" };

    return {
        title: page.title,
        description: `Saiba mais sobre ${page.title} na RCC Diocese de Sinop, Mato Grosso.`,
        openGraph: {
            title: page.title,
            description: `Saiba mais sobre ${page.title} na RCC Diocese de Sinop.`,
            type: "website",
        },
    };
}

export default async function CustomDynamicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const page = await getPageData(slug);

    if (!page) {
        notFound();
    }

    return (
        <div className="flex flex-col">
            {/* Header */}
            <section className="bg-brand-blue py-20 text-white text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-5xl font-bold mb-6 italic text-brand-gold">{page.title}</h1>
                    <div className="w-24 h-1 bg-brand-gold mx-auto rounded-full" />
                </div>
            </section>

            {/* Content */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4">
                    <article className="prose prose-lg max-w-none prose-headings:text-brand-blue prose-p:text-gray-600 prose-img:rounded-3xl prose-img:shadow-xl">
                        {parse(page.content)}
                    </article>
                </div>
            </section>
        </div>
    );
}

export async function generateStaticParams() {
    const { data } = await supabase.from("custom_pages").select("slug");
    return data?.map((p: any) => ({ slug: p.slug })) || [];
}
