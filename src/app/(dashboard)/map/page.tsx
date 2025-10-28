import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapWrapper } from '@/components/map/MapWrapper';

async function getDevicesWithLocations() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/devices`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const devices = await response.json();

    // Filtrar apenas dispositivos com localização
    return devices
      .filter((device: any) => device.lastLocation)
      .map((device: any) => ({
        latitude: device.lastLocation.latitude,
        longitude: device.lastLocation.longitude,
        deviceName: device.name,
        patientName: device.patient_name,
        timestamp: device.lastLocation.timestamp,
        batteryLevel: device.battery_level,
      }));
  } catch (error) {
    console.error('Error fetching devices:', error);
    return [];
  }
}

export default async function MapPage() {
  const locations = await getDevicesWithLocations();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-light tracking-tight text-gray-900">Mapa de Localização</h1>
        <p className="text-gray-600 mt-2 font-light">
          Visualize a localização de todos os seus dispositivos em tempo real
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mapa Interativo</CardTitle>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-6xl mb-4">📍</div>
                <h3 className="text-2xl font-light text-gray-900 mb-3">
                  Nenhuma localização disponível
                </h3>
                <p className="text-gray-600 font-light max-w-md mx-auto">
                  Adicione dispositivos e aguarde o ESP32 enviar os primeiros dados de localização
                </p>
                <Link
                  href="/devices/new"
                  className="inline-block mt-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-medium hover:shadow-lg transition-all"
                >
                  + Adicionar Dispositivo
                </Link>
              </div>
            </div>
          ) : (
            <MapWrapper locations={locations} height="600px" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
