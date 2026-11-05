import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { BlogListClient } from "./BlogListClient";

export const metadata: Metadata = {
    title: "Blog e Notícias | RCC Mato Grosso",
    description: "Acompanhe as últimas notícias, formações e eventos da Renovação Carismática Católica no Mato Grosso.",
};

export const revalidate = 0;

async function getPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('date', { ascending: false })
        .order('id', { ascending: false });

    if (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
    return data || [];
}

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <div className="flex flex-col">
            {/* Header */}
            <section className="bg-brand-blue py-20 text-white text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-5xl font-bold mb-6 italic text-brand-gold">Blog e Notícias</h1>
                    <p className="text-xl text-blue-100">
                        Acompanhe as últimas notícias, formações e eventos do nosso grupo.
                    </p>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-24 bg-white">
                <BlogListClient posts={posts} />
            </section>
        </div>
    );
}
