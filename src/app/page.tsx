import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Footer } from "@/components/layout/Footer";
import { MapPin, Bell, Shield, Battery, History, Bot } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-emerald-50 via-cyan-50 to-white">
      {/* Header */}
      <header className="border-b border-emerald-100/50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-completa-texto-img.png"
              alt="Alzheimer Care"
              width={200}
              height={45}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <nav className="flex items-center gap-6">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
                  Entrar
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-2.5 text-sm font-medium text-white hover:shadow-lg hover:shadow-emerald-200 transition-all">
                  Começar
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="container mx-auto px-6 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
              Saúde & Segurança
            </div>
            <h1 className="text-5xl md:text-7xl font-extralight tracking-tight text-gray-900 mb-6">
              Cuidado e
              <span className="block mt-2 bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent font-light">
                Tranquilidade
              </span>
            </h1>
            <p className="mt-8 text-xl leading-relaxed text-gray-600 max-w-2xl mx-auto font-light">
              Sistema de monitoramento em tempo real para garantir a segurança dos seus entes queridos com Alzheimer.
            </p>
            <div className="mt-12 flex items-center justify-center gap-4">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-base font-medium text-white hover:shadow-xl hover:shadow-emerald-200 transition-all">
                    Começar Agora
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-base font-medium text-white hover:shadow-xl hover:shadow-emerald-200 transition-all"
                >
                  Ir para Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>

          {/* Features */}
          <div className="mx-auto mt-32 max-w-6xl">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Card 1 */}
              <div className="group relative rounded-2xl bg-white/80 backdrop-blur-sm p-8 overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-white">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ padding: '2px' }}>
                  <div className="h-full w-full rounded-2xl bg-white"></div>
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 group-hover:border-transparent transition-all"></div>
                <div className="relative z-10">
                  <div className="mb-6 h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200/50 group-hover:shadow-emerald-300 group-hover:scale-110 transition-all duration-300">
                    <MapPin className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    Localização em Tempo Real
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Acompanhe a localização através do mapa interativo com atualizações ao vivo.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group relative rounded-2xl bg-white/80 backdrop-blur-sm p-8 overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-white">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ padding: '2px' }}>
                  <div className="h-full w-full rounded-2xl bg-white"></div>
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 group-hover:border-transparent transition-all"></div>
                <div className="relative z-10">
                  <div className="mb-6 h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-200/50 group-hover:shadow-amber-300 group-hover:scale-110 transition-all duration-300">
                    <Bell className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    Alertas Inteligentes
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Notificações instantâneas quando o paciente sair da área segura.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group relative rounded-2xl bg-white/80 backdrop-blur-sm p-8 overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-white">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ padding: '2px' }}>
                  <div className="h-full w-full rounded-2xl bg-white"></div>
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 group-hover:border-transparent transition-all"></div>
                <div className="relative z-10">
                  <div className="mb-6 h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-200/50 group-hover:shadow-blue-300 group-hover:scale-110 transition-all duration-300">
                    <Shield className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    Áreas Seguras
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Defina geofences personalizadas e áreas de segurança no mapa.
                  </p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="group relative rounded-2xl bg-white/80 backdrop-blur-sm p-8 overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-white">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ padding: '2px' }}>
                  <div className="h-full w-full rounded-2xl bg-white"></div>
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 group-hover:border-transparent transition-all"></div>
                <div className="relative z-10">
                  <div className="mb-6 h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-green-200/50 group-hover:shadow-green-300 group-hover:scale-110 transition-all duration-300">
                    <Battery className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    Monitoramento
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Acompanhe nível de bateria e status de conexão do dispositivo.
                  </p>
                </div>
              </div>

              {/* Card 5 */}
              <div className="group relative rounded-2xl bg-white/80 backdrop-blur-sm p-8 overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-white">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ padding: '2px' }}>
                  <div className="h-full w-full rounded-2xl bg-white"></div>
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 group-hover:border-transparent transition-all"></div>
                <div className="relative z-10">
                  <div className="mb-6 h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-200/50 group-hover:shadow-purple-300 group-hover:scale-110 transition-all duration-300">
                    <History className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    Histórico Completo
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Acesse histórico detalhado de localizações e movimentações.
                  </p>
                </div>
              </div>

              {/* Card 6 */}
              <div className="group relative rounded-2xl bg-white/80 backdrop-blur-sm p-8 overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-white">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ padding: '2px' }}>
                  <div className="h-full w-full rounded-2xl bg-white"></div>
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 group-hover:border-transparent transition-all"></div>
                <div className="relative z-10">
                  <div className="mb-6 h-14 w-14 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-200/50 group-hover:shadow-violet-300 group-hover:scale-110 transition-all duration-300">
                    <Bot className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    Assistente com IA
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Orientações especializadas sobre cuidados com Alzheimer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
