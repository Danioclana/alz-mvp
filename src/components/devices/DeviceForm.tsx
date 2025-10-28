'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DeviceFormData {
  hardwareId: string;
  name: string;
  patientName: string;
}

export function DeviceForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<DeviceFormData>({
    hardwareId: '',
    name: '',
    patientName: '',
  });
  const [errors, setErrors] = useState<Partial<DeviceFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          // Zod validation errors
          const zodErrors: any = {};
          Object.keys(data.details).forEach((key) => {
            if (data.details[key]._errors?.[0]) {
              zodErrors[key] = data.details[key]._errors[0];
            }
          });
          setErrors(zodErrors);
        } else {
          setServerError(data.error || 'Erro ao criar dispositivo');
        }
        return;
      }

      // Sucesso - redirecionar para o device
      router.push(`/devices/${data.hardware_id}`);
      router.refresh();
    } catch (error) {
      setServerError('Erro ao criar dispositivo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Dispositivo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {serverError}
            </div>
          )}

          <Input
            label="ID do Hardware"
            placeholder="Ex: ESP32-ABC123"
            required
            value={formData.hardwareId}
            onChange={(e) =>
              setFormData({ ...formData, hardwareId: e.target.value })
            }
            error={errors.hardwareId}
          />

          <Input
            label="Nome do Dispositivo"
            placeholder="Ex: Rastreador Principal"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
          />

          <Input
            label="Nome do Paciente"
            placeholder="Ex: Maria da Silva"
            required
            value={formData.patientName}
            onChange={(e) =>
              setFormData({ ...formData, patientName: e.target.value })
            }
            error={errors.patientName}
          />

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h4 className="font-medium text-blue-900 mb-2">📝 Instruções</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• O ID do Hardware deve corresponder ao ID programado no ESP32</li>
              <li>• Use um nome descritivo para facilitar a identificação</li>
              <li>• O nome do paciente ajuda a personalizar os alertas</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Dispositivo'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
