import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RCC Diocese de Sinop",
    template: "%s | RCC Diocese de Sinop"
  },
  description: "Portal oficial da Renovação Carismática Católica na Diocese de Sinop/MT. Encontre Grupos de Oração, missas e eventos religiosos em Mato Grosso.",
  keywords: ["RCC Mato Grosso", "Igreja Católica Sinop", "Grupo de Oração MT", "Renovação Carismática Católica", "Missa hoje Sinop"],
  openGraph: {
    title: "RCC Diocese de Sinop",
    description: "Um encontro de amor com o Espírito Santo na Diocese de Sinop.",
    url: "https://site-rcc-diocese.vercel.app/",
    siteName: "RCC Diocese de Sinop",
    locale: "pt_BR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "RCC Diocese de Sinop",
              "url": "https://site-rcc-diocese.vercel.app/",
              "logo": "https://site-rcc-diocese.vercel.app/logo-diocese.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+5566992324636",
                "contactType": "customer service"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
