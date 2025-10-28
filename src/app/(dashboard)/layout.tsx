import { Navbar } from '@/components/layout/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white">
      <Navbar />
      <main className="container mx-auto py-8 px-6">
        {children}
      </main>
    </div>
  );
}
