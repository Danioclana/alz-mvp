import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

export function Navbar() {
  return (
    <nav className="border-b border-emerald-100/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex h-20 items-center px-6 container mx-auto">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-200">
            AC
          </div>
          <span className="text-xl font-light tracking-tight text-gray-800">Alzheimer Care</span>
        </Link>

        <div className="ml-auto flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
          >
            Dispositivos
          </Link>
          <Link
            href="/map"
            className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
          >
            Mapa
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  );
}
