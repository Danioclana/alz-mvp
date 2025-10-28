'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Importar MapView dinamicamente para evitar SSR
const MapView = dynamic(() => import('./MapView').then(mod => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🗺️</div>
        <p className="text-gray-700 font-light">Carregando mapa...</p>
      </div>
    </div>
  ),
});

interface Location {
  latitude: number;
  longitude: number;
  deviceName: string;
  patientName: string;
  timestamp?: string;
  batteryLevel?: number;
}

interface MapWrapperProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export function MapWrapper(props: MapWrapperProps) {
  return (
    <Suspense fallback={
      <div className="w-full h-[500px] bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-gray-700 font-light">Carregando mapa...</p>
        </div>
      </div>
    }>
      <MapView {...props} />
    </Suspense>
  );
}
