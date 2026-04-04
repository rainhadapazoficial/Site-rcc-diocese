import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, Heart, Users, Calendar, Newspaper, Radio, Clock, MapPin, Mic2, Baby, Flame, ShieldCheck, BookOpen, Music, Share2, Scale, HandHelping, GraduationCap } from "lucide-react";
import { HeroCarousel } from "@/components/public/HeroCarousel";

export const revalidate = 0;

async function getLatestPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('date', { ascending: false })
        .limit(3);
    if (error) console.error('Error fetching latest posts:', error);
    return data || [];
}

async function getLatestEvents() {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
        .limit(2);
    if (error) console.error('Error fetching latest events:', error);
    return data || [];
}

async function getGroupsByForania() {
    const { data, error } = await supabase
        .from('groups')
        .select(`
            id, nome, cidade, dia, local, slug, forania_id,
            foranias (
                nome
            )
        `);

    if (error) {
        console.error('Error fetching groups by forania:', error);
        return {};
    }

    if (!data) return {};

    const grouped: Record<string, any[]> = {};
    
    // Group them
    data.forEach((group: any) => {
        const foraniaName = group.foranias?.nome || "Outras Regiões";
        if (!grouped[foraniaName]) grouped[foraniaName] = [];
        grouped[foraniaName].push(group);
    });

    // Shuffle each forania and limit to 4
    Object.keys(grouped).forEach(name => {
        grouped[name] = grouped[name]
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
    });

    return grouped;
}

async function getLatestMinistries() {
    const { data, error } = await supabase
        .from('ministerios')
        .select('id, nome, descricao, coordenador, cor, bienio, imagem_url')
        .order('ordem', { ascending: true })
        .limit(6);
    if (error) console.error('Error fetching latest ministries:', error);
    return data || [];
}

const iconMap: Record<string, any> = {
    "Mic2": Mic2,
    "Heart": Heart,
    "Baby": Baby,
    "Flame": Flame,
    "Users": Users,
    "ShieldCheck": ShieldCheck,
    "BookOpen": BookOpen,
    "Music": Music,
    "Share2": Share2,
    "Scale": Scale,
    "HandHelping": HandHelping,
    "GraduationCap": GraduationCap
};

async function getHomeBanners() {
    const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'home_banner')
        .single();

    if (!data?.value) {
        return [{
            title: "RCC Diocese de Sinop",
            subtitle: "Um encontro de amor com o Espírito Santo em Sinop",
            image_url: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=2000&auto=format&fit=crop",
            button1_text: "Conheça nossa História",
            button1_link: "/quem-somos",
            button2_text: "Ver Programação",
            button2_link: "/eventos"
        }];
    }

    return Array.isArray(data.value) ? data.value : [data.value];
}

