import Link from 'next/link';
import { DeviceForm } from '@/components/devices/DeviceForm';

export default function NewDevicePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-primary hover:text-primary/80 mb-3 inline-block font-medium"
        >
          ← Voltar para Dashboard
        </Link>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Novo Dispositivo</h1>
        <p className="text-muted-foreground mt-2">
          Adicione um novo dispositivo de rastreamento
        </p>
      </div>

      <DeviceForm />

      <div className="mt-8 bg-primary/5 border border-primary/10 rounded-2xl p-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Como configurar seu ESP32
        </h3>
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">1</span>
            <span>Programe seu ESP32 com o código fornecido no blueprint</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">2</span>
            <span>Configure o WiFi e o ID do hardware no código</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">3</span>
            <span>O ESP32 enviará dados para: <code className="bg-primary/10 px-2 py-0.5 rounded text-primary font-mono text-xs">/api/locations</code></span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">4</span>
            <span>Após criar o dispositivo aqui, o ESP32 poderá começar a enviar localizações</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
