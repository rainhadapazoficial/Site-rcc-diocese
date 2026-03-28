"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Users,
    Newspaper,
    Calendar,
    Mail,
    ArrowUpRight,
    Heart,
    Activity,
    Loader2,
    Clock,
    RefreshCw,
    CheckCircle2,
    XCircle
} from "lucide-react";
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        posts: 0,
        events: 0,
        groups: 0,
        totalViews: 0,
        pageViews: [] as any[],
        lastSync: null as any
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            setIsLoading(true);

            // Buscar dados de analytics
            const { data: viewsData } = await supabase
                .from("page_views")
                .select("*")
                .order("views", { ascending: false })
                .limit(10);

            const [
                { count: postsCount },
                { count: eventsCount },
                { count: groupsCount },
                { data: lastSync }
            ] = await Promise.all([
                supabase.from("posts").select("*", { count: 'exact', head: true }),
                supabase.from("events").select("*", { count: 'exact', head: true }),
                supabase.from("groups").select("*", { count: 'exact', head: true }),
                supabase.from("sync_logs").select("*").order("created_at", { ascending: false }).limit(1).single()
            ]);

            const totalViews = (viewsData as any[])?.reduce((acc: number, curr: any) => acc + (curr.views || 0), 0) || 0;

            setStats({
                posts: postsCount || 0,
                events: eventsCount || 0,
                groups: groupsCount || 0,
                totalViews,
                pageViews: viewsData || [],
                lastSync: lastSync || null
            });
            setIsLoading(false);
        }

        fetchDashboardData();
    }, []);

    const kpis = [
        { title: "Notícias", value: stats.posts, icon: Newspaper, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Eventos", value: stats.events, icon: Calendar, color: "text-brand-gold", bg: "bg-amber-50" },
        { title: "Visualizações Totais", value: stats.totalViews.toLocaleString(), icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Grupos de Oração", value: stats.groups, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    ];

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-12 h-12 animate-spin mb-4 text-brand-gold" />
                <p className="font-bold italic">Carregando métricas premium...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-blue italic">Dashboard Premium</h1>
                    <p className="text-gray-500">Inteligência de acesso e resumo da RCC Diocese de Sinop.</p>
                </div>
                {stats.lastSync && (
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 italic">
                        <div className={`p-1.5 rounded-full ${stats.lastSync.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {stats.lastSync.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </div>
                        <div className="text-[10px]">
                            <p className="font-bold text-slate-700 uppercase tracking-widest">Sincronização RCC Brasil</p>
                            <p className="text-slate-500">
                                {new Date(stats.lastSync.created_at).toLocaleString('pt-BR')} • {stats.lastSync.entries_synced} items
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map((stat) => (
                    <Card key={stat.title} className="rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all group overflow-hidden bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-brand-blue">{stat.value}</div>
                            <p className="text-[10px] text-gray-400 mt-2 font-medium flex items-center gap-1 uppercase tracking-tighter">
                                métrica de impacto <ArrowUpRight className="w-3 h-3" />
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Analytics Chart */}
                <Card className="col-span-4 rounded-[3.5rem] border-none shadow-sm overflow-hidden p-10 bg-white">
                    <CardHeader className="px-0 pt-0">
                        <div className="flex items-center justify-between border-b pb-6">
                            <div>
                                <CardTitle className="text-2xl font-bold text-brand-blue italic">Fluxo de Acessos</CardTitle>
                                <CardDescription>Páginas mais visualizadas pelos fiéis</CardDescription>
                            </div>
                            <Activity className="w-8 h-8 text-brand-gold opacity-20" />
                        </div>
                    </CardHeader>
                    <div className="h-[350px] mt-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.pageViews} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                                <YAxis dataKey="slug" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666', fontWeight: 'bold' }} width={100} />
                                <Tooltip
                                    cursor={{ fill: '#f8f8f8' }}
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '15px' }}
                                />
                                <Bar dataKey="views" fill="#004d2c" radius={[0, 15, 15, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Ranking List */}
                <Card className="col-span-3 rounded-[3.5rem] border-none shadow-sm p-10 bg-white">
                    <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between border-b pb-6">
                        <div>
                            <CardTitle className="text-2xl font-bold text-brand-blue italic">Ranking de Páginas</CardTitle>
                            <CardDescription>Top 5 caminhos mais buscados</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 mt-8">
                        <div className="space-y-6">
                            {stats.pageViews.slice(0, 5).map((page, index) => (
                                <div key={page.id} className="flex items-center gap-6 p-5 rounded-[2rem] hover:bg-gray-50 transition-all group border border-transparent hover:border-slate-100">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm ${index === 0 ? 'bg-brand-gold text-white' :
                                            index === 1 ? 'bg-slate-200 text-slate-600' :
                                                'bg-slate-50 text-slate-400'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-bold text-brand-blue truncate uppercase tracking-tight">
                                            {page.slug === '/' ? 'Página Inicial' : page.slug.replace('/', '')}
                                        </p>
                                        <p className="text-xs text-brand-blue/50 font-mono">
                                            {page.views} visualizações
                                        </p>
                                    </div>
                                    <div className="text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
