import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MapPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mapa de Localização</h1>
        <p className="text-gray-600 mt-1">
          Visualize a localização de todos os seus dispositivos em tempo real
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mapa Interativo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Mapa em Desenvolvimento
              </h3>
              <p className="text-gray-600 mb-4">
                O componente de mapa Leaflet será implementado em breve
              </p>
              <p className="text-sm text-gray-500">
                Por enquanto, você pode ver os detalhes de localização nas páginas dos dispositivos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          🔜 Recursos do Mapa (Em breve)
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Visualização de todos os dispositivos no mapa</li>
          <li>• Marcadores com informações em tempo real</li>
          <li>• Geofences exibidas como círculos no mapa</li>
          <li>• Rastreamento de movimento e histórico de trajetos</li>
          <li>• Zoom automático para melhor visualização</li>
        </ul>
      </div>
    </div>
  );
}
