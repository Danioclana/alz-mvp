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
    console.log('[GET /api/devices] Clerk userId:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Garantir que usuário existe no Supabase (cria automaticamente se necessário)
    const userIdSupabase = await ensureUserExists();
    console.log('[GET /api/devices] Supabase userId:', userIdSupabase);

    if (!userIdSupabase) {
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
    }

    // Usar service role para bypassar RLS (já validamos autenticação via Clerk)
    const supabase = await createClient({ useServiceRole: true });

    // 3. Buscar devices
    console.log('[GET /api/devices] Querying devices for user_id:', userIdSupabase);

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

    console.log('[GET /api/devices] Query result:', {
      deviceCount: devices?.length || 0,
      error,
      devices: devices?.map(d => ({ id: d.id, hardware_id: d.hardware_id, name: d.name }))
    });

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
    console.log('[POST /api/devices] Supabase userId:', userIdSupabase);

    if (!userIdSupabase) {
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
    }

    // Usar service role para bypassar RLS (já validamos autenticação via Clerk)
    const supabase = await createClient({ useServiceRole: true });

    // 4. Verificar se hardwareId já existe
    console.log('[POST /api/devices] Checking if hardwareId exists:', hardwareId);

    const { data: existing, error: existingError } = await supabase
      .from('devices')
      .select('id, user_id, hardware_id')
      .eq('hardware_id', hardwareId)
      .maybeSingle();

    console.log('[POST /api/devices] Existing device check:', { existing, existingError });

    if (existing) {
      console.log('[POST /api/devices] Device already exists!', {
        existingUserId: existing.user_id,
        currentUserId: userIdSupabase,
        sameUser: existing.user_id === userIdSupabase
      });
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
