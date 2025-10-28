import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-emerald-50 via-cyan-50 to-white">
      {/* Header */}
      <header className="border-b border-emerald-100/50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-200">
              AC
            </div>
            <span className="text-2xl font-light tracking-tight text-gray-800">Alzheimer Care</span>
          </div>
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group rounded-2xl bg-white/60 backdrop-blur-sm border border-emerald-100/50 p-8 hover:shadow-xl hover:shadow-emerald-100 transition-all">
                <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center text-3xl">
                  📍
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Localização em Tempo Real</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  Acompanhe a localização através do mapa interativo.
                </p>
              </div>

              <div className="group rounded-2xl bg-white/60 backdrop-blur-sm border border-emerald-100/50 p-8 hover:shadow-xl hover:shadow-emerald-100 transition-all">
                <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center text-3xl">
                  🔔
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Alertas Inteligentes</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  Notificações quando sair da área segura.
                </p>
              </div>

              <div className="group rounded-2xl bg-white/60 backdrop-blur-sm border border-emerald-100/50 p-8 hover:shadow-xl hover:shadow-emerald-100 transition-all">
                <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center text-3xl">
                  🗺️
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Áreas Seguras</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  Defina geofences personalizadas no mapa.
                </p>
              </div>

              <div className="group rounded-2xl bg-white/60 backdrop-blur-sm border border-emerald-100/50 p-8 hover:shadow-xl hover:shadow-emerald-100 transition-all">
                <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center text-3xl">
                  🔋
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Monitoramento</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  Acompanhe bateria e status do dispositivo.
                </p>
              </div>

              <div className="group rounded-2xl bg-white/60 backdrop-blur-sm border border-emerald-100/50 p-8 hover:shadow-xl hover:shadow-emerald-100 transition-all">
                <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center text-3xl">
                  📊
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Histórico</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  Acesse histórico completo de localizações.
                </p>
              </div>

              <div className="group rounded-2xl bg-white/60 backdrop-blur-sm border border-emerald-100/50 p-8 hover:shadow-xl hover:shadow-emerald-100 transition-all">
                <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center text-3xl">
                  🤖
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Assistente IA</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  Orientações sobre cuidados com Alzheimer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-100/50 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <p className="text-center text-sm text-gray-500 font-light">
            © 2025 Alzheimer Care
          </p>
        </div>
      </footer>
    </div>
  );
}
