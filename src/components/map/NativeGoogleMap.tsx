'use client';

import { useEffect, useRef, useState, memo } from 'react';
import { useLoadScript } from '@react-google-maps/api';

const libraries: ("places" | "drawing" | "geometry")[] = ['places', 'drawing', 'geometry'];

interface NativeGoogleMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  onMapLoad?: (map: google.maps.Map) => void;
  onClick?: (event: google.maps.MapMouseEvent) => void;
  children?: React.ReactNode;
}

export const NativeGoogleMap = memo(function NativeGoogleMap({
  center,
  zoom = 18,
  className,
  style,
  onMapLoad,
  onClick,
  children
}: NativeGoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  console.log('[NativeGoogleMap] Render', { center, zoom, hasMap: !!mapInstanceRef.current, isLoaded, loadError });

  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    console.log('[NativeGoogleMap] Creating map instance...');

    // Create map
    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    console.log('[NativeGoogleMap] Map created:', map.constructor.name);

    mapInstanceRef.current = map;

    if (onMapLoad) {
      console.log('[NativeGoogleMap] Calling onMapLoad callback');
      onMapLoad(map);
    }
  }, [isLoaded]);

  // Update click listener when onClick changes
  useEffect(() => {
    if (!mapInstanceRef.current || !onClick) return;

    const listener = mapInstanceRef.current.addListener('click', onClick);

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [onClick]);

  // Update center when it changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setCenter(center);
    }
  }, [center.lat, center.lng]);

  // Update zoom when it changes
  useEffect(() => {
    if (mapInstanceRef.current && zoom) {
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [zoom]);

  if (loadError) {
    return (
      <div className={className} style={style}>
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div className="text-center text-red-600">
            <p className="font-semibold">Erro ao carregar Google Maps</p>
            <p className="text-sm mt-1">Verifique a configuração da API key</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={className} style={style}>
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-600">Carregando Google Maps...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={mapRef} className={className} style={style} />
      {children}
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.center.lat === nextProps.center.lat &&
    prevProps.center.lng === nextProps.center.lng &&
    prevProps.zoom === nextProps.zoom &&
    prevProps.className === nextProps.className &&
    prevProps.onClick === nextProps.onClick &&
    prevProps.onMapLoad === nextProps.onMapLoad
  );
});
