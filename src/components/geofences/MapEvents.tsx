'use client';

import { useMapEvents } from 'react-leaflet';
import { useEffect } from 'react';
import '@/lib/leaflet-config';

interface MapEventsProps {
  isCreating: boolean;
  onMapClick: (lat: number, lng: number) => void;
}

export function MapEvents({ isCreating, onMapClick }: MapEventsProps) {
  const map = useMapEvents({
    click: (e) => {
      if (isCreating) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  useEffect(() => {
    // Force map to recalculate size on mount
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
}
