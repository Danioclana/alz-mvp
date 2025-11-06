'use client';

import { Location } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Battery } from 'lucide-react';

interface LocationTimelineProps {
  locations: Location[];
}

export function LocationTimeline({ locations }: LocationTimelineProps) {
  const safeLocations = Array.isArray(locations) ? locations : [];

  if (safeLocations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma localização registrada
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {safeLocations.map((location, index) => (
        <div
          key={location.id}
          className="flex gap-4 items-start border-l-2 border-emerald-200 pl-4 pb-4 relative"
        >
          {/* Timeline dot */}
          <div className="absolute -left-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />

          <div className="flex-1 bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium text-gray-900">
                    {format(new Date(location.timestamp), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Coordenadas:</span>{' '}
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>

                  {location.battery_level !== null && (
                    <div className="flex items-center gap-2 mt-2">
                      <Battery
                        className={`h-4 w-4 ${
                          location.battery_level < 20
                            ? 'text-red-500'
                            : location.battery_level < 50
                              ? 'text-yellow-500'
                              : 'text-green-500'
                        }`}
                      />
                      <span className="text-sm">
                        Bateria: {location.battery_level}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {index === 0 && (
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                  Mais recente
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
