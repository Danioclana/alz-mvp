import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';

export function Navbar() {
  return (
    <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex h-20 items-center px-6 container mx-auto">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/logo-completa-texto-img.png"
            alt="Alzheimer Care"
            width={180}
            height={40}
            className="h-10 w-auto dark:invert"
            priority
          />
        </Link>

        <div className="ml-auto flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Dispositivos
          </Link>
          <Link
            href="/map"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Mapa
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  );
}
