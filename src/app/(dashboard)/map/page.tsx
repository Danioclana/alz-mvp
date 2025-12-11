import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleDevicesMapView } from '@/components/map/GoogleDevicesMapView';
import { createClient } from '@/lib/supabase/server';
import { ensureUserExists } from '@/lib/services/user-sync';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AutoReloadMap } from '@/components/map/AutoReloadMap';

async function getDevicesWithLocations() {
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

    // Primeiro, buscar todos os dispositivos do usuário
    const { data: devices, error: devicesError } = await supabase
      .from('devices')
      .select('id, name, patient_name, hardware_id')
      .eq('user_id', userIdSupabase);

    if (devicesError || !devices || devices.length === 0) {
      console.error('Error fetching devices:', devicesError);
      return [];
    }

    console.log(`Found ${devices.length} devices`);

    // Para cada dispositivo, buscar as 2 últimas localizações
    const devicesWithLocations: any[] = [];

    for (const device of devices) {
      const { data: locations, error: locationsError } = await supabase
        .from('locations')
        .select('latitude, longitude, timestamp, battery_level')
        .eq('device_id', device.id)
        .order('timestamp', { ascending: false })
        .limit(2);

      if (locationsError) {
        console.error(`Error fetching locations for device ${device.id}:`, locationsError);
        continue;
      }

      if (locations && locations.length > 0) {
        console.log(`Device ${device.name}: found ${locations.length} locations`);

        // Adicionar cada localização ao array
        locations.forEach((location: any, index: number) => {
          devicesWithLocations.push({
            latitude: location.latitude,
            longitude: location.longitude,
            deviceName: device.name,
            patientName: device.patient_name,
            timestamp: location.timestamp,
            batteryLevel: location.battery_level,
            isLatest: index === 0, // Primeira é a mais recente
          });
        });
      }
    }

    console.log(`Total locations to display: ${devicesWithLocations.length}`);

    // Se não houver localizações, tentar buscar a primeira geofence como fallback
    if (devicesWithLocations.length === 0) {
      const { data: geofences } = await supabase
        .from('geofences')
        .select('*')
        .eq('user_id', userIdSupabase)
        .limit(1)
        .single();

      if (geofences) {
        // Usar o centro da geofence como localização padrão
        return [{
          latitude: geofences.center_lat,
          longitude: geofences.center_lng,
          deviceName: 'Zona Segura',
          patientName: geofences.name,
          timestamp: new Date().toISOString(),
          batteryLevel: null,
          isLatest: true,
        }];
      }
    }

    return devicesWithLocations;
  } catch (error) {
    console.error('Error fetching devices:', error);
    return [];
  }
}

export default async function MapPage() {
  const locations = await getDevicesWithLocations();

  return (
    <div>
      <AutoReloadMap refreshInterval={30} />
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Mapa de Localização</h1>
        <p className="text-muted-foreground mt-2">
          Visualize a localização de todos os seus dispositivos em tempo real
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mapa Interativo</CardTitle>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl flex items-center justify-center h-96 border border-border/50">
              <div className="text-center">
                <div className="mx-auto h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <MapPin className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  Nenhuma localização disponível
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Adicione dispositivos e aguarde o ESP32 enviar os primeiros dados de localização
                </p>
                <Link href="/devices/new">
                  <Button size="lg" className="shadow-lg shadow-primary/25">
                    Adicionar Dispositivo
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <GoogleDevicesMapView locations={locations} height="600px" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
