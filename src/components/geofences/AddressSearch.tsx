'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface AddressSearchProps {
  onLocationSelect: (lat: number, lon: number, address: string) => void;
}

export function AddressSearch({ onLocationSelect }: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=br`
      );
      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching address:', error);
      alert('Erro ao buscar endereço');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    onLocationSelect(
      parseFloat(result.lat),
      parseFloat(result.lon),
      result.display_name
    );
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative space-y-2">
      <label className="text-sm font-medium">Buscar Endereço</label>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Digite um endereço..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          size="md"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelectResult(result)}
              className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors border-b last:border-b-0"
            >
              <p className="text-sm text-gray-900">{result.display_name}</p>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !loading && (
        <div className="absolute z-50 w-full bg-white border rounded-lg shadow-lg px-4 py-3">
          <p className="text-sm text-gray-500">Nenhum resultado encontrado</p>
        </div>
      )}
    </div>
  );
}
