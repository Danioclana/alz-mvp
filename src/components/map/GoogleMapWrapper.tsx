'use client';

import { useEffect, useRef, useState } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';

const libraries: ("places" | "drawing" | "geometry")[] = ['places', 'drawing', 'geometry'];

interface GoogleMapWrapperProps {
  center: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  onMapLoad?: (map: google.maps.Map) => void;
  onClick?: (event: google.maps.MapMouseEvent) => void;
  children?: (map: google.maps.Map) => React.ReactNode;
}

export function GoogleMapWrapper({
  center,
  zoom = 13,
  className,
  style,
  onMapLoad,
  onClick,
  children
}: GoogleMapWrapperProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const onLoad = (map: google.maps.Map) => {
    setMap(map);
    if (onMapLoad) {
      onMapLoad(map);
    }
  };

  const onUnmount = () => {
    setMap(null);
  };

  if (loadError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`} style={style}>
        <div className="text-center text-red-600">
          <p className="font-semibold">Erro ao carregar Google Maps</p>
          <p className="text-sm mt-1">Verifique a configuração da API key</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`} style={style}>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerClassName={className}
      mapContainerStyle={style}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={onClick}
      options={{
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true
      }}
    >
      {map && children && children(map)}
    </GoogleMap>
  );
}
