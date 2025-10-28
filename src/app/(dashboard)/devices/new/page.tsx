import Link from 'next/link';
import { DeviceForm } from '@/components/devices/DeviceForm';

export default function NewDevicePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-emerald-600 hover:text-emerald-700 mb-3 inline-block font-medium"
        >
          ← Voltar para Dashboard
        </Link>
        <h1 className="text-4xl font-light tracking-tight text-gray-900">Novo Dispositivo</h1>
        <p className="text-gray-600 mt-2 font-light">
          Adicione um novo dispositivo de rastreamento
        </p>
      </div>

      <DeviceForm />

      <div className="mt-8 bg-gradient-to-br from-cyan-50 to-emerald-50 border border-emerald-100 rounded-2xl p-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Como configurar seu ESP32
        </h3>
        <ol className="space-y-3 text-sm text-gray-700">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-medium">1</span>
            <span className="font-light">Programe seu ESP32 com o código fornecido no blueprint</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-medium">2</span>
            <span className="font-light">Configure o WiFi e o ID do hardware no código</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-medium">3</span>
            <span className="font-light">O ESP32 enviará dados para: <code className="bg-emerald-100 px-2 py-0.5 rounded text-emerald-700 font-mono text-xs">/api/locations</code></span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-medium">4</span>
            <span className="font-light">Após criar o dispositivo aqui, o ESP32 poderá começar a enviar localizações</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
