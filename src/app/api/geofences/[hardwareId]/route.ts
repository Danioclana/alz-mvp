import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { GeofenceSchema } from '@/lib/validations/geofence';

type RouteContext = {
  params: Promise<{ hardwareId: string }>;
};

/**
 * GET /api/geofences/[hardwareId]
 * Lista geofences do device
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { hardwareId } = await context.params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[GET /api/geofences] Fetching geofences for hardwareId:', hardwareId);

    // Usar service role para bypassar RLS (já validamos autenticação via Clerk)
    const supabase = await createClient({ useServiceRole: true });

    // Buscar internal user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Buscar device
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id')
      .eq('hardware_id', hardwareId)
      .eq('user_id', user.id) // Check ownership
      .single();

    console.log('[GET /api/geofences] Device lookup:', { device, deviceError });

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Buscar geofences
    const { data: geofences, error } = await supabase
      .from('geofences')
      .select('*')
      .eq('device_id', device.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch geofences' },
        { status: 500 }
      );
    }

    return NextResponse.json(geofences);
  } catch (error) {
    console.error('Error in GET /api/geofences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/geofences/[hardwareId]
 * Cria nova geofence
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { hardwareId } = await context.params;
    const { userId } = await auth();

    console.log('[POST /api/geofences] Creating geofence for hardwareId:', hardwareId);

    if (!userId) {
      console.log('[POST /api/geofences] Unauthorized - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[POST /api/geofences] Request body:', body);

    const validation = GeofenceSchema.safeParse(body);

    if (!validation.success) {
      console.log('[POST /api/geofences] Validation failed:', validation.error.format());
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
        { status: 400 }
      );
    }

    console.log('[POST /api/geofences] Validation success:', validation.data);

    // Usar service role para bypassar RLS (já validamos autenticação via Clerk)
    const supabase = await createClient({ useServiceRole: true });

    // Buscar internal user ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    console.log('[POST /api/geofences] User lookup:', { user, userError });

    if (!user) {
      console.log('[POST /api/geofences] User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Buscar device
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id')
      .eq('hardware_id', hardwareId)
      .eq('user_id', user.id)
      .single();

    console.log('[POST /api/geofences] Device lookup:', { device, deviceError });

    if (!device) {
      console.log('[POST /api/geofences] Device not found');
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Criar geofence
    const insertData = {
      device_id: device.id,
      ...validation.data,
    };
    console.log('[POST /api/geofences] Inserting geofence:', insertData);

    const { data: geofence, error } = await supabase
      .from('geofences')
      .insert(insertData)
      .select()
      .single();

    console.log('[POST /api/geofences] Insert result:', { geofence, error });

    if (error) {
      console.log('[POST /api/geofences] Failed to create geofence:', error);
      return NextResponse.json(
        { error: 'Failed to create geofence', details: error },
        { status: 500 }
      );
    }

    console.log('[POST /api/geofences] Geofence created successfully:', geofence);
    return NextResponse.json(geofence, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/geofences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/geofences/[hardwareId]?id=123
 * Remove uma geofence específica
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { hardwareId } = await context.params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const geofenceId = searchParams.get('id');

    if (!geofenceId) {
      return NextResponse.json(
        { error: 'Geofence ID is required' },
        { status: 400 }
      );
    }

    // Usar service role para bypassar RLS (já validamos autenticação via Clerk)
    const supabase = await createClient({ useServiceRole: true });

    // Buscar internal user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Buscar device
    const { data: device } = await supabase
      .from('devices')
      .select('id')
      .eq('hardware_id', hardwareId)
      .eq('user_id', user.id)
      .single();

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Deletar geofence
    const { error } = await supabase
      .from('geofences')
      .delete()
      .eq('id', geofenceId)
      .eq('device_id', device.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete geofence' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Geofence deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/geofences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
