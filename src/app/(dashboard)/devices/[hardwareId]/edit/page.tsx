import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { DeviceForm } from '@/components/devices/DeviceForm';
import { createClient } from '@/lib/supabase/server';
import { ensureUserExists } from '@/lib/services/user-sync';

async function getDevice(hardwareId: string) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  try {
    const userIdSupabase = await ensureUserExists();
    if (!userIdSupabase) {
      console.error('Failed to sync user');
      notFound();
    }

    const supabase = await createClient({ useServiceRole: true });

    const { data: device, error } = await supabase
      .from('devices')
      .select('*')
      .eq('hardware_id', hardwareId)
      .eq('user_id', userIdSupabase)
      .single();

    if (error || !device) {
      notFound();
    }

    return device;
  } catch (error) {
    console.error('Error fetching device:', error);
    notFound();
  }
}

export default async function EditDevicePage({
  params,
}: {
  params: Promise<{ hardwareId: string }>;
}) {
  const { hardwareId } = await params;
  const device = await getDevice(hardwareId);

  const initialData = {
    hardwareId: device.hardware_id,
    name: device.name,
    patientName: device.patient_name,
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/devices/${hardwareId}`}
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ← Voltar para Detalhes
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Editar Dispositivo</h1>
        <p className="text-muted-foreground mt-1">
          Atualize as informações do dispositivo e do paciente.
        </p>
      </div>

      <DeviceForm initialData={initialData} isEditing={true} />
    </div>
  );
}
