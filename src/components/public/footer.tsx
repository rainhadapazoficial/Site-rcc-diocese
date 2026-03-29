import Link from "next/link";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Radio, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
    return (
        <footer className="bg-brand-blue text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Logo & Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo-diocese.png"
                                alt="RCC Diocese de Sinop Logo"
                                className="w-14 h-14 object-contain"
                            />
                        </div>
                        <p className="text-blue-100 text-sm leading-relaxed">
                            Renovação Carismática Católica da Diocese de Sinop/MT. <br />
                            Um lugar de encontro, oração e renovação espiritual.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/rccdiocesedesinop" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://www.facebook.com/rccdiocesedesinop" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://www.youtube.com/@RCCDiocesedesinop" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors">
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-brand-gold">Links Rápidos</h3>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/quem-somos" className="hover:underline">Quem Somos</Link></li>
                            <li><Link href="/blog" className="hover:underline">Blog e Notícias</Link></li>
                            <li><Link href="/eventos" className="hover:underline">Calendário de Eventos</Link></li>
                            <li><Link href="/p/apoie-nossa-missao" className="font-bold text-brand-gold hover:underline">Apoie Nossa Missão</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-brand-gold">Recursos</h3>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/p/politica-de-privacidade" className="hover:underline opacity-80">Política de Privacidade</Link></li>
                            <li><Link href="/p/termos-de-uso" className="hover:underline opacity-80">Termos de Uso</Link></li>
                            <li><Link href="/admin/login" className="hover:underline">Painel Administrativo</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-brand-gold">Contato</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-brand-gold flex-shrink-0" />
                                <span>Av. das Palmeiras, 2697 – Jardim Imperial <br /> Sinop – MT, CEP: 78555-020</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-brand-gold flex-shrink-0" />
                                <a href="https://wa.me/5566992324636" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors">
                                    (66) 99232-4636 (Escritório Diocesano)
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-brand-gold flex-shrink-0" />
                                <span>coordenacao@rccdesinop.com.br</span>
                            </li>
                            <li className="pt-4">
                                <a href="https://wa.me/5566992324636" target="_blank" rel="noopener noreferrer">
                                    <Button className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold gap-2 w-full">
                                        <MessageCircle className="w-5 h-5 fill-current" />
                                        Fale agora conosco
                                    </Button>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-blue-800 text-center text-xs text-blue-200">
                    <p>Renovação Carismática Católica da Diocese de Sinop - CNPJ: 03.162.415/0001-50</p>
                    <p className="mt-2 text-[10px] opacity-70">
                        Feito sob a luz do Espírito Santo e com Inteligência Artificial.
                    </p>
                    <p className="mt-1 text-[10px] opacity-50">&copy; {new Date().getFullYear()} RCC Diocese de Sinop. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
