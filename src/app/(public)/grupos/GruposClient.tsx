"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    Users, MapPin, Calendar, Clock, Phone, Globe,
    Facebook, Instagram, Search, MessageCircle, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";

export default function GruposClient() {
    const [groups, setGroups] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [pageSettings, setPageSettings] = useState<any>({
        title: "Grupos de Oração",
        subtitle: "Encontre um Grupo de Oração da Renovação Carismática Católica mais próximo de você e venha vivenciar Pentecostes!",
        image_url: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=2000&auto=format&fit=crop"
    });

    useEffect(() => {
        fetchGroups();
        fetchPageSettings();
    }, []);

    async function fetchPageSettings() {
        const { data } = await supabase
            .from("site_settings")
            .select("value")
            .eq("key", "groups_page")
            .single();

        if (data) setPageSettings(data.value);
    }

    async function fetchGroups() {
        setIsLoading(true);
        const { data: groupsData, error: groupsError } = await supabase
            .from("groups")
            .select("*")
            .order("nome", { ascending: true });

        if (groupsError) {
            console.error("Error fetching groups:", groupsError);
            setIsLoading(false);
            return;
        }

        const groupsList = groupsData || [];
        if (groupsList.length === 0) {
            setGroups([]);
            setIsLoading(false);
            return;
        }

        const ids = groupsList.map((g: { id: number }) => g.id);
        const { data: historyData } = await supabase
            .from("group_coordinator_history")
            .select("group_id, nome, gestao, foto_url, mandato_id, ordem")
            .in("group_id", ids)
            .order("ordem", { ascending: true });

        const historyByGroup: Record<number, any[]> = {};
        (historyData || []).forEach((row: any) => {
            if (!historyByGroup[row.group_id]) historyByGroup[row.group_id] = [];
            historyByGroup[row.group_id].push({
                nome: row.nome,
                gestao: row.gestao,
                foto_url: row.foto_url,
                mandato_id: row.mandato_id
            });
        });

        setGroups(groupsList.map((g: any) => ({ ...g, coordinatorHistory: historyByGroup[g.id] || [] })));
        setIsLoading(false);
    }

    const filteredGroups = groups.filter(g =>
        g.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.cidade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Hero Section */}
            <div
                className="relative text-white py-24 px-4 overflow-hidden bg-brand-blue"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 77, 44, 0.8), rgba(0, 77, 44, 0.9)), url(${pageSettings.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <div className="max-w-7xl mx-auto text-center space-y-6 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold italic tracking-tight">
                        {pageSettings.title.split(' ').map((word: string, i: number) =>
                            word.toLowerCase() === 'oração' ? <span key={i} className="text-brand-gold"> {word}</span> : i === 0 ? word : ` ${word}`
                        )}
                    </h1>
                    <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                        {pageSettings.subtitle}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12 -mt-10">
                {/* Search Bar */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl mb-12 flex flex-col md:flex-row gap-4 items-center border border-brand-blue/5">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Buscar por nome do grupo ou cidade..."
                            className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Groups Grid */}
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="font-bold italic">Carregando grupos...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredGroups.length > 0 ? (
                            filteredGroups.map((group) => (
                                <Card key={group.id} className="group overflow-hidden rounded-[3rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white flex flex-col">
                                    <CardContent className="p-8 space-y-6 flex-1 flex flex-col">
                                        <div className="flex items-center gap-4">
                                            {group.imagem && group.imagem.length > 10 ? (
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm shrink-0">
                                                    <img src={group.imagem} alt={group.nome} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 bg-brand-blue/5 rounded-2xl flex items-center justify-center group-hover:bg-brand-blue transition-colors duration-500 shrink-0">
                                                    <Users className="w-8 h-8 text-brand-blue group-hover:text-white transition-colors duration-500" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-2xl font-bold text-brand-blue italic line-clamp-1">{group.nome}</h3>
                                                <p className="text-brand-gold font-bold flex items-center gap-1 uppercase tracking-widest text-[10px]">
                                                    <MapPin className="w-3 h-3" /> {group.cidade}
                                                </p>
                                            </div>
                                        </div>

                                        {group.descricao && (
                                            <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                                                {group.descricao}
                                            </p>
                                        )}

                                        <div className="space-y-4 text-gray-600">
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                                                <Clock className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400">Quando acontece</p>
                                                    <p className="font-medium">{group.dia}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                                                <MapPin className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400">Localização</p>
                                                    <p className="font-medium">{group.local}</p>
                                                </div>
                                            </div>
                                            {group.coordenador && (
                                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-brand-blue/10">
                                                        <img
                                                            src={group.coordenador_foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(group.coordenador)}&background=1e3a5f&color=fff`}
                                                            alt={group.coordenador}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] uppercase font-bold text-gray-400">Coordenação atual</p>
                                                        <p className="font-medium truncate">{group.coordenador}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {group.coordinatorHistory && group.coordinatorHistory.length > 0 && (
                                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                                                    <History className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Histórico de coordenadores</p>
                                                        <ul className="text-sm text-gray-600 space-y-0.5">
                                                            {group.coordinatorHistory.map((h: { nome: string; gestao: string }, i: number) => (
                                                                <li key={i} className="flex flex-wrap gap-1">
                                                                    <span className="font-medium">{h.nome}</span>
                                                                    <span className="text-gray-400">({h.gestao})</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-6 mt-auto space-y-4">
                                            <div className="flex gap-2 justify-center">
                                                {group.whatsapp && (
                                                    <a href={group.whatsapp} target="_blank" rel="noopener noreferrer" className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all transform hover:scale-110">
                                                        <MessageCircle className="w-5 h-5 fill-current" />
                                                    </a>
                                                )}
                                                {group.instagram && (
                                                    <a href={group.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-600 hover:text-white transition-all transform hover:scale-110">
                                                        <Instagram className="w-5 h-5" />
                                                    </a>
                                                )}
                                                {group.facebook && (
                                                    <a href={group.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110">
                                                        <Facebook className="w-5 h-5" />
                                                    </a>
                                                )}
                                                {group.site && (
                                                    <a href={group.site} target="_blank" rel="noopener noreferrer" className="p-3 bg-brand-blue/5 text-brand-blue rounded-xl hover:bg-brand-blue hover:text-white transition-all transform hover:scale-110">
                                                        <Globe className="w-5 h-5" />
                                                    </a>
                                                )}
                                            </div>

                                            {group.geolocalizacao && (
                                                <a href={group.geolocalizacao} target="_blank" rel="noopener noreferrer" className="block">
                                                    <Button variant="outline" className="w-full h-12 rounded-xl border-brand-blue/10 hover:border-brand-blue hover:bg-brand-blue hover:text-white transition-all gap-2">
                                                        <MapPin className="w-4 h-4" />
                                                        Como Chegar
                                                    </Button>
                                                </a>
                                            )}

                                            <Button
                                                onClick={() => setSelectedGroup(group)}
                                                className="w-full h-12 rounded-xl bg-brand-gold hover:bg-yellow-600 text-brand-blue font-bold shadow-sm"
                                            >
                                                Conhecer Grupo
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-[3rem] bg-white">
                                <Search className="w-16 h-16 mb-4 opacity-10" />
                                <p className="text-xl font-bold italic text-brand-blue">Nenhum grupo encontrado.</p>
                                <p className="text-sm">Tente buscar por outro nome ou cidade.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Details Modal */}
            <Dialog open={!!selectedGroup} onOpenChange={(open) => !open && setSelectedGroup(null)}>
                <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none max-h-[90vh] flex flex-col">
                    {selectedGroup && (
                        <>
                            <div className="relative h-64 shrink-0">
                                {selectedGroup.imagem && selectedGroup.imagem.length > 10 ? (
                                    <img src={selectedGroup.imagem} alt={selectedGroup.nome} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-brand-blue flex items-center justify-center">
                                        <Users className="w-24 h-24 text-white/20" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-6 left-8 right-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-bold text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-md border border-brand-gold/20">
                                            {selectedGroup.cidade}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white italic">{selectedGroup.nome}</h2>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sobre o Grupo</h4>
                                        <p className="text-gray-600 leading-relaxed italic">
                                            {selectedGroup.descricao || "Nenhuma descrição disponível."}
                                        </p>

                                        <div className="pt-4 flex gap-3">
                                            {selectedGroup.whatsapp && (
                                                <a href={selectedGroup.whatsapp} target="_blank" rel="noopener noreferrer" className="p-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all transform hover:scale-110 shadow-sm">
                                                    <MessageCircle className="w-6 h-6 fill-current" />
                                                </a>
                                            )}
                                            {selectedGroup.instagram && (
                                                <a href={selectedGroup.instagram} target="_blank" rel="noopener noreferrer" className="p-4 bg-pink-50 text-pink-600 rounded-2xl hover:bg-pink-600 hover:text-white transition-all transform hover:scale-110 shadow-sm">
                                                    <Instagram className="w-6 h-6" />
                                                </a>
                                            )}
                                            {selectedGroup.facebook && (
                                                <a href={selectedGroup.facebook} target="_blank" rel="noopener noreferrer" className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110 shadow-sm">
                                                    <Facebook className="w-6 h-6" />
                                                </a>
                                            )}
                                            {selectedGroup.site && (
                                                <a href={selectedGroup.site} target="_blank" rel="noopener noreferrer" className="p-4 bg-brand-blue/5 text-brand-blue rounded-2xl hover:bg-brand-blue hover:text-white transition-all transform hover:scale-110 shadow-sm">
                                                    <Globe className="w-6 h-6" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-gray-50 p-6 rounded-[2rem] space-y-4 border border-gray-100">
                                            <div className="flex items-start gap-4">
                                                <Clock className="w-6 h-6 text-brand-blue shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400">Quando</p>
                                                    <p className="font-bold text-brand-blue">{selectedGroup.dia}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <MapPin className="w-6 h-6 text-brand-blue shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400">Local</p>
                                                    <p className="font-bold text-brand-blue">{selectedGroup.local}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 bg-brand-blue/5 p-4 rounded-3xl border border-brand-blue/10">
                                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0">
                                                    <img
                                                        src={selectedGroup.coordenador_foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedGroup.coordenador || "C")}&background=1e3a5f&color=fff`}
                                                        alt={selectedGroup.coordenador}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400">Coordenador(a) Atual</p>
                                                    <p className="font-bold text-brand-blue text-xl">{selectedGroup.coordenador || "A definir"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedGroup.geolocalizacao && (
                                            <a href={selectedGroup.geolocalizacao} target="_blank" rel="noopener noreferrer" className="block">
                                                <Button className="w-full h-14 rounded-2xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold gap-2 shadow-lg transform hover:-translate-y-1 transition-all">
                                                    <MapPin className="w-5 h-5" />
                                                    Como chegar pelo GPS
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {selectedGroup.coordinatorHistory && selectedGroup.coordinatorHistory.length > 0 && (
                                    <div className="space-y-4 pt-4">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <History className="w-4 h-4 text-brand-blue" />
                                            Histórico de Coordenação
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {selectedGroup.coordinatorHistory.map((h: any, i: number) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group/hist">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-200 group-hover/hist:border-brand-gold transition-colors">
                                                        <img
                                                            src={h.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(h.nome)}&background=f1f5f9&color=64748b`}
                                                            alt={h.nome}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-brand-blue truncate">{h.nome}</p>
                                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{h.gestao}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
