import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { DeviceSchema } from '@/lib/validations/device';
import { ensureUserExists } from '@/lib/services/user-sync';

/**
 * GET /api/devices
 * Lista todos os dispositivos do usuário autenticado
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Autenticação
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Garantir que usuário existe no Supabase (cria automaticamente se necessário)
    const userIdSupabase = await ensureUserExists();

    if (!userIdSupabase) {
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
    }

    // Usar service role para bypassar RLS (já validamos autenticação via Clerk)
    const supabase = await createClient({ useServiceRole: true });

    // 3. Buscar devices
    const { data: devices, error } = await supabase
      .from('devices')
      .select(`
        *,
        locations (
          latitude,
          longitude,
          timestamp,
          battery_level
        )
      `)
      .eq('user_id', userIdSupabase)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching devices:', error);
      return NextResponse.json(
        { error: 'Failed to fetch devices' },
        { status: 500 }
      );
    }

    // 4. Formatar resposta (incluir lastLocation se existir)
    const formattedDevices = devices.map((device: any) => ({
      ...device,
      lastLocation: device.locations && device.locations.length > 0 ? device.locations[0] : null,
      locations: undefined, // Remover do response
    }));

    return NextResponse.json(formattedDevices);
  } catch (error) {
    console.error('Unexpected error in GET /api/devices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/devices
 * Registra novo dispositivo
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Autenticação
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validar body
    const body = await request.json();
    const validation = DeviceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { hardwareId, name, patientName } = validation.data;

    // 3. Garantir que usuário existe no Supabase (cria automaticamente se necessário)
    const userIdSupabase = await ensureUserExists();

    if (!userIdSupabase) {
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
    }

    // Usar service role para bypassar RLS (já validamos autenticação via Clerk)
    const supabase = await createClient({ useServiceRole: true });

    // 4. Verificar se hardwareId já existe
    const { data: existing } = await supabase
      .from('devices')
      .select('id')
      .eq('hardware_id', hardwareId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Device with this hardware ID already exists' },
        { status: 409 }
      );
    }

    // 5. Criar device
    const { data: device, error } = await supabase
      .from('devices')
      .insert({
        user_id: userIdSupabase,
        hardware_id: hardwareId,
        name,
        patient_name: patientName,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating device:', error);
      return NextResponse.json(
        { error: 'Failed to create device' },
        { status: 500 }
      );
    }

    return NextResponse.json(device, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/devices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
