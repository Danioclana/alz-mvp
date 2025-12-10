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
      recipient_phones: [],
      alert_frequency_minutes: 30,
      created_at: '',
      updated_at: '',
    }
  );

  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      // Unpack phones from emails if they are mixed
      const emails = initialConfig.recipient_emails.filter(e => !e.startsWith('phone:'));
      const phonesFromEmails = initialConfig.recipient_emails
        .filter(e => e.startsWith('phone:'))
        .map(e => e.replace('phone:', ''));

      const existingPhones = initialConfig.recipient_phones || [];
      const allPhones = [...new Set([...existingPhones, ...phonesFromEmails])];

      setConfig({
        ...initialConfig,
        recipient_emails: emails,
        recipient_phones: allPhones
      });
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

  const addPhone = () => {
    const phone = newPhone.trim();
    if (!phone) return;

    // Validação simples de telefone (apenas números, min 10 dígitos)
    if (!/^\d{10,}$/.test(phone)) {
      alert('Telefone inválido. Use apenas números, com DDD e código do país (ex: 5511999999999)');
      return;
    }

    const currentPhones = config.recipient_phones || [];
    if (currentPhones.includes(phone)) {
      alert('Telefone já adicionado');
      return;
    }

    setConfig(prev => ({
      ...prev,
      recipient_phones: [...(prev.recipient_phones || []), phone],
    }));
    setNewPhone('');
  };

  const removePhone = (phone: string) => {
    setConfig(prev => ({
      ...prev,
      recipient_phones: (prev.recipient_phones || []).filter(p => p !== phone),
    }));
  };

  const handleSave = async () => {
    if (config.recipient_emails.length === 0 && (!config.recipient_phones || config.recipient_phones.length === 0)) {
      alert('Adicione pelo menos um email ou telefone');
      return;
    }

    setSaving(true);
    try {
      // Combine emails and phones into recipient_emails array with phone: prefix
      const combinedEmails = [
        ...config.recipient_emails,
        ...(config.recipient_phones || []).map(p => `phone:${p}`)
      ];

      await onSave({
        ...config,
        recipient_emails: combinedEmails,
        recipient_phones: config.recipient_phones || []
      });
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
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

      {/* WhatsApp Phones */}
      <div className="py-4 border-b">
        <h3 className="font-semibold text-lg mb-3">WhatsApp (Telefones)</h3>
        <p className="text-sm text-gray-600 mb-2">
          Adicione números no formato internacional (ex: 5511999999999)
        </p>
        <div className="flex gap-2 mb-3">
          <Input
            type="tel"
            placeholder="5511999999999"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && addPhone()}
          />
          <Button onClick={addPhone} size="md">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(!config.recipient_phones || config.recipient_phones.length === 0) ? (
            <p className="text-sm text-gray-500 py-2">Nenhum telefone adicionado</p>
          ) : (
            config.recipient_phones.map((phone) => (
              <Badge key={phone} variant="default" className="gap-2 px-3 py-1">
                {phone}
                <button onClick={() => removePhone(phone)} className="hover:text-red-600">
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
          min={5}
          max={120}
          step={5}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5 min</span>
          <span>120 min</span>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-4 pt-4">
        <Button
          onClick={handleSave}
          disabled={saving || (config.recipient_emails.length === 0 && (!config.recipient_phones || config.recipient_phones.length === 0))}
          className="flex-1"
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}
