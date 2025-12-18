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

interface DeviceFormProps {
  initialData?: DeviceFormData;
  isEditing?: boolean;
}

export function DeviceForm({ initialData, isEditing = false }: DeviceFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<DeviceFormData>(initialData || {
    hardwareId: '',
    name: '',
    patientName: '',
  });
  const [errors, setErrors] = useState<Partial<DeviceFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  
  // Consent fields
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError('');
    
    if (!isEditing && !consentGiven) {
      setServerError('É necessário aceitar o termo de consentimento.');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditing 
        ? `/api/devices/${initialData?.hardwareId}` 
        : '/api/devices';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          // Zod validation errors
          const zodErrors: Record<string, string> = {};
          Object.keys(data.details).forEach((key) => {
            if (data.details[key]._errors?.[0]) {
              zodErrors[key] = data.details[key]._errors[0];
            }
          });
          setErrors(zodErrors);
        } else {
          setServerError(data.error || 'Erro ao salvar dispositivo');
        }
        return;
      }

      // Sucesso
      if (isEditing) {
        router.push(`/devices/${data.hardware_id}`);
      } else {
        router.push(`/alerts/${data.hardware_id}?new=true`);
      }
      router.refresh();
    } catch (error) {
      setServerError('Erro ao salvar dispositivo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Dispositivo' : 'Informações do Dispositivo'}</CardTitle>
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
              disabled={isEditing}
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

            {!isEditing && (
              <div className="bg-amber-50 border border-amber-200 rounded p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <label htmlFor="consent" className="text-sm text-amber-900 block font-medium">
                      Declaro que sou o responsável legal ou cuidador autorizado.
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowConsentModal(true)}
                      className="text-sm text-blue-600 hover:underline mt-1 block text-left"
                    >
                      Ler termo de responsabilidade e uso de dados
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Dispositivo')}
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

      {/* Modal de Termos Simplificado */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Termo de Responsabilidade</h2>
            </div>
            <div className="p-6 overflow-y-auto">
              <p className="mb-4 text-sm text-gray-700">
                Ao cadastrar este dispositivo de rastreamento, você declara, sob as penas da lei, que:
              </p>
              <ol className="list-decimal pl-5 space-y-3 text-sm text-gray-700">
                <li>
                  Possui autorização legal ou consentimento expresso para monitorar a localização da pessoa portadora do dispositivo (&quot;Paciente&quot;).
                </li>
                <li>
                  O monitoramento tem como único e exclusivo fim a segurança e o bem-estar do Paciente.
                </li>
                <li>
                  Está ciente de que o uso indevido desta tecnologia para rastrear terceiros sem consentimento pode configurar crime de perseguição (Art. 147-A do Código Penal) ou violação de privacidade.
                </li>
                <li>
                  Isenta a plataforma de qualquer responsabilidade pelo uso indevido das informações de localização geradas pelo dispositivo.
                </li>
              </ol>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <Button onClick={() => setShowConsentModal(false)}>
                Entendi e Concordo
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
