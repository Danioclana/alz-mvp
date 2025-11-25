'use client';

import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Footer } from "@/components/layout/Footer";
import { MapPin, Bell, Shield, Battery, History, Bot, ChevronRight, Activity, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background overflow-hidden">

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-primary to-secondary p-0.5">
              <div className="h-full w-full bg-background rounded-[10px] flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary fill-primary/20" />
              </div>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Alzheimer Care
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">Entrar</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="primary" size="sm" className="shadow-lg shadow-primary/25">
                  Começar
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-8"
            >
              <Activity className="h-4 w-4" />
              <span>Tecnologia avançada para cuidados com saúde</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8"
            >
              Cuidado Inteligente, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                Tranquilidade Real
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed"
            >
              Sistema de monitoramento de última geração que une inteligência artificial e geolocalização precisa para garantir a segurança de quem você ama.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30">
                    Começar Agora <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30">
                    Ir para Dashboard <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </SignedIn>
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg">
                Saiba Mais
              </Button>
            </motion.div>
          </div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-32 mb-20"
          >
            {[
              {
                icon: MapPin,
                title: "Localização em Tempo Real",
                desc: "Rastreamento preciso com atualizações instantâneas e histórico de rotas.",
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              },
              {
                icon: Bell,
                title: "Alertas Inteligentes",
                desc: "Notificações imediatas sobre saídas de perímetro e situações de risco.",
                color: "text-amber-500",
                bg: "bg-amber-500/10"
              },
              {
                icon: Shield,
                title: "Zonas de Segurança",
                desc: "Crie cercas virtuais personalizadas e receba alertas automáticos.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
              },
              {
                icon: Battery,
                title: "Monitoramento de Dispositivo",
                desc: "Acompanhe o nível de bateria e conectividade do dispositivo rastreador.",
                color: "text-purple-500",
                bg: "bg-purple-500/10"
              },
              {
                icon: History,
                title: "Histórico Detalhado",
                desc: "Acesse relatórios completos de movimentação e atividades diárias.",
                color: "text-indigo-500",
                bg: "bg-indigo-500/10"
              },
              {
                icon: Bot,
                title: "Assistente IA",
                desc: "Suporte inteligente para dúvidas e orientações sobre cuidados.",
                color: "text-rose-500",
                bg: "bg-rose-500/10"
              }
            ].map((feature, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card hoverEffect className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className={`h-14 w-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6`}>
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
