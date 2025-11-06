import Link from 'next/link';
import Image from 'next/image';
import { Mail, Github, Linkedin, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-emerald-100/50 bg-white/60 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image
                src="/logo-completa-texto-img.png"
                alt="Alzheimer Care"
                width={180}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed max-w-md">
              Sistema inteligente de monitoramento para pessoas com Alzheimer.
              Proporcionando segurança e tranquilidade para cuidadores e familiares.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="mailto:contato@alzheimercare.com"
                className="text-gray-400 hover:text-emerald-600 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-emerald-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-emerald-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Produto */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Produto</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  Mapa
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  Preços
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Suporte</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/docs" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  Documentação
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 font-light">
            © {new Date().getFullYear()} Alzheimer Care. Todos os direitos reservados.
          </p>
          <p className="text-sm text-gray-500 font-light flex items-center gap-1">
            Feito com <Heart className="h-4 w-4 text-red-500 fill-current" /> para cuidadores
          </p>
        </div>
      </div>
    </footer>
  );
}
