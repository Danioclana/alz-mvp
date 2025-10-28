import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function HistoryPage({
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
        <h1 className="text-3xl font-bold text-gray-900">Histórico de Localizações</h1>
        <p className="text-gray-600 mt-1">
          Visualize o histórico completo de movimentações do dispositivo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Localizações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma localização registrada
            </h3>
            <p className="text-gray-600">
              O histórico aparecerá aqui quando o ESP32 começar a enviar dados
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          📈 Recursos do Histórico
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Visualize todas as localizações com data e hora</li>
          <li>• Filtre por período (hoje, última semana, último mês)</li>
          <li>• Veja o trajeto percorrido no mapa</li>
          <li>• Exporte dados para análise externa</li>
        </ul>
      </div>
    </div>
  );
}
