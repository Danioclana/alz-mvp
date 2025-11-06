'use client';

import dynamic from 'next/dynamic';
import { Location } from '@/types';
import { useMemo } from 'react';
import { MapWrapper } from '@/components/map/MapWrapper';

// Dynamically import map components to avoid SSR issues
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
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

interface LocationMapProps {
  locations: Location[];
}

export function LocationMap({ locations }: LocationMapProps) {
  const safeLocations = Array.isArray(locations) ? locations : [];

  // Create polyline path from locations
  const polylinePath = useMemo(() => {
    return safeLocations.map(loc => [loc.latitude, loc.longitude] as [number, number]);
  }, [safeLocations]);

  // Calculate map center
  const mapCenter: [number, number] = useMemo(() => {
    if (safeLocations.length === 0) {
      return [-23.550520, -46.633308]; // São Paulo default
    }
    return [safeLocations[0].latitude, safeLocations[0].longitude];
  }, [safeLocations]);

  if (safeLocations.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">Nenhuma localização para exibir no mapa</p>
      </div>
    );
  }

  return (
    <div className="h-[500px] rounded-lg overflow-hidden border shadow-lg">
      <MapWrapper
        center={mapCenter}
        zoom={13}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >

        {/* Polyline connecting all points */}
        {polylinePath.length > 1 && (
          <Polyline
            positions={polylinePath}
            pathOptions={{
              color: '#10b981',
              weight: 3,
              opacity: 0.7,
            }}
          />
        )}

        {/* Markers for each location */}
        {safeLocations.map((location, index) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-medium mb-1">
                  {index === 0 ? 'Localização atual' : `${index + 1}ª localização`}
                </p>
                <p className="text-xs text-gray-600">
                  {new Date(location.timestamp).toLocaleString('pt-BR')}
                </p>
                {location.battery_level !== null && (
                  <p className="text-xs text-gray-600 mt-1">
                    Bateria: {location.battery_level}%
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapWrapper>
    </div>
  );
}
