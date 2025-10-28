import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function AlertsPage({
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
        <h1 className="text-3xl font-bold text-gray-900">Configuração de Alertas</h1>
        <p className="text-gray-600 mt-1">
          Configure como e quando você deseja receber notificações
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Status dos Alertas</CardTitle>
              <Badge variant="success">Ativos</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Alertas de Geofence</p>
              <p className="font-medium">Habilitados</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Frequência de Alertas</p>
              <p className="font-medium">A cada 5 minutos</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Último Alerta Enviado</p>
              <p className="text-sm">Nenhum alerta enviado ainda</p>
            </div>
            <Button variant="secondary" className="w-full">
              Pausar Alertas por 1 hora
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Destinatários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📧</div>
              <p className="text-gray-600 mb-4">Nenhum email configurado</p>
              <Button size="sm">+ Adicionar Email</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Histórico de Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-gray-600">Nenhum alerta registrado ainda</p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">
          ⚠️ Importante
        </h3>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li>• Configure pelo menos um email para receber alertas</li>
          <li>• Os alertas só são enviados quando há geofences configuradas</li>
          <li>• Use o modo pausar para situações onde você está acompanhando o paciente</li>
          <li>• Verifique sua caixa de spam se não estiver recebendo os emails</li>
        </ul>
      </div>
    </div>
  );
}
