"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, MessageCircle, ChevronDown, Instagram, Facebook, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = {
    name: string;
    href?: string;
    children?: { name: string; href: string }[];
};

const defaultNavLinks: NavItem[] = [
    {
        name: "Quem Somos",
        children: [
            { name: "Sobre Nós", href: "/quem-somos" },
            { name: "A RCC", href: "/a-rcc" },
            { name: "História da RCC", href: "/historia-da-rcc" },
            { name: "Conselho Diocesano", href: "/quem-somos/conselho" },
        ]
    },
    { name: "Grupos", href: "/grupos" },
    { name: "Ministérios", href: "/ministerios" },
    {
        name: "Formação",
        children: [
            { name: "Processo Formativo", href: "/formacao" },
            { name: "Seminário de Vida", href: "/formacao/seminario-de-vida" },
        ]
    },
    { name: "Blog", href: "/blog" },
    {
        name: "Eventos",
        children: [
            { name: "Calendário Diocesano", href: "/calendario" },
        ]
    },
    { name: "Contato", href: "/contato" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
    const [navLinks, setNavLinks] = useState<NavItem[]>(defaultNavLinks);

    useEffect(() => {
        console.log("Navbar: v2 (Dynamic Pages) loaded");
        fetchDynamicPages();
    }, []);

    const fetchDynamicPages = async () => {
        const { data, error } = await supabase
            .from("custom_pages")
            .select("title, slug, parent_menu")
            .eq("is_published", true);

        if (!error && data) {
            const normalize = (str: string) =>
                str.toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, "-");

            const updatedLinks = defaultNavLinks.map(link => {
                const dynamicChildren = data
                    .filter(p => normalize(p.parent_menu || "") === normalize(link.name))
                    .map(p => ({
                        name: p.title,
                        href: p.slug === 'festa-rei-jesus' ? '/festa-rei-jesus' : `/p/${p.slug}`
                    }));

                if (dynamicChildren.length > 0) {
                    return {
                        ...link,
                        children: [...(link.children || []), ...dynamicChildren]
                    };
                }
                return link;
            });
            setNavLinks(updatedLinks);
        }
    };

    const toggleMobileSubmenu = (name: string) => {
        setMobileSubmenu(mobileSubmenu === name ? null : name);
    };

    return (
        <nav className="bg-white border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src="/logo-diocese.png"
                                alt="RCC Diocese de Sinop Logo"
                                className="w-16 h-16 object-contain"
                            />
                            <span className="hidden sm:block text-2xl font-bold text-brand-blue tracking-tighter">
                                RCC Diocese de Sinop
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-6">
                        {navLinks.map((link) => {
                            if (link.children) {
                                return (
                                    <DropdownMenu key={link.name}>
                                        <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-brand-blue transition-colors outline-none">
                                            {link.name}
                                            <ChevronDown className="w-4 h-4" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-white">
                                            {link.children.map((child) => (
                                                <DropdownMenuItem key={child.name} asChild>
                                                    <Link href={child.href} className="w-full cursor-pointer hover:text-brand-blue hover:bg-slate-50 px-3 py-2 text-sm">
                                                        {child.name}
                                                    </Link>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                );
                            }
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href!}
                                    className="text-sm font-medium text-gray-700 hover:text-brand-blue transition-colors"
                                >
                                    {link.name}
                                </Link>
                            );
                        })}

                        <div className="flex items-center gap-4 px-2 border-x border-gray-100">
                            <a href="https://www.instagram.com/rccdiocesedesinop" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-gold transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://www.facebook.com/rccdiocesedesinop" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-gold transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://www.youtube.com/@RCCDiocesedesinop" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-gold transition-colors">
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>

                        <a href="https://wa.me/5566992324636" target="_blank" rel="noopener noreferrer">
                            <Button className="bg-[#25D366] hover:bg-[#20ba5a] text-white gap-2 rounded-full px-6">
                                <MessageCircle className="w-4 h-4 fill-current" />
                                Fale agora conosco
                            </Button>
                        </a>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="lg:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-brand-blue p-2"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden bg-white border-t p-4 space-y-2 shadow-xl animate-in slide-in-from-top duration-300 max-h-[80vh] overflow-y-auto">
                    {navLinks.map((link) => {
                        if (link.children) {
                            return (
                                <div key={link.name} className="space-y-1">
                                    <button
                                        onClick={() => toggleMobileSubmenu(link.name)}
                                        className="flex items-center justify-between w-full text-base font-medium text-gray-700 hover:text-brand-blue py-2"
                                    >
                                        {link.name}
                                        <ChevronDown className={`w-4 h-4 transition-transform ${mobileSubmenu === link.name ? "rotate-180" : ""}`} />
                                    </button>
                                    {mobileSubmenu === link.name && (
                                        <div className="pl-4 space-y-2 border-l-2 border-brand-blue/10 ml-1">
                                            {link.children.map((child) => (
                                                <Link
                                                    key={child.name}
                                                    href={child.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className="block text-sm text-gray-600 hover:text-brand-blue py-1"
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        return (
                            <Link
                                key={link.name}
                                href={link.href!}
                                onClick={() => setIsOpen(false)}
                                className="block text-base font-medium text-gray-700 hover:text-brand-blue py-2"
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                    <div className="pt-4 border-t mt-2 space-y-4">
                        <div className="flex justify-center gap-8 py-2">
                            <a href="https://www.instagram.com/rccdiocesedesinop" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-gold transition-colors">
                                <Instagram className="w-6 h-6" />
                            </a>
                            <a href="https://www.facebook.com/rccdiocesedesinop" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-gold transition-colors">
                                <Facebook className="w-6 h-6" />
                            </a>
                            <a href="https://www.youtube.com/@RCCDiocesedesinop" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-gold transition-colors">
                                <Youtube className="w-6 h-6" />
                            </a>
                        </div>
                        <a href="https://wa.me/5566992324636" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="block">
                            <Button className="w-full bg-[#25D366] text-white gap-2 rounded-xl py-6 text-lg">
                                <MessageCircle className="w-5 h-5 fill-current" />
                                Fale agora conosco
                            </Button>
                        </a>
                    </div>
                </div>
            )}
        </nav>
    );
}
