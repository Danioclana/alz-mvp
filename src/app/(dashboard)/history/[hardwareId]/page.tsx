'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Location, Device } from '@/types';
import { LocationTimeline } from '@/components/history/LocationTimeline';
import { GoogleLocationMap } from '@/components/history/GoogleLocationMap';
import { HistoryFilters } from '@/components/history/HistoryFilters';
import { ArrowLeft, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HistoryPage({
  params,
}: {
  params: Promise<{ hardwareId: string }>;
}) {
  const router = useRouter();
  const [hardwareId, setHardwareId] = useState<string>('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'map'>('map');

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
      if (deviceRes.ok) {
        const devices = await deviceRes.json();
        const currentDevice = devices.find((d: Device) => d.hardware_id === hardwareId);
        setDevice(currentDevice);

        if (!currentDevice) {
          setLoading(false);
          return;
        }


        // Fetch locations via API (handles authentication properly)
        const locationsRes = await fetch(`/api/devices/${hardwareId}/locations?limit=100`);
        if (locationsRes.ok) {
          const locationData = await locationsRes.json();
          const safeLocations = Array.isArray(locationData) ? locationData : [];
          setLocations(safeLocations);
          setFilteredLocations(safeLocations);
        } else {
          console.error('Failed to fetch locations:', locationsRes.statusText);
          setLocations([]);
          setFilteredLocations([]);
        }
      } else {
        console.error('Failed to fetch devices:', deviceRes.statusText);
        setLocations([]);
        setFilteredLocations([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLocations([]);
      setFilteredLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) {
      setFilteredLocations(locations);
      return;
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const filtered = locations.filter((loc) => {
      const locTime = new Date(loc.timestamp).getTime();
      return locTime >= start && locTime <= end;
    });

    setFilteredLocations(filtered);
  };

  const handleExportCSV = () => {
    if (filteredLocations.length === 0) {
      alert('Nenhuma localização para exportar');
      return;
    }

    // Create CSV content
    const headers = ['Data/Hora', 'Latitude', 'Longitude', 'Bateria (%)'];
    const rows = filteredLocations.map((loc) => [
      new Date(loc.timestamp).toLocaleString('pt-BR'),
      loc.latitude,
      loc.longitude,
      loc.battery_level || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_${hardwareId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <Link href="/">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Histórico - {device?.name || hardwareId}
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize o histórico completo de movimentações do dispositivo
          </p>
        </div>
      </div>

      {/* Filters */}
      <HistoryFilters
        onDateRangeChange={handleDateRangeChange}
        onExportCSV={handleExportCSV}
      />

      {/* View mode toggle */}
      <div className="flex gap-2 bg-white rounded-lg border p-2 w-fit">
        <Button
          variant={viewMode === 'map' ? 'primary' : 'ghost'}
          onClick={() => setViewMode('map')}
          size="sm"
        >
          Mapa
        </Button>
        <Button
          variant={viewMode === 'timeline' ? 'primary' : 'ghost'}
          onClick={() => setViewMode('timeline')}
          size="sm"
        >
          Timeline
        </Button>
      </div>

      {/* Content */}
      {filteredLocations.length === 0 ? (
        <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-12 text-center">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <History className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhuma localização encontrada
          </h3>
          <p className="text-muted-foreground">
            O histórico aparecerá aqui quando o dispositivo começar a enviar dados
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="order-2 lg:order-1">
            <LocationTimeline locations={filteredLocations} />
          </div>
          <div className="order-1 lg:order-2 lg:sticky lg:top-6 h-fit">
            <GoogleLocationMap locations={filteredLocations} />
          </div>
        </div>
      )}

      <div className="mt-6 bg-primary/5 border border-primary/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Recursos do Histórico
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Visualize todas as localizações com data e hora</li>
          <li>• Filtre por período (hoje, última semana, último mês)</li>
          <li>• Veja o trajeto percorrido no mapa</li>
          <li>• Exporte dados para análise externa (CSV)</li>
        </ul>
      </div>
    </div>
  );
}
