import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatRelativeTime, formatBatteryLevel } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/server';
import { ensureUserExists } from '@/lib/services/user-sync';
import { Map, MapPin, Bell, History } from 'lucide-react';

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
            <h1 className="text-3xl font-bold text-foreground">{device.name}</h1>
            <p className="text-muted-foreground mt-1">{device.patient_name}</p>
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
              <p className="text-sm text-muted-foreground font-medium">ID do Hardware</p>
              <p className="font-mono text-sm text-foreground">{device.hardware_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Nome do Dispositivo</p>
              <p className="font-medium text-foreground">{device.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Paciente</p>
              <p className="font-medium text-foreground">{device.patient_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Criado em</p>
              <p className="text-sm text-foreground">{formatDate(device.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Nível de Bateria</p>
              <p className={`font-medium ${isCriticalBattery ? 'text-destructive' : isLowBattery ? 'text-warning' : 'text-foreground'
                }`}>
                {formatBatteryLevel(batteryLevel)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Última Localização</p>
              <p className="text-sm text-foreground">
                {device.last_location_at
                  ? formatRelativeTime(device.last_location_at)
                  : 'Nenhuma localização recebida'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Status de Conexão</p>
              <p className="text-sm text-foreground">
                {isStale ? 'Offline (sem dados há mais de 30 minutos)' : 'Online e ativo'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href={`/map?device=${device.hardware_id}`} className="block">
          <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-border/50 bg-card/50 backdrop-blur-sm" hoverEffect>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3">
                <Map className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Localizar</h3>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/geofences/${device.hardware_id}`} className="block">
          <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-border/50 bg-card/50 backdrop-blur-sm" hoverEffect>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
                <MapPin className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Editar Áreas Seguras</h3>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/alerts/${device.hardware_id}`} className="block">
          <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-border/50 bg-card/50 backdrop-blur-sm" hoverEffect>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-3">
                <Bell className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Ver Alertas</h3>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/history/${device.hardware_id}`} className="block">
          <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-border/50 bg-card/50 backdrop-blur-sm" hoverEffect>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3">
                <History className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Ver Histórico</h3>
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
