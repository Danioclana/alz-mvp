'use client';

import { useEffect, useState, useCallback } from 'react';
import { AlertConfig, Device } from '@/types';
import { AlertConfigForm } from '@/components/alerts/AlertConfigForm';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AlertsPageClientProps {
  hardwareId: string;
  isNew: boolean;
}

export function AlertsPageClient({ hardwareId, isNew }: AlertsPageClientProps) {
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      // Fetch device
      const deviceRes = await fetch('/api/devices');
      if (deviceRes.ok) {
        const devices = await deviceRes.json();
        const currentDevice = devices.find((d: Device) => d.hardware_id === hardwareId);
        setDevice(currentDevice);
      }

      // Fetch config
      const configRes = await fetch(`/api/alerts/${hardwareId}/config`);
      if (configRes.ok) {
        const data = await configRes.json();
        setConfig(data);
      } else {
        console.error('Failed to fetch alert config:', configRes.statusText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [hardwareId]);

  useEffect(() => {
    if (hardwareId) {
      fetchData();
    }
  }, [hardwareId, fetchData]);

  const handleSave = async (newConfig: AlertConfig) => {
    const res = await fetch(`/api/alerts/${hardwareId}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alertsEnabled: newConfig.alerts_enabled,
        recipientEmails: newConfig.recipient_emails,
        recipientPhones: newConfig.recipient_phones,
        alertFrequencyMinutes: newConfig.alert_frequency_minutes,
      }),
    });

    if (!res.ok) throw new Error('Failed to save config');

    setConfig(newConfig);

    // If it was a new device setup, we might want to redirect to the dashboard or map
    if (isNew) {
        // Optional: show a toast or message before redirecting
        router.push(`/devices/${hardwareId}`);
        router.refresh();
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        {!isNew && (
            <Link href={`/devices/${hardwareId}`}>
            <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
            </Button>
            </Link>
        )}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isNew ? 'Configuração Inicial de Alertas' : `Configuração de Alertas - ${device?.name || hardwareId}`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isNew 
              ? 'Para sua segurança, configure os alertas antes de continuar.' 
              : 'Configure como e quando você deseja receber notificações'}
          </p>
        </div>
      </div>

      {isNew && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-4 duration-500">
            <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5" />
            <div>
                <h3 className="font-semibold text-emerald-900">Dispositivo criado com sucesso!</h3>
                <p className="text-emerald-800 text-sm mt-1">
                    Agora, por favor, configure os contatos de emergência para receber notificações em caso de perigo.
                </p>
            </div>
        </div>
      )}

      <div className="flex justify-center">
        {config && (
          <AlertConfigForm
            hardwareId={hardwareId}
            initialConfig={config}
            onSave={handleSave}
            submitLabel={isNew ? 'Salvar e Concluir Configuração' : 'Salvar Alterações'}
          />
        )}
      </div>

      <div className="flex justify-center">
        <div className="max-w-2xl w-full bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Informações Importantes
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Configure pelo menos um email ou telefone para receber alertas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Os alertas só são enviados quando há áreas seguras (geofences) configuradas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Verifique sua caixa de spam se não estiver recebendo os emails</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
