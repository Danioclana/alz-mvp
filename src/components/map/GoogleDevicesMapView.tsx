'use client';

import { useEffect, useState } from 'react';
import { GoogleMapWrapper } from './GoogleMapWrapper';

interface LocationData {
  latitude: number;
  longitude: number;
  deviceName: string;
  patientName: string;
  timestamp: string;
  batteryLevel: number | null;
}

interface GoogleDevicesMapViewProps {
  locations: LocationData[];
  height?: string;
}

export function GoogleDevicesMapView({ locations, height = '600px' }: GoogleDevicesMapViewProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  const center = locations.length > 0
    ? {
        lat: locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length,
        lng: locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length
      }
    : { lat: -23.550520, lng: -46.633308 };

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create new markers
    const newMarkers = locations.map((location) => {
      const isGeofence = location.deviceName === 'Zona Segura';
      const marker = new google.maps.Marker({
        map,
        position: { lat: location.latitude, lng: location.longitude },
        title: location.deviceName,
        icon: {
          url: isGeofence
            ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 12px;">
          <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">
            ${location.deviceName}
          </h3>
          <p style="font-size: 13px; color: #666; margin-bottom: 4px;">
            Paciente: ${location.patientName}
          </p>
          <p style="font-size: 12px; color: #999; margin-bottom: 4px;">
            ${new Date(location.timestamp).toLocaleString('pt-BR')}
          </p>
          ${location.batteryLevel !== null ? `
            <p style="font-size: 12px; color: ${location.batteryLevel < 20 ? '#ef4444' : '#666'};">
              🔋 Bateria: ${location.batteryLevel}%
            </p>
          ` : ''}
        </div>`
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Sempre centralizar no último local conhecido (primeiro da lista) com zoom próximo
    if (locations.length > 0) {
      map.setCenter({ lat: locations[0].latitude, lng: locations[0].longitude });
      map.setZoom(17);
    }

    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [map, locations]);

  return (
    <div style={{ height }}>
      <GoogleMapWrapper
        center={center}
        zoom={17}
        style={{ height: '100%', width: '100%' }}
        onMapLoad={setMap}
      />
    </div>
  );
}
