import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatRelativeTime, formatBatteryLevel } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/server';
import { ensureUserExists } from '@/lib/services/user-sync';

async function getDevice(hardwareId: string) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  try {
    const userIdSupabase = await ensureUserExists();
    if (!userIdSupabase) {
      console.error('Failed to sync user');
      notFound();
    }

    const supabase = await createClient({ useServiceRole: true });

    const { data: device, error } = await supabase
      .from('devices')
      .select('*')
      .eq('hardware_id', hardwareId)
      .eq('user_id', userIdSupabase)
      .single();

    if (error || !device) {
      notFound();
    }

    return device;
  } catch (error) {
    console.error('Error fetching device:', error);
    notFound();
  }
}

export default async function DeviceDetailPage({
  params,
}: {
  params: Promise<{ hardwareId: string }>;
}) {
  const { hardwareId } = await params;
  const device = await getDevice(hardwareId);

  const batteryLevel = device.battery_level;
  const isLowBattery = batteryLevel !== null && batteryLevel < 20;
  const isCriticalBattery = batteryLevel !== null && batteryLevel < 10;

  const isStale = device.last_location_at
    ? new Date().getTime() - new Date(device.last_location_at).getTime() > 30 * 60 * 1000
    : true;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ← Voltar para Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{device.name}</h1>
            <p className="text-gray-700 mt-1">{device.patient_name}</p>
          </div>
          <div className="flex gap-2">
            {isStale && <Badge variant="warning">Sem sinal</Badge>}
            {!isStale && <Badge variant="success">Online</Badge>}
            {isCriticalBattery && <Badge variant="danger">Bateria Crítica</Badge>}
            {isLowBattery && !isCriticalBattery && (
              <Badge variant="warning">Bateria Baixa</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Dispositivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-700 font-medium">ID do Hardware</p>
              <p className="font-mono text-sm text-gray-900">{device.hardware_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium">Nome do Dispositivo</p>
              <p className="font-medium text-gray-900">{device.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium">Paciente</p>
              <p className="font-medium text-gray-900">{device.patient_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium">Criado em</p>
              <p className="text-sm text-gray-900">{formatDate(device.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-700 font-medium">Nível de Bateria</p>
              <p className={`font-medium ${
                isCriticalBattery ? 'text-red-600' : isLowBattery ? 'text-yellow-600' : 'text-gray-900'
              }`}>
                {formatBatteryLevel(batteryLevel)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium">Última Localização</p>
              <p className="text-sm text-gray-900">
                {device.last_location_at
                  ? formatRelativeTime(device.last_location_at)
                  : 'Nenhuma localização recebida'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium">Status de Conexão</p>
              <p className="text-sm text-gray-900">
                {isStale ? 'Offline (sem dados há mais de 30 minutos)' : 'Online e ativo'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href={`/map?device=${device.hardware_id}`} className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="text-3xl mb-2">🗺️</div>
              <h3 className="font-semibold mb-1">Ver no Mapa</h3>
              <p className="text-sm text-gray-700">
                Visualizar localização em tempo real
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/geofences/${device.hardware_id}`} className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="text-3xl mb-2">📍</div>
              <h3 className="font-semibold mb-1">Geofences</h3>
              <p className="text-sm text-gray-700">
                Gerenciar áreas seguras
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/alerts/${device.hardware_id}`} className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="text-3xl mb-2">🔔</div>
              <h3 className="font-semibold mb-1">Alertas</h3>
              <p className="text-sm text-gray-700">
                Configurar notificações
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/history/${device.hardware_id}`} className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold mb-1">Histórico</h3>
              <p className="text-sm text-gray-600">
                Ver localizações anteriores
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-6 flex gap-3">
        <Link href={`/devices/${device.hardware_id}/edit`}>
          <Button variant="secondary">Editar Dispositivo</Button>
        </Link>
        <Button variant="danger">Excluir Dispositivo</Button>
      </div>
    </div>
  );
}
