"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube, Heart, Send, Loader2, CheckCircle2 } from "lucide-react";

export default function ContatoClient() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    async function handlePrayerSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus("idle");
        setErrorMessage("");

        try {
            const res = await fetch("/api/prayer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, phone, message }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setSubmitStatus("error");
                setErrorMessage(data.error || "Não foi possível enviar seu pedido. Tente novamente.");
            } else {
                setSubmitStatus("success");
                setName("");
                setEmail("");
                setPhone("");
                setMessage("");
            }
        } catch {
            setSubmitStatus("error");
            setErrorMessage("Erro de conexão ao enviar seu pedido de oração.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col">
            {/* Header */}
            <section className="bg-brand-blue py-24 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=2000')] opacity-10 bg-cover bg-center" />
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <h1 className="text-6xl font-bold mb-6 italic text-brand-gold">Contato</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Estamos aqui para ouvir você. Entre em contato pelos nossos canais oficiais, envie seu pedido de oração ou venha nos visitar.
                    </p>
                </div>
            </section>

            {/* Prayer Request Form Section (#pedido-oracao) */}
            <section id="pedido-oracao" className="py-20 bg-slate-50 border-b border-gray-100 scroll-mt-20">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="bg-white rounded-[3rem] shadow-xl border border-brand-gold/20 p-8 md:p-12">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-1 bg-brand-gold/10 text-brand-gold rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                                <Heart className="w-4 h-4" /> Ministério de Intercessão
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-brand-blue font-serif italic mb-3">
                                Pedido de Oração
                            </h2>
                            <p className="text-gray-600">
                                Confie suas intenções à nossa rede diocesana de intercessores. Rezaremos por você e por sua família.
                            </p>
                        </div>

                        {submitStatus === "success" && (
                            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3 font-medium">
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                                <span>Seu pedido de oração foi recebido com carinho! Nossos intercessores estarão em oração por sua intenção.</span>
                            </div>
                        )}

                        {submitStatus === "error" && (
                            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handlePrayerSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="prayer-name" className="text-brand-blue font-bold">Seu Nome *</Label>
                                    <Input
                                        id="prayer-name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Como podemos chamar você?"
                                        required
                                        maxLength={120}
                                        className="rounded-xl h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="prayer-phone" className="text-brand-blue font-bold">WhatsApp / Telefone (Opcional)</Label>
                                    <Input
                                        id="prayer-phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="(66) 99999-9999"
                                        maxLength={40}
                                        className="rounded-xl h-12"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prayer-email" className="text-brand-blue font-bold">E-mail (Opcional)</Label>
                                <Input
                                    id="prayer-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu-email@exemplo.com"
                                    maxLength={160}
                                    className="rounded-xl h-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prayer-message" className="text-brand-blue font-bold">Sua Intenção ou Pedido de Oração *</Label>
                                <Textarea
                                    id="prayer-message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Escreva aqui seu pedido de oração..."
                                    required
                                    maxLength={3000}
                                    className="rounded-2xl min-h-[130px]"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-14 rounded-2xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-lg shadow-lg shadow-brand-blue/20"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Enviando pedido...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-2 text-brand-gold" />
                                        Enviar Pedido de Oração
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Contact Info Section */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="space-y-12">
                        <div className="text-center">
                            <div className="inline-block px-4 py-1 bg-brand-gold/10 text-brand-gold rounded-full text-sm font-bold uppercase tracking-widest mb-4">
                                Fale Conosco
                            </div>
                            <h2 className="text-4xl font-bold text-brand-blue font-serif italic mb-6">Canais de Atendimento</h2>
                            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                                A Renovação Carismática Católica está presente em toda a Diocese de Sinop, levando a Cultura de Pentecostes às nossas paróquias e comunidades. Atendemos você com alegria através dos nossos canais oficiais abaixo.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 group hover:border-brand-gold transition-colors text-center">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-blue shadow-sm mb-6 mx-auto group-hover:bg-brand-gold group-hover:text-white transition-colors">
                                    <Phone className="w-7 h-7" />
                                </div>
                                <h4 className="font-bold text-brand-blue text-xl mb-2">WhatsApp</h4>
                                <a href="https://wa.me/5566992324636" target="_blank" rel="noopener noreferrer" className="text-brand-blue font-bold text-lg hover:text-brand-gold transition-colors underline decoration-brand-gold/30">
                                    (66) 99232-4636
                                </a>
                            </div>

                            <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 group hover:border-brand-gold transition-colors text-center">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-blue shadow-sm mb-6 mx-auto group-hover:bg-brand-gold group-hover:text-white transition-colors">
                                    <Mail className="w-7 h-7" />
                                </div>
                                <h4 className="font-bold text-brand-blue text-xl mb-2">E-mail</h4>
                                <p className="text-brand-blue font-bold">coordenacao@rccdesinop.com.br</p>
                            </div>

                            <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 group hover:border-brand-gold transition-colors text-center sm:col-span-2">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-blue shadow-sm mb-6 mx-auto group-hover:bg-brand-gold group-hover:text-white transition-colors">
                                    <MapPin className="w-7 h-7" />
                                </div>
                                <h4 className="font-bold text-brand-blue text-xl mb-2">Escritório Diocesano</h4>
                                <p className="text-gray-600 mb-2">Av. das Palmeiras, 2697 – Jardim Imperial</p>
                                <p className="text-gray-600 font-medium">Sinop – MT | CEP: 78555-020</p>
                            </div>

                            <div className="p-8 bg-gradient-to-br from-pink-50 to-orange-50 rounded-[2.5rem] border border-orange-100 group hover:scale-[1.02] transition-all text-center">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-sm mb-6 mx-auto group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                    <Instagram className="w-7 h-7" />
                                </div>
                                <h4 className="font-bold text-gray-800 text-xl mb-2">Instagram</h4>
                                <a href="https://instagram.com/rccdiocesedesinop" target="_blank" rel="noopener noreferrer" className="text-gray-600 italic hover:text-brand-blue transition-colors block">
                                    @rccdiocesedesinop
                                </a>
                            </div>

                            <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2.5rem] border border-blue-100 group hover:scale-[1.02] transition-all text-center">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-6 mx-auto group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Facebook className="w-7 h-7" />
                                </div>
                                <h4 className="font-bold text-gray-800 text-xl mb-2">Facebook</h4>
                                <a href="http://facebook.com/rccdiocesedesinop" target="_blank" rel="noopener noreferrer" className="text-gray-600 italic hover:text-brand-blue transition-colors block">
                                    rccdiocesedesinop
                                </a>
                            </div>

                            <div className="p-8 bg-gradient-to-br from-red-50 to-rose-50 rounded-[2.5rem] border border-red-100 group hover:scale-[1.02] transition-all text-center sm:col-span-2">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm mb-6 mx-auto group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <Youtube className="w-7 h-7" />
                                </div>
                                <h4 className="font-bold text-gray-800 text-xl mb-2">YouTube</h4>
                                <a href="https://www.youtube.com/@RCCDiocesedesinop" target="_blank" rel="noopener noreferrer" className="text-gray-600 italic hover:text-brand-blue transition-colors block">
                                    @RCCDiocesedesinop
                                </a>
                            </div>
                        </div>

                        {/* Google Maps Embed */}
                        <div className="mt-16 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3923.364426563604!2d-55.5126849!3d-11.8546559!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9330663414986427%3A0xe6709793ee5edc6b!2sAv.%20das%20Palmeiras%2C%202697%20-%20Jardim%20Imperial%2C%20Sinop%20-%20MT%2C%2078555-020!5e0!3m2!1spt-BR!2sbr!4v1707765000000"
                                width="100%"
                                height="450"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
