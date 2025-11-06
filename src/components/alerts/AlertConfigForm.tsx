'use client';

import { useState, useEffect } from 'react';
import { AlertConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface AlertConfigFormProps {
  hardwareId: string;
  initialConfig?: AlertConfig;
  onSave: (config: AlertConfig) => Promise<void>;
}

export function AlertConfigForm({ hardwareId, initialConfig, onSave }: AlertConfigFormProps) {
  const [config, setConfig] = useState<AlertConfig>(
    initialConfig || {
      id: 0,
      device_id: 0,
      alerts_enabled: true,
      recipient_emails: [],
      alert_frequency_minutes: 30,
      created_at: '',
      updated_at: '',
    }
  );

  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const addEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Email inválido');
      return;
    }

    if (config.recipient_emails.includes(email)) {
      alert('Email já adicionado');
      return;
    }

    setConfig(prev => ({
      ...prev,
      recipient_emails: [...prev.recipient_emails, email],
    }));
    setNewEmail('');
  };

  const removeEmail = (email: string) => {
    setConfig(prev => ({
      ...prev,
      recipient_emails: prev.recipient_emails.filter(e => e !== email),
    }));
  };

  const handleSave = async () => {
    if (config.recipient_emails.length === 0) {
      alert('Adicione pelo menos um email');
      return;
    }

    setSaving(true);
    try {
      await onSave(config);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 border rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-2xl font-bold">Configuração de Alertas</h2>

      {/* Ativar/Desativar */}
      <div className="flex items-center justify-between py-4 border-b">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Alertas Ativados</h3>
          <p className="text-sm text-gray-600">
            Receber notificações quando o dispositivo sair das zonas seguras
          </p>
        </div>
        <Switch
          checked={config.alerts_enabled}
          onCheckedChange={(checked) => setConfig(prev => ({ ...prev, alerts_enabled: checked }))}
        />
      </div>

      {/* Emails */}
      <div className="py-4 border-b">
        <h3 className="font-semibold text-lg mb-3">Emails de Notificação</h3>
        <div className="flex gap-2 mb-3">
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addEmail()}
          />
          <Button onClick={addEmail} size="md">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {config.recipient_emails.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">Nenhum email adicionado</p>
          ) : (
            config.recipient_emails.map((email) => (
              <Badge key={email} variant="default" className="gap-2 px-3 py-1">
                {email}
                <button onClick={() => removeEmail(email)} className="hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* Frequência */}
      <div className="py-4 border-b">
        <h3 className="font-semibold text-lg mb-2">
          Frequência Mínima: {config.alert_frequency_minutes} minutos
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Tempo mínimo entre alertas consecutivos (evita spam)
        </p>
        <Slider
          value={[config.alert_frequency_minutes]}
          onValueChange={([value]) => setConfig(prev => ({ ...prev, alert_frequency_minutes: value }))}
          min={15}
          max={120}
          step={15}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>15 min</span>
          <span>120 min</span>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-4 pt-4">
        <Button
          onClick={handleSave}
          disabled={saving || config.recipient_emails.length === 0}
          className="flex-1"
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}
