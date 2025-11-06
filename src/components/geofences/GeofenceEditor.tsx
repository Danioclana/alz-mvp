'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Geofence } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { GeofenceList } from './GeofenceList';
import { AddressSearch } from './AddressSearch';
import { MapWrapper } from '@/components/map/MapWrapper';

// Dynamically import map components to avoid SSR issues
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

// Create a separate component for MapEvents that can be imported client-side only
const MapEventsComponent = dynamic(
  () => import('./MapEvents').then((mod) => mod.MapEvents),
  { ssr: false }
);

interface GeofenceEditorProps {
  hardwareId: string;
  existingGeofences: Geofence[];
  onSave: (geofence: { name: string; latitude: number; longitude: number; radius: number }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}


export function GeofenceEditor({ hardwareId, existingGeofences, onSave, onDelete }: GeofenceEditorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newGeofence, setNewGeofence] = useState<{
    name: string;
    latitude?: number;
    longitude?: number;
    radius: number;
  }>({
    name: '',
    radius: 200,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Ensure existingGeofences is always an array
  const safeGeofences = Array.isArray(existingGeofences) ? existingGeofences : [];

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setNewGeofence(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  }, []);

  const handleAddressSelect = useCallback((lat: number, lon: number, address: string) => {
    setNewGeofence(prev => ({
      ...prev,
      latitude: lat,
      longitude: lon,
      name: prev.name || address.split(',')[0], // Auto-fill name if empty
    }));
  }, []);

  const handleSave = async () => {
    if (!newGeofence.latitude || !newGeofence.longitude || !newGeofence.name) {
      alert('Preencha todos os campos e clique no mapa');
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

      // Reset form
      setNewGeofence({ name: '', radius: 200 });
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving geofence:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate initial map center
  const mapCenter: [number, number] = safeGeofences.length > 0
    ? [safeGeofences[0].latitude, safeGeofences[0].longitude]
    : [-23.550520, -46.633308]; // São Paulo default

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lista lateral */}
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

            <AddressSearch onLocationSelect={handleAddressSelect} />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">ou</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
              {newGeofence.latitude
                ? '✓ Localização definida'
                : 'Clique no mapa para definir a localização'
              }
            </p>

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
              <Slider
                value={[newGeofence.radius]}
                onValueChange={([value]) => setNewGeofence(prev => ({ ...prev, radius: value }))}
                min={50}
                max={1000}
                step={50}
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

        {/* Lista de geofences existentes */}
        <GeofenceList
          geofences={safeGeofences}
          onDelete={onDelete}
        />
      </div>

      {/* Mapa */}
      <div className="lg:col-span-2 h-[600px] rounded-lg overflow-hidden border shadow-lg">
        <MapWrapper
          center={mapCenter}
          zoom={13}
          className="h-full w-full"
          style={{ height: '100%', width: '100%' }}
        >
          <MapEventsComponent isCreating={isCreating} onMapClick={handleMapClick} />

          {/* Geofences existentes */}
          {safeGeofences.map((geofence) => (
            <Circle
              key={geofence.id}
              center={[geofence.latitude, geofence.longitude]}
              radius={geofence.radius}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.2,
              }}
            />
          ))}

          {/* Preview da nova geofence */}
          {isCreating && newGeofence.latitude && newGeofence.longitude && (
            <>
              <Marker position={[newGeofence.latitude, newGeofence.longitude]} />
              <Circle
                center={[newGeofence.latitude, newGeofence.longitude]}
                radius={newGeofence.radius}
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.3,
                  dashArray: '5, 5',
                }}
              />
            </>
          )}
        </MapWrapper>
      </div>
    </div>
  );
}
