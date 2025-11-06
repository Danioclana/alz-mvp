import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';

export function Navbar() {
  return (
    <nav className="border-b border-emerald-100/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex h-20 items-center px-6 container mx-auto">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/logo-completa-texto-img.png"
            alt="Alzheimer Care"
            width={180}
            height={40}
            className="h-10 w-auto"
            priority
          />
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
