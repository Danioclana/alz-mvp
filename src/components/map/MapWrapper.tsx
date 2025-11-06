'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import '@/lib/leaflet-config';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    )
  }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

interface MapWrapperProps {
  center: [number, number];
  zoom: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function MapWrapper({ center, zoom, className, style, children }: MapWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`} style={style}>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={style}
      scrollWheelZoom={true}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
}
