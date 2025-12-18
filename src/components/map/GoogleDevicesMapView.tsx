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
  isLatest?: boolean; // Indica se é a localização mais recente
}

interface GeofenceData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface GoogleDevicesMapViewProps {
  locations: LocationData[];
  geofences?: GeofenceData[];
  height?: string;
}

export function GoogleDevicesMapView({ locations, geofences = [], height = '600px' }: GoogleDevicesMapViewProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [polylines, setPolylines] = useState<google.maps.Polyline[]>([]);
  const [circles, setCircles] = useState<google.maps.Circle[]>([]);

  // Encontrar a localização mais recente para centralizar o mapa
  const latestLocation = locations.find(loc => loc.isLatest !== false) || locations[0];
  // Se não tiver localizacao, tentar usar a primeira geofence
  const firstGeofence = geofences[0];

  const center = latestLocation
    ? { lat: latestLocation.latitude, lng: latestLocation.longitude }
    : firstGeofence 
      ? { lat: firstGeofence.latitude, lng: firstGeofence.longitude }
      : { lat: -23.550520, lng: -46.633308 };

  useEffect(() => {
    if (!map) return;

    // Clear existing markers, polylines, and circles
    markers.forEach(marker => marker.setMap(null));
    polylines.forEach(polyline => polyline.setMap(null));
    circles.forEach(circle => circle.setMap(null));

    // --- Render Geofences ---
    const newCircles: google.maps.Circle[] = [];
    
    geofences.forEach(geofence => {
      const circle = new google.maps.Circle({
        strokeColor: '#10b981', // Emerald 500
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#10b981',
        fillOpacity: 0.15,
        map,
        center: { lat: geofence.latitude, lng: geofence.longitude },
        radius: geofence.radius,
        title: geofence.name,
      });

      // Info window for geofence
      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 8px;">
          <h3 style="font-weight: bold; font-size: 14px; color: #047857;">🛡️ ${geofence.name}</h3>
          <p style="font-size: 12px; color: #666;">Raio: ${geofence.radius}m</p>
        </div>`
      });

      circle.addListener('click', (e: any) => {
        // Position info window at the click location or center
        infoWindow.setPosition(e.latLng || { lat: geofence.latitude, lng: geofence.longitude });
        infoWindow.open(map);
      });

      newCircles.push(circle);
    });
    setCircles(newCircles);

    // --- Render Locations ---
    // Agrupar localizações por dispositivo para desenhar linhas
    const deviceLocations = new Map<string, LocationData[]>();

    locations.forEach(location => {
      const key = location.deviceName;
      if (!deviceLocations.has(key)) {
        deviceLocations.set(key, []);
      }
      deviceLocations.get(key)!.push(location);
    });

    const newMarkers: google.maps.Marker[] = [];
    const newPolylines: google.maps.Polyline[] = [];

    // Para cada dispositivo, desenhar marcadores e linha
    deviceLocations.forEach((deviceLocs, deviceName) => {
      // Ordenar por isLatest para garantir ordem correta
      const sortedLocs = deviceLocs.sort((a, b) => (b.isLatest ? 1 : 0) - (a.isLatest ? 1 : 0));

      sortedLocs.forEach((location) => {
        const isGeofence = location.deviceName === 'Zona Segura';
        const isLatest = location.isLatest !== false;

        let marker: google.maps.Marker;

        if (isGeofence) {
          // Zona segura - marcador azul normal
          marker = new google.maps.Marker({
            map,
            position: { lat: location.latitude, lng: location.longitude },
            title: location.deviceName,
            icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
          });
        } else if (isLatest) {
          // Localização atual - marcador vermelho normal
          marker = new google.maps.Marker({
            map,
            position: { lat: location.latitude, lng: location.longitude },
            title: location.deviceName,
            icon: { url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' },
          });
        } else {
          // Localização anterior - bolinha laranja pequena
          marker = new google.maps.Marker({
            map,
            position: { lat: location.latitude, lng: location.longitude },
            title: `${location.deviceName} (anterior)`,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: '#f97316',
              fillOpacity: 0.8,
              strokeColor: '#ea580c',
              strokeWeight: 2,
            },
          });
        }

        const locationLabel = isLatest ? 'Localização Atual' : 'Localização Anterior';

        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="padding: 12px;">
            <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">
              ${location.deviceName}
            </h3>
            <p style="font-size: 12px; color: ${isLatest ? '#ef4444' : '#f97316'}; margin-bottom: 4px; font-weight: 600;">
              📍 ${locationLabel}
            </p>
            <p style="font-size: 13px; color: #666; margin-bottom: 4px;">
              Paciente: ${location.patientName}
            </p>
            <p style="font-size: 12px; color: #999; margin-bottom: 4px;">
              ${new Date(location.timestamp).toLocaleString('pt-BR')}
            </p>
            ${location.batteryLevel !== null && isLatest ? `
              <p style="font-size: 12px; color: ${location.batteryLevel < 20 ? '#ef4444' : '#666'};">
                🔋 Bateria: ${location.batteryLevel}%
              </p>
            ` : ''}
          </div>`
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        newMarkers.push(marker);
      });

      // Desenhar linha entre os pontos se houver mais de uma localização
      if (sortedLocs.length >= 2) {
        const path = sortedLocs.map(loc => ({
          lat: loc.latitude,
          lng: loc.longitude
        }));

        const polyline = new google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: '#3b82f6', // Azul
          strokeOpacity: 0.7,
          strokeWeight: 3,
          map: map,
        });

        newPolylines.push(polyline);
      }
    });

    setMarkers(newMarkers);
    setPolylines(newPolylines);

    // Sempre centralizar na localização mais recente com zoom próximo
    if (latestLocation) {
      map.setCenter({ lat: latestLocation.latitude, lng: latestLocation.longitude });
      map.setZoom(18);
    }

    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
      newPolylines.forEach(polyline => polyline.setMap(null));
      newCircles.forEach(circle => circle.setMap(null));
    };
  }, [map, locations, geofences, latestLocation]); // Added geofences dependency

  return (
    <div style={{ height }}>
      <GoogleMapWrapper
        center={center}
        zoom={18}
        style={{ height: '100%', width: '100%' }}
        onMapLoad={setMap}
      />
    </div>
  );
}
