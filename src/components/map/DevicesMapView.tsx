'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import '@/lib/leaflet-config';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    )
  }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface LocationData {
  latitude: number;
  longitude: number;
  deviceName: string;
  patientName: string;
  timestamp: string;
  batteryLevel: number | null;
}

interface DevicesMapViewProps {
  locations: LocationData[];
  height?: string;
}

export function DevicesMapView({ locations, height = '600px' }: DevicesMapViewProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center bg-gray-100" style={{ height }}>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  // Calculate center as average of all locations
  const center: [number, number] = locations.length > 0
    ? [
        locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length,
        locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length
      ]
    : [-23.550520, -46.633308]; // São Paulo default

  return (
    <div style={{ height }}>
      <MapContainer
        center={center}
        zoom={20}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((location, index) => (
          <Marker
            key={index}
            position={[location.latitude, location.longitude]}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-semibold mb-1">{location.deviceName}</h3>
                <p className="text-gray-700">Paciente: {location.patientName}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(location.timestamp).toLocaleString('pt-BR')}
                </p>
                {location.batteryLevel !== null && (
                  <p className="text-xs text-gray-600">
                    Bateria: {location.batteryLevel}%
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
