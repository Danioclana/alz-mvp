import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alzheimer Care - Sistema de Monitoramento Inteligente",
  description: "Sistema inteligente de monitoramento para pessoas com Alzheimer. Localização em tempo real, alertas inteligentes e áreas seguras.",
  icons: {
    icon: '/logo-img.png',
    shortcut: '/logo-img.png',
    apple: '/logo-img.png',
  },
  openGraph: {
    title: "Alzheimer Care",
    description: "Sistema inteligente de monitoramento para pessoas com Alzheimer",
    images: ['/logo-completa-texto-img.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <head>
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,drawing,geometry`}
            strategy="beforeInteractive"
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
