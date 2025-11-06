'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface GoogleAddressSearchProps {
  onPlaceSelect: (place: { lat: number; lng: number; address: string }) => void;
}

export function GoogleAddressSearch({ onPlaceSelect }: GoogleAddressSearchProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Wait for Google Maps API to load
    const checkGoogleMaps = setInterval(() => {
      if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        clearInterval(checkGoogleMaps);
        setIsLoaded(true);
      }
    }, 100);

    return () => clearInterval(checkGoogleMaps);
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || searchBoxRef.current) return;

    console.log('[GoogleAddressSearch] Initializing SearchBox...');

    // Create SearchBox
    const searchBox = new google.maps.places.SearchBox(inputRef.current);
    searchBoxRef.current = searchBox;

    // Listen for place selection
    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();

      if (!places || places.length === 0) {
        console.log('[GoogleAddressSearch] No places found');
        return;
      }

      const place = places[0];

      if (!place.geometry || !place.geometry.location) {
        alert('Nenhum detalhe disponível para o local selecionado');
        return;
      }

      console.log('[GoogleAddressSearch] Place selected:', place.formatted_address);

      onPlaceSelect({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address || place.name || ''
      });
    });

    console.log('[GoogleAddressSearch] SearchBox initialized');
  }, [isLoaded, onPlaceSelect]);

  if (!isLoaded) {
    return <p className="text-sm text-gray-500">Carregando busca...</p>;
  }

  return (
    <div className="relative">
      <label className="text-sm font-medium block mb-1">Buscar Endereço</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Digite um endereço ou local..."
          className="pl-10"
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Comece a digitar e selecione uma sugestão
      </p>
    </div>
  );
}
