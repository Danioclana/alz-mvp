import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DeviceCard } from '@/components/devices/DeviceCard';
import { createClient } from '@/lib/supabase/server';
import { ensureUserExists } from '@/lib/services/user-sync';
import { Device } from '@/types';
import { Smartphone, Lightbulb } from 'lucide-react';

async function getDevices() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  try {
    const userIdSupabase = await ensureUserExists();
    if (!userIdSupabase) {
      console.error('Failed to sync user');
      return [];
    }

    const supabase = await createClient({ useServiceRole: true });

    const { data: devices, error } = await supabase
      .from('devices')
      .select(`
        *,
        locations (
          latitude,
          longitude,
          timestamp,
          battery_level
        )
      `)
      .eq('user_id', userIdSupabase)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching devices:', error);
      return [];
    }

    // Formatar resposta (incluir lastLocation se existir)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedDevices = devices.map((device: any) => ({
      ...device,
      lastLocation: device.locations && device.locations.length > 0 ? device.locations[0] : null,
      locations: undefined,
    }));

    return formattedDevices;
  } catch (error) {
    console.error('Error fetching devices:', error);
    return [];
  }
}

export default async function DashboardPage() {
  const devices = await getDevices();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Dispositivos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie e monitore seus dispositivos
          </p>
        </div>
        <Link href="/devices/new">
          <Button size="lg" className="shadow-lg shadow-primary/25">Novo Dispositivo</Button>
        </Link>
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-20 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Smartphone className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-3">
            Nenhum dispositivo cadastrado
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Comece adicionando seu primeiro dispositivo de rastreamento
          </p>
          <Link href="/devices/new">
            <Button size="lg" className="shadow-lg shadow-primary/25">Adicionar Primeiro Dispositivo</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {devices.map((device: Device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}

      {devices.length > 0 && (
        <div className="mt-8 bg-primary/5 border border-primary/10 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Dicas Rápidas
            </h3>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Clique em um dispositivo para ver detalhes completos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Configure geofences para receber alertas automáticos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Monitore o nível de bateria regularmente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Use o mapa para visualização em tempo real</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
