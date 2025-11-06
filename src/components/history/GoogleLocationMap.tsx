'use client';

import { useEffect, useState } from 'react';
import { Location } from '@/types';
import { GoogleMapWrapper } from '@/components/map/GoogleMapWrapper';

interface GoogleLocationMapProps {
  locations: Location[];
}

export function GoogleLocationMap({ locations }: GoogleLocationMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

  const safeLocations = Array.isArray(locations) ? locations : [];

  const mapCenter = safeLocations.length > 0
    ? { lat: safeLocations[0].latitude, lng: safeLocations[0].longitude }
    : { lat: -23.550520, lng: -46.633308 };

  useEffect(() => {
    if (!map || safeLocations.length === 0) return;

    // Clear existing markers and polyline
    markers.forEach(marker => marker.setMap(null));
    if (polyline) {
      polyline.setMap(null);
    }

    // Create path for polyline
    const path = safeLocations.map(loc => ({
      lat: loc.latitude,
      lng: loc.longitude
    }));

    // Create polyline
    const newPolyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#10b981',
      strokeOpacity: 0.7,
      strokeWeight: 3,
      map
    });

    // Create markers
    const newMarkers = safeLocations.map((location, index) => {
      const marker = new google.maps.Marker({
        map,
        position: { lat: location.latitude, lng: location.longitude },
        title: `Localização ${index + 1}`,
        label: index === 0 ? {
          text: 'Atual',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        } : undefined,
        icon: index === 0 ? {
          url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        } : {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new google.maps.Size(32, 32)
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 8px;">
          <p style="font-weight: bold; margin-bottom: 4px;">
            ${index === 0 ? 'Localização Atual' : `${index + 1}ª Localização`}
          </p>
          <p style="font-size: 12px; color: #666;">
            ${new Date(location.timestamp).toLocaleString('pt-BR')}
          </p>
          ${location.battery_level !== null ? `
            <p style="font-size: 12px; color: #666; margin-top: 4px;">
              Bateria: ${location.battery_level}%
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
    setPolyline(newPolyline);

    // Fit map to show all markers
    if (path.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      path.forEach(point => bounds.extend(point));
      map.fitBounds(bounds);
    } else if (path.length === 1) {
      // Se houver apenas um ponto, centralizar nele
      map.setCenter(path[0]);
      map.setZoom(15);
    }

    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
      newPolyline.setMap(null);
    };
  }, [map, safeLocations]);

  if (safeLocations.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">Nenhuma localização para exibir no mapa</p>
      </div>
    );
  }

  return (
    <div className="h-[500px] rounded-lg overflow-hidden border shadow-lg">
      <GoogleMapWrapper
        center={mapCenter}
        zoom={13}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
        onMapLoad={setMap}
      />
    </div>
  );
}
