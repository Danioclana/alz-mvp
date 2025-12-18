'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Geofence } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { GeofenceList } from './GeofenceList';
import { GoogleAddressSearch } from './GoogleAddressSearch';
import { NativeGoogleMap } from '@/components/map/NativeGoogleMap';

interface GoogleGeofenceEditorProps {
  hardwareId: string;
  existingGeofences: Geofence[];
  onSave: (geofence: { name: string; latitude: number; longitude: number; radius: number }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function GoogleGeofenceEditor({ hardwareId, existingGeofences, onSave, onDelete }: GoogleGeofenceEditorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newGeofence, setNewGeofence] = useState<{
    name: string;
    latitude?: number;
    longitude?: number;
    radius: number;
  }>({
    name: '',
    radius: 20,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Native Google Maps objects for geofence markers and circles
  const geofenceMarkersRef = useRef<google.maps.Marker[]>([]);
  const geofenceCirclesRef = useRef<google.maps.Circle[]>([]);
  const previewMarkerRef = useRef<google.maps.Marker | null>(null);
  const previewCircleRef = useRef<google.maps.Circle | null>(null);
  const previewInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const isCreatingRef = useRef(isCreating);

  const safeGeofences = Array.isArray(existingGeofences) ? existingGeofences : [];

  // Manter o ref atualizado
  useEffect(() => {
    isCreatingRef.current = isCreating;
  }, [isCreating]);

  // Determinar centro do mapa (memoizado para evitar re-renders)
  const mapCenter = useMemo(() => {
    if (isCreating && newGeofence.latitude && newGeofence.longitude) {
      return { lat: newGeofence.latitude, lng: newGeofence.longitude };
    }
    if (safeGeofences.length > 0) {
      return { lat: safeGeofences[0].latitude, lng: safeGeofences[0].longitude };
    }
    return { lat: -23.550520, lng: -46.633308 };
  }, [isCreating, newGeofence.latitude, newGeofence.longitude, safeGeofences]);

  // Render existing geofences
  useEffect(() => {
    if (!map || safeGeofences.length === 0) return;

    // Clear existing geofence markers and circles
    geofenceMarkersRef.current.forEach(marker => marker.setMap(null));
    geofenceCirclesRef.current.forEach(circle => circle.setMap(null));
    geofenceMarkersRef.current = [];
    geofenceCirclesRef.current = [];

    // Create new geofence markers and circles
    safeGeofences.forEach((geofence) => {
      const circle = new google.maps.Circle({
        map: map,
        center: { lat: geofence.latitude, lng: geofence.longitude },
        radius: geofence.radius,
        fillColor: '#10b981',
        fillOpacity: 0.2,
        strokeColor: '#10b981',
        strokeOpacity: 0.8,
        strokeWeight: 2,
      });

      const marker = new google.maps.Marker({
        map: map,
        position: { lat: geofence.latitude, lng: geofence.longitude },
        title: geofence.name,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${geofence.name}</h3>
          <p style="font-size: 12px; color: #666;">Raio: ${geofence.radius}m</p>
        </div>`,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      geofenceCirclesRef.current.push(circle);
      geofenceMarkersRef.current.push(marker);
    });

    return () => {
      geofenceCirclesRef.current.forEach(circle => circle.setMap(null));
      geofenceMarkersRef.current.forEach(marker => marker.setMap(null));
    };
  }, [map, safeGeofences]);

  // Handle preview with native Google Maps API
  useEffect(() => {
    console.log('[Preview Effect] Running with:', {
      hasMap: !!map,
      mapType: map?.constructor?.name,
      isCreating,
      lat: newGeofence.latitude,
      lng: newGeofence.longitude,
      radius: newGeofence.radius,
    });

    if (!map) {
      console.log('[Preview Effect] No map, exiting');
      return;
    }

    // Clean up existing preview objects
    if (previewMarkerRef.current) {
      console.log('[Preview Effect] Cleaning up existing marker');
      previewMarkerRef.current.setMap(null);
      previewMarkerRef.current = null;
    }
    if (previewCircleRef.current) {
      console.log('[Preview Effect] Cleaning up existing circle');
      previewCircleRef.current.setMap(null);
      previewCircleRef.current = null;
    }
    if (previewInfoWindowRef.current) {
      console.log('[Preview Effect] Cleaning up existing info window');
      previewInfoWindowRef.current.close();
      previewInfoWindowRef.current = null;
    }

    // Create preview if in creation mode and location is set
    if (isCreating && newGeofence.latitude && newGeofence.longitude) {
      console.log('[Preview Effect] Creating preview objects...');
      const position = { lat: newGeofence.latitude, lng: newGeofence.longitude };

      try {
        // Create preview circle
        console.log('[Preview Effect] Creating circle with radius:', newGeofence.radius);
        previewCircleRef.current = new google.maps.Circle({
          map: map,
          center: position,
          radius: newGeofence.radius,
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
          strokeColor: '#3b82f6',
          strokeOpacity: 0.8,
          strokeWeight: 2,
        });
        console.log('[Preview Effect] Circle created successfully!');

        // Create preview marker (draggable)
        console.log('[Preview Effect] Creating marker at:', position);
        previewMarkerRef.current = new google.maps.Marker({
          map: map,
          position: position,
          title: newGeofence.name || 'Nova Zona (Arraste para reposicionar)',
          draggable: true,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });
        console.log('[Preview Effect] Marker created successfully!');

        // Add drag listener to update position
        previewMarkerRef.current.addListener('dragend', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const newLat = event.latLng.lat();
            const newLng = event.latLng.lng();
            console.log('[Preview Effect] Marker dragged to:', { lat: newLat, lng: newLng });

            setNewGeofence(prev => ({
              ...prev,
              latitude: newLat,
              longitude: newLng,
            }));
          }
        });

        // Create info window for preview
        previewInfoWindowRef.current = new google.maps.InfoWindow({
          content: `<div style="padding: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 4px; color: #3b82f6;">Preview - Nova Zona</h3>
            <p style="font-size: 12px; color: #666;">Raio: ${newGeofence.radius}m</p>
            <p style="font-size: 11px; color: #999; margin-top: 4px;">Clique em "Salvar Zona" para criar</p>
          </div>`,
        });
        console.log('[Preview Effect] InfoWindow created');

        // Show info window briefly
        previewInfoWindowRef.current.open(map, previewMarkerRef.current);
        setTimeout(() => {
          if (previewInfoWindowRef.current) {
            previewInfoWindowRef.current.close();
          }
        }, 3000);

        // Add click listener to preview marker
        previewMarkerRef.current.addListener('click', () => {
          if (previewInfoWindowRef.current && previewMarkerRef.current) {
            previewInfoWindowRef.current.open(map, previewMarkerRef.current);
          }
        });

        console.log('[Preview Effect] All preview objects created successfully!');
      } catch (error) {
        console.error('[Preview Effect] Error creating preview objects:', error);
      }
    } else {
      console.log('[Preview Effect] Not creating preview:', { isCreating, hasLat: !!newGeofence.latitude, hasLng: !!newGeofence.longitude });
    }

    // Cleanup function
    return () => {
      if (previewMarkerRef.current) {
        previewMarkerRef.current.setMap(null);
        previewMarkerRef.current = null;
      }
      if (previewCircleRef.current) {
        previewCircleRef.current.setMap(null);
        previewCircleRef.current = null;
      }
      if (previewInfoWindowRef.current) {
        previewInfoWindowRef.current.close();
        previewInfoWindowRef.current = null;
      }
    };
  }, [map, isCreating, newGeofence.latitude, newGeofence.longitude, newGeofence.radius, newGeofence.name]);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (isCreatingRef.current && event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setNewGeofence(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));
    }
  }, []);

  const handlePlaceSelect = useCallback((place: { lat: number; lng: number; address: string }) => {
    setNewGeofence(prev => ({
      ...prev,
      latitude: place.lat,
      longitude: place.lng,
      name: prev.name || place.address.split(',')[0],
    }));
  }, []);

  const handleSave = async () => {
    if (!newGeofence.latitude || !newGeofence.longitude || !newGeofence.name) {
      alert('Preencha todos os campos e defina uma localização');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: newGeofence.name,
        latitude: newGeofence.latitude,
        longitude: newGeofence.longitude,
        radius: newGeofence.radius,
      });

      setNewGeofence({ name: '', radius: 20 });
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving geofence:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="w-full"
        >
          {isCreating ? 'Cancelar' : '+ Adicionar Zona Segura'}
        </Button>

        {isCreating && (
          <div className="border rounded-lg p-4 space-y-4 bg-white shadow-sm">
            <h3 className="font-semibold">Nova Zona</h3>

            <GoogleAddressSearch onPlaceSelect={handlePlaceSelect} />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">ou</span>
              </div>
            </div>

            <div className="text-sm bg-blue-50 p-3 rounded border border-blue-200 space-y-1">
              {newGeofence.latitude ? (
                <>
                  <p className="font-semibold text-green-700 flex items-center gap-1">
                    <span className="text-green-600">✓</span> Localização definida
                  </p>
                  <p className="text-xs text-gray-700">Lat: {newGeofence.latitude.toFixed(6)}</p>
                  <p className="text-xs text-gray-700">Lng: {newGeofence.longitude?.toFixed(6)}</p>
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <p className="text-xs text-blue-700 font-medium">Dica: Arraste o marcador azul para ajustar a posição</p>
                  </div>
                </>
              ) : (
                <p className="text-gray-700 font-medium">Clique no mapa para definir a localização</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={newGeofence.name}
                onChange={(e) => setNewGeofence(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Casa, Parque..."
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Raio: {newGeofence.radius}m</label>
              <p className="text-xs text-gray-500 mt-1">
                O círculo azul no mapa mostra a área da zona segura
              </p>
              <Slider
                value={[newGeofence.radius]}
                onValueChange={([value]) => {
                  setNewGeofence(prev => ({ ...prev, radius: value }));
                }}
                min={10}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={!newGeofence.latitude || !newGeofence.name || isSaving}
              className="w-full"
            >
              {isSaving ? 'Salvando...' : 'Salvar Zona'}
            </Button>
          </div>
        )}

        <GeofenceList
          geofences={safeGeofences}
          onDelete={onDelete}
        />
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="h-[600px] rounded-lg overflow-hidden border shadow-lg">
          <NativeGoogleMap
            center={mapCenter}
            zoom={18}
            className="h-full w-full"
            style={{ height: '100%', width: '100%' }}
            onMapLoad={setMap}
            onClick={handleMapClick}
          />
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h4 className="text-sm font-semibold mb-3 text-gray-700">Legenda do Mapa</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
              <span className="text-gray-600">Zonas seguras cadastradas</span>
            </div>
            {isCreating && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                <span className="text-gray-600">Nova zona (preview)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
