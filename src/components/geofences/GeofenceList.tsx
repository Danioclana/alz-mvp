'use client';

import { Geofence } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface GeofenceListProps {
  geofences: Geofence[];
  onDelete?: (id: number) => void;
}

export function GeofenceList({ geofences, onDelete }: GeofenceListProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Zonas Cadastradas</h3>

      {geofences.length === 0 ? (
        <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded text-center">
          Nenhuma zona cadastrada
        </p>
      ) : (
        geofences.map((geofence) => (
          <div
            key={geofence.id}
            className="border rounded-lg p-3 flex items-center justify-between bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{geofence.name}</h4>
              <p className="text-sm text-gray-600">Raio: {geofence.radius}m</p>
            </div>

            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (confirm(`Excluir zona "${geofence.name}"?`)) {
                    onDelete(geofence.id);
                  }
                }}
                className="ml-2"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
