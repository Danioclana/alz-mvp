'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Location {
  latitude: number;
  longitude: number;
  deviceName: string;
  patientName: string;
  timestamp?: string;
  batteryLevel?: number;
}

interface MapViewProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export function MapView({
  locations,
  center = [-23.55052, -46.633308], // São Paulo como padrão
  zoom = 18,
  height = '500px'
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Inicializar mapa
    const map = L.map(mapRef.current).setView(center, zoom);

    // Adicionar tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Limpar marcadores anteriores
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (locations.length === 0) return;

    // Adicionar novos marcadores
    locations.forEach((location) => {
      const marker = L.marker([location.latitude, location.longitude])
        .addTo(mapInstanceRef.current!);

      // Criar popup com informações
      const popupContent = `
        <div style="min-width: 200px">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${location.deviceName}</h3>
          <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${location.patientName}</p>
          ${location.batteryLevel !== undefined ? `
            <p style="margin: 4px 0; font-size: 13px;">
              🔋 Bateria: <strong>${Math.round(location.batteryLevel)}%</strong>
            </p>
          ` : ''}
          ${location.timestamp ? `
            <p style="margin: 4px 0; font-size: 12px; color: #888;">
              Atualizado: ${new Date(location.timestamp).toLocaleString('pt-BR')}
            </p>
          ` : ''}
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #999; font-family: monospace;">
            ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
          </p>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // Ajustar visualização para mostrar todos os marcadores
    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map(loc => [loc.latitude, loc.longitude])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations]);

  return (
    <div
      ref={mapRef}
      style={{
        height,
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden'
      }}
    />
  );
}
