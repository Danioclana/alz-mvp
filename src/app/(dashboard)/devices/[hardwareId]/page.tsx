import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatRelativeTime, formatBatteryLevel } from '@/lib/utils/format';

async function getDevice(hardwareId: string) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/devices/${hardwareId}`,
      {
        cache: 'no-store',
      }
    );

    if (response.status === 404) {
      notFound();
    }

    if (!response.ok) {
      throw new Error('Failed to fetch device');
    }

    return await response.json();
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
            <p className="text-gray-600 mt-1">{device.patient_name}</p>
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
              <p className="text-sm text-gray-600">ID do Hardware</p>
              <p className="font-mono text-sm">{device.hardware_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nome do Dispositivo</p>
              <p className="font-medium">{device.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Paciente</p>
              <p className="font-medium">{device.patient_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Criado em</p>
              <p className="text-sm">{formatDate(device.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Nível de Bateria</p>
              <p className={`font-medium ${
                isCriticalBattery ? 'text-red-600' : isLowBattery ? 'text-yellow-600' : ''
              }`}>
                {formatBatteryLevel(batteryLevel)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Última Localização</p>
              <p className="text-sm">
                {device.last_location_at
                  ? formatRelativeTime(device.last_location_at)
                  : 'Nenhuma localização recebida'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status de Conexão</p>
              <p className="text-sm">
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
              <p className="text-sm text-gray-600">
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
              <p className="text-sm text-gray-600">
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
              <p className="text-sm text-gray-600">
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
