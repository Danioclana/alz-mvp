'use client';

import { useEffect, useRef, useState } from 'react';

interface NativeGoogleMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  onMapLoad?: (map: google.maps.Map) => void;
  onClick?: (event: google.maps.MapMouseEvent) => void;
  children?: React.ReactNode;
}

export function NativeGoogleMap({
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Wait for Google Maps API to load
    const checkGoogleMaps = setInterval(() => {
      if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
        clearInterval(checkGoogleMaps);
        setIsLoaded(true);
      }
    }, 100);

    return () => clearInterval(checkGoogleMaps);
  }, []);

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

    if (onClick) {
      console.log('[NativeGoogleMap] Adding click listener');
      map.addListener('click', onClick);
    }

    if (onMapLoad) {
      console.log('[NativeGoogleMap] Calling onMapLoad callback');
      onMapLoad(map);
    }
  }, [isLoaded, onClick, onMapLoad]);

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
}
