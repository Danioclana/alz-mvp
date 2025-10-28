import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DeviceCard } from '@/components/devices/DeviceCard';
import { createClient } from '@/lib/supabase/server';
import { ensureUserExists } from '@/lib/services/user-sync';

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
          <h1 className="text-4xl font-light tracking-tight text-gray-900">Dispositivos</h1>
          <p className="text-gray-700 mt-2 font-light">
            Gerencie e monitore seus dispositivos
          </p>
        </div>
        <Link href="/devices/new">
          <Button>+ Novo Dispositivo</Button>
        </Link>
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-emerald-100/50">
          <div className="text-7xl mb-6">📱</div>
          <h3 className="text-2xl font-light text-gray-900 mb-3">
            Nenhum dispositivo cadastrado
          </h3>
          <p className="text-gray-700 mb-8 font-light max-w-md mx-auto">
            Comece adicionando seu primeiro dispositivo de rastreamento
          </p>
          <Link href="/devices/new">
            <Button size="lg">+ Adicionar Primeiro Dispositivo</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {devices.map((device: any) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}

      {devices.length > 0 && (
        <div className="mt-8 bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-100 rounded-2xl p-8">
          <h3 className="text-lg font-medium text-emerald-900 mb-4">
            💡 Dicas Rápidas
          </h3>
          <ul className="space-y-3 text-sm text-emerald-900">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">•</span>
              <span className="font-light">Clique em um dispositivo para ver detalhes completos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">•</span>
              <span className="font-light">Configure geofences para receber alertas automáticos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">•</span>
              <span className="font-light">Monitore o nível de bateria regularmente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600">•</span>
              <span className="font-light">Use o mapa para visualização em tempo real</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
