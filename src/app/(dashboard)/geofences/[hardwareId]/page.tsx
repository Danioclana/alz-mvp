'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Geofence, Device } from '@/types';
import { GoogleGeofenceEditor } from '@/components/geofences/GoogleGeofenceEditor';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function GeofencesPage({
  params,
}: {
  params: Promise<{ hardwareId: string }>;
}) {
  const router = useRouter();
  const [hardwareId, setHardwareId] = useState<string>('');
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(p => setHardwareId(p.hardwareId));
  }, [params]);

  useEffect(() => {
    if (hardwareId) {
      fetchData();
    }
  }, [hardwareId]);

  const fetchData = async () => {
    try {
      // Fetch device info
      const deviceRes = await fetch('/api/devices');
      const devices = await deviceRes.json();
      const currentDevice = devices.find((d: Device) => d.hardware_id === hardwareId);
      setDevice(currentDevice);

      // Fetch geofences
      const geofencesRes = await fetch(`/api/geofences/${hardwareId}`);
      if (geofencesRes.ok) {
        const data = await geofencesRes.json();
        // Ensure data is an array
        setGeofences(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch geofences:', geofencesRes.statusText);
        setGeofences([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setGeofences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeofence = async (geofence: { name: string; latitude: number; longitude: number; radius: number }) => {
    try {
      const res = await fetch(`/api/geofences/${hardwareId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geofence),
      });

      if (!res.ok) throw new Error('Failed to save geofence');

      // Refresh list
      await fetchData();
      alert('Zona segura criada com sucesso!');
    } catch (error) {
      console.error('Error saving geofence:', error);
      alert('Erro ao salvar zona segura');
    }
  };

  const handleDeleteGeofence = async (geofenceId: number) => {
    try {
      const res = await fetch(`/api/geofences/${hardwareId}?id=${geofenceId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete geofence');

      // Refresh list
      await fetchData();
      alert('Zona segura excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting geofence:', error);
      alert('Erro ao excluir zona segura');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/devices/${hardwareId}`}>
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Zonas Seguras - {device?.name || hardwareId}
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie áreas seguras para este dispositivo
          </p>
        </div>
      </div>

      <GoogleGeofenceEditor
        hardwareId={hardwareId}
        existingGeofences={geofences}
        onSave={handleSaveGeofence}
        onDelete={handleDeleteGeofence}
      />

      <div className="mt-6 bg-primary/5 border border-primary/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Como Funcionam as Áreas Seguras
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Defina áreas circulares no mapa onde o paciente deve permanecer</li>
          <li>• Receba alertas por email quando sair da área segura</li>
          <li>• Configure múltiplas geofences para diferentes locais (casa, trabalho, etc.)</li>
          <li>• Ajuste o raio conforme necessário para cada localização</li>
        </ul>
      </div>
    </div>
  );
}
