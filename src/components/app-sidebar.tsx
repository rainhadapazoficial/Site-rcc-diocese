"use client";

import * as React from "react";
import { Newspaper, Calendar, LayoutDashboard, Mail, LogOut, Settings, Heart, Image as ImageIcon, Monitor, Crown, Users, Flame, History, Globe, GraduationCap, MapPin, Database } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";

const data = {
    navMain: [
        {
            title: "Dashboard",
            url: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Notícias",
            url: "/admin/dashboard/noticias",
            icon: Newspaper,
        },
        {
            title: "Banner Início",
            url: "/admin/dashboard/banners",
            icon: Monitor,
        },
        {
            title: "Grupos de Oração",
            url: "/admin/dashboard/grupos",
            icon: Heart,
        },
        {
            title: "Foranias",
            url: "/admin/dashboard/foranias",
            icon: MapPin,
        },
        {
            title: "Festa do Rei Jesus",
            url: "/admin/dashboard/festa-rei-jesus",
            icon: Crown,
        },
        {
            title: "Calendário Diocesano",
            url: "/admin/dashboard/calendario",
            icon: Calendar,
        },
        {
            title: "Páginas",
            items: [
                { title: "A RCC", url: "/admin/dashboard/a-rcc", icon: LayoutDashboard },
                { title: "Sobre Nós", url: "/admin/dashboard/quem-somos", icon: Users },
                { title: "História da RCC", url: "/admin/dashboard/historia-da-rcc", icon: History },
                { title: "Formação", url: "/admin/dashboard/formacao", icon: GraduationCap },
                { title: "Seminário de Vida", url: "/admin/dashboard/formacao/seminario-de-vida", icon: Flame },
            ]
        },
    ],
    projects: [
        {
            title: "Ver Site Público",
            url: "/",
            icon: Heart,
        },
        {
            title: "Gerenciar Páginas",
            url: "/admin/dashboard/paginas",
            icon: Globe,
        },
        {
            title: "Editor SQL",
            url: "/admin/dashboard/sql",
            icon: Database,
        },
        {
            title: "Ministérios",
            url: "/admin/dashboard/ministerios",
            icon: Flame,
        },
        {
            title: "Conselho Diocesano",
            url: "/admin/dashboard/conselho",
            icon: Users,
        },
        {
            title: "Configurações",
            url: "/admin/dashboard/configuracoes",
            icon: Settings,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
    };

    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-brand-blue/5">
            <SidebarHeader className="bg-brand-blue text-white py-6">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 px-3">
                            <img
                                src="/logo-diocese.png"
                                alt="Logo RCC"
                                className="w-10 h-10 rounded-xl object-contain bg-white p-1 shadow-lg"
                            />
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate text-xs font-bold uppercase tracking-widest text-blue-200">Painel Administrativo</span>
                            </div>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="p-4">
                <SidebarMenu className="space-y-4">
                    <div className="space-y-1">
                        <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Principal</div>
                        {data.navMain.filter(item => !item.items).map((item: any) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton tooltip={item.title} asChild className="h-12 rounded-xl hover:bg-brand-blue/5 hover:text-brand-blue transition-all group">
                                    <Link href={item.url}>
                                        <item.icon className="group-hover:text-brand-gold transition-colors" />
                                        <span className="font-medium">{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </div>

                    <div className="space-y-1">
                        <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Páginas Institucionais</div>
                        {data.navMain.find(i => i.title === "Páginas")?.items?.map((item: any) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton tooltip={item.title} asChild className="h-12 rounded-xl hover:bg-brand-blue/5 hover:text-brand-blue transition-all group">
                                    <Link href={item.url}>
                                        <item.icon className="group-hover:text-brand-gold transition-colors" />
                                        <span className="font-medium">{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </div>
                </SidebarMenu>
                <SidebarMenu className="mt-8 space-y-1">
                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sistema</div>
                    {data.projects.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton tooltip={item.title} asChild className="h-12 rounded-xl hover:bg-brand-blue/5 hover:text-brand-blue transition-all group">
                                <Link href={item.url}>
                                    <item.icon className="group-hover:text-brand-gold transition-colors" />
                                    <span className="font-medium">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t border-gray-50">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Sair"
                            onClick={handleLogout}
                            className="h-12 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                            <LogOut />
                            <span className="font-bold">Sair do Painel</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
