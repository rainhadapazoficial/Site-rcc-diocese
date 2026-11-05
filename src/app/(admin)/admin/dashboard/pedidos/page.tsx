"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface PrayerRequest {
    id: number;
    created_at: string;
    name: string;
    email?: string;
    phone?: string;
    message: string;
}

export default function PedidosPage() {
    const [pedidos, setPedidos] = useState<PrayerRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchPedidos() {
            setIsLoading(true);
            const { data } = await supabase
                .from('prayer_requests')
                .select('*')
                .order('created_at', { ascending: false });
            setPedidos((data as PrayerRequest[]) || []);
            setIsLoading(false);
        }
        fetchPedidos();
    }, []);

    return (
        <div className="p-6">
            <Card className="rounded-3xl shadow-lg border-none bg-white">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-brand-blue">Pedidos de Oração</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-12 flex justify-center items-center text-gray-400 gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
                            <span>Carregando pedidos de oração...</span>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b-2">
                                    <TableHead className="font-bold text-brand-blue">Data</TableHead>
                                    <TableHead className="font-bold text-brand-blue">Nome</TableHead>
                                    <TableHead className="font-bold text-brand-blue">Contato</TableHead>
                                    <TableHead className="font-bold text-brand-blue">Pedido</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pedidos.map((p) => (
                                    <TableRow key={p.id} className="hover:bg-blue-50/50 transition-colors">
                                        <TableCell className="font-medium">{new Date(p.created_at).toLocaleDateString('pt-BR')}</TableCell>
                                        <TableCell className="font-semibold">{p.name}</TableCell>
                                        <TableCell className="text-xs text-gray-500">{p.phone || p.email || "-"}</TableCell>
                                        <TableCell className="max-w-xl text-gray-600 italic">&ldquo;{p.message}&rdquo;</TableCell>
                                    </TableRow>
                                ))}
                                {pedidos.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                                            Nenhum pedido de oração recebido ainda.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
