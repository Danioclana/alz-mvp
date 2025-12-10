'use client';

import { useEffect, useState, useCallback } from 'react';
import { AlertConfig, Device } from '@/types';
import { AlertConfigForm } from '@/components/alerts/AlertConfigForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AlertsPage({
  params,
}: {
  params: Promise<{ hardwareId: string }>;
}) {
  const [hardwareId, setHardwareId] = useState<string>('');
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(p => setHardwareId(p.hardwareId));
  }, [params]);

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
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/devices/${hardwareId}`}>
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Alertas - {device?.name || hardwareId}
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure como e quando você deseja receber notificações
          </p>
        </div>
      </div>

      {config && (
        <AlertConfigForm
          hardwareId={hardwareId}
          initialConfig={config}
          onSave={handleSave}
        />
      )}

      <div className="mt-6 bg-warning/10 border border-warning/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Importante
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Configure pelo menos um email para receber alertas</li>
          <li>• Os alertas só são enviados quando há geofences configuradas</li>
          <li>• Verifique sua caixa de spam se não estiver recebendo os emails</li>
        </ul>
      </div>
    </div>
  );
}
