import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function GeofencesPage({
  params,
}: {
  params: Promise<{ hardwareId: string }>;
}) {
  const { hardwareId } = await params;

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/devices/${hardwareId}`}
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ← Voltar para Dispositivo
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Geofences</h1>
            <p className="text-gray-600 mt-1">
              Gerencie áreas seguras para este dispositivo
            </p>
          </div>
          <Button>+ Nova Geofence</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Áreas Seguras Configuradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma geofence configurada
            </h3>
            <p className="text-gray-600 mb-6">
              Crie áreas seguras para receber alertas quando o paciente sair delas
            </p>
            <Button>+ Criar Primeira Geofence</Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 Como funcionam as Geofences
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Defina áreas circulares no mapa onde o paciente deve permanecer</li>
          <li>• Receba alertas por email quando sair da área segura</li>
          <li>• Configure múltiplas geofences para diferentes locais (casa, trabalho, etc.)</li>
          <li>• Ajuste o raio conforme necessário para cada localização</li>
        </ul>
      </div>
    </div>
  );
}
