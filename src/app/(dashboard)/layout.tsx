import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-cyan-50 to-white">
      <Navbar />
      <main className="flex-1 container mx-auto py-8 px-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