export default async function HomePage() {
    const [latestPosts, latestEvents, groupsByForania, latestMinistries, banners] = await Promise.all([
        getLatestPosts(),
        getLatestEvents(),
        getGroupsByForania(),
        getLatestMinistries(),
        getHomeBanners()
    ]);

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <HeroCarousel banners={banners} />

            {/* Latest News */}
            <section className="py-24 bg-white text-center">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="mb-16">
                        <h2 className="text-4xl font-bold text-brand-blue italic">Últimas Notícias</h2>
                        <div className="w-24 h-1 bg-brand-gold mx-auto mt-4 rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {latestPosts.length > 0 ? (
                            latestPosts.map((post: any) => (
                                <div key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-2xl transition-all duration-500 flex flex-col">
                                    <Link href={`/blog/${post.slug || post.id}`}>
                                        <div className="h-56 bg-gray-200 relative overflow-hidden">
                                            <img
                                                src={post.image_url || "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1000"}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        </div>
                                    </Link>
                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="w-2 h-2 rounded-full bg-brand-gold" />
                                            <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">{post.category || 'Notícia'}</span>
                                        </div>
                                        <Link href={`/blog/${post.slug || post.id}`}>
                                            <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-brand-blue transition-colors mb-4">
                                                {post.title}
                                            </h3>
                                        </Link>
                                        <p className="text-gray-500 text-sm line-clamp-3 mb-6">
                                            {post.excerpt || (post.content && post.content.substring(0, 100)) || 'Leia mais sobre esta notícia...'}
                                        </p>
                                        <Link href={`/blog/${post.slug || post.id}`} className="mt-auto flex items-center gap-2 text-sm font-bold text-brand-blue hover:text-brand-gold transition-colors group/link">
                                            Ler notícia completa
                                            <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                                <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-400 italic">Nenhuma notícia encontrada no momento.</p>
                            </div>
                        )}
                    </div>

                    <Link href="/blog" className="mt-16 inline-block">
                        <Button variant="outline" className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white px-10 rounded-2xl h-14 font-bold transition-all">
                            Acessar Todas as Notícias
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Upcoming Events / Calendário */}
            <section className="py-24 bg-gray-50 border-t border-gray-100">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-20 text-balance">
                        <h2 className="text-4xl font-bold text-brand-blue italic underline decoration-brand-gold decoration-4 underline-offset-8">Calendário Diocesano e Eventos</h2>
                    </div>

                    <div className="space-y-8">
                        {latestEvents.length > 0 ? (
                            latestEvents.map((event: any) => (
                                <div key={event.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row hover:shadow-xl transition-all duration-500 group">
                                    <div className="bg-brand-blue md:w-40 p-10 flex flex-col items-center justify-center text-white text-center group-hover:bg-brand-gold transition-colors duration-500">
                                        <Calendar className="w-8 h-8 mb-3 opacity-80" />
                                        <span className="text-xl font-black uppercase tracking-tighter">
                                            {event.date.includes('-')
                                                ? new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                                                : event.date.split(',')[0]}
                                        </span>
                                    </div>
                                    <div className="flex-1 p-8 space-y-4">
                                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-brand-blue transition-colors">{event.title}</h3>
                                        <div className="flex flex-wrap gap-6 text-sm">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Clock className="w-5 h-5 text-brand-gold" />
                                                <span className="font-medium">{event.time || "Horário a confirmar"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <MapPin className="w-5 h-5 text-brand-gold" />
                                                <span className="font-medium line-clamp-1">{event.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 flex items-center justify-center bg-gray-50/50">
                                        <Link href="/eventos">
                                            <Button className="rounded-xl border-none bg-brand-blue/5 text-brand-blue hover:bg-brand-blue hover:text-white transition-all font-bold px-6 h-12">
                                                Saber Mais
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-400 italic font-medium">Fique atento! Novas programações em breve.</p>
                            </div>
                        )}
                        <div className="text-center mt-16">
                            <Link href="/eventos">
                                <Button className="bg-brand-blue text-white px-10 h-14 rounded-2xl shadow-lg hover:shadow-brand-blue/20 transition-all font-bold">
                                    Visualizar Calendário Completo
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Grupos de Oração Section */}
            <section id="grupos" className="py-24 bg-brand-blue/5 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-brand-blue italic">Grupos de Oração</h2>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto italic">"Onde dois ou três estiverem reunidos em meu nome, eu estou lá no meio deles." (Mt 18, 20)</p>
                    </div>

                    <div className="space-y-20">
                        {Object.entries(groupsByForania).length > 0 ? (
                            Object.entries(groupsByForania).map(([foraniaName, groups]) => (
                                <div key={foraniaName} className="space-y-8 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-4 mb-4 border-b border-brand-blue/10 pb-4">
                                        <div className="bg-brand-gold w-1.5 h-8 rounded-full hidden md:block" />
                                        <h3 className="text-2xl font-bold text-brand-blue italic">{foraniaName}</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                                        {groups.map((group: any) => (
                                            <div key={group.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col h-full">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all duration-500 flex-shrink-0">
                                                        <Users className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-brand-blue italic leading-tight line-clamp-2">{group.nome}</h4>
                                                        <p className="text-brand-gold font-bold flex items-center gap-1 uppercase tracking-widest text-[9px] mt-1">
                                                            <MapPin className="w-2.5 h-2.5" /> {group.cidade}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 mb-6 text-gray-600 flex-1">
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <Clock className="w-3.5 h-3.5 text-brand-blue" />
                                                        <span className="text-xs font-medium">{group.dia}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                                                        <span className="text-xs font-medium line-clamp-1">{group.local}</span>
                                                    </div>
                                                </div>

                                                <Link href="/grupos">
                                                    <Button className="w-full rounded-xl bg-brand-blue hover:bg-brand-gold text-white transition-all h-10 text-xs font-bold shadow-md shadow-brand-blue/10">
                                                        Ver Detalhes
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-center mt-6">
                                        <Link href="/grupos">
                                            <Button variant="outline" className="border-brand-blue/20 text-brand-blue hover:bg-brand-blue hover:text-white px-8 rounded-xl h-12 font-bold transition-all text-sm">
                                                Ver mais grupos de {foraniaName}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-400 italic">Nenhum grupo cadastrado.</div>
                        )}
                    </div>

                    <div className="mt-20 text-center">
                        <Link href="/grupos">
                            <Button size="lg" className="bg-brand-blue text-white px-12 rounded-full h-14 shadow-xl hover:scale-105 transition-all font-bold">
                                Ver Todos os Grupos da Diocese
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Ministérios Section */}
            <section className="py-24 bg-white text-center border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="mb-16">
                        <h2 className="text-4xl font-bold text-brand-blue italic">Nossos Ministérios</h2>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto italic">Servindo com alegria e guiados pelo Espírito Santo em todas as frentes de missão.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {latestMinistries.length > 0 ? (
                            latestMinistries.map((min: any) => (
                                    <div key={min.id} className="bg-white p-10 rounded-[4rem] shadow-sm border border-gray-100/50 group hover:shadow-2xl transition-all duration-700 flex flex-col relative overflow-hidden h-full">
                                        <div className={`absolute top-0 right-0 w-32 h-32 ${min.cor || 'bg-brand-blue/5'} opacity-10 rounded-bl-full transition-all group-hover:scale-150 group-hover:opacity-20`} />

                                        <div className="flex justify-between items-start mb-8">
                                            {(() => {
                                                const IconComp = iconMap[min.nome.split(' ').pop() || ""] || iconMap[Object.keys(iconMap).find(k => min.nome.includes(k)) || ""] || Flame;
                                                return (
                                                    <div className={`w-16 h-16 rounded-3xl ${min.cor || 'bg-brand-blue/5 text-brand-blue'} flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500`}>
                                                        <IconComp className="w-8 h-8" />
                                                    </div>
                                                );
                                            })()}
                                            {min.bienio && (
                                                <span className="text-[10px] font-bold text-brand-gold bg-brand-gold/5 px-4 py-1.5 rounded-full uppercase tracking-widest border border-brand-gold/10">
                                                    Gestão {min.bienio}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-2xl font-bold text-brand-blue mb-4 italic group-hover:text-brand-gold transition-colors">{min.nome}</h3>
                                        <p className="text-gray-500 text-sm italic mb-10 flex-1 line-clamp-4 leading-relaxed">"{min.descricao}"</p>

                                        <div className="pt-8 border-t border-gray-50 flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-3">
                                                {min.imagem_url ? (
                                                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-brand-blue/5 shadow-sm">
                                                        <img src={min.imagem_url} alt={min.coordenador} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-2xl bg-brand-blue/5 flex items-center justify-center text-brand-blue shadow-sm">
                                                        <div className="text-[10px] items-center flex flex-col">
                                                            <Users className="w-5 h-5 mb-0.5" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Coordenação Atual</p>
                                                    <p className="font-bold text-brand-blue text-base">{min.coordenador || 'A definir'}</p>
                                                </div>
                                            </div>
                                            <Link href="/ministerios">
                                                <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-brand-gold/5 text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all shadow-sm">
                                                    <ChevronRight className="w-6 h-6" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                            ))
                        ) : (
                            <div className="col-span-3 py-12 text-gray-400 italic">Nenhum ministério cadastrado.</div>
                        )}
                    </div>

                    <div className="mt-16 inline-block">
                        <Link href="/ministerios">
                            <Button variant="outline" className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white px-12 rounded-full h-14 font-extrabold transition-all tracking-wider">
                                EXPLORAR TODOS OS MINISTÉRIOS
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
