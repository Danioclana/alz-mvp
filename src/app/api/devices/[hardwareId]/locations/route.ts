import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { ensureUserExists } from '@/lib/services/user-sync';

type RouteContext = {
  params: Promise<{ hardwareId: string }>;
};

/**
 * GET /api/devices/[hardwareId]/locations
 * Busca as últimas localizações de um dispositivo
 *
 * Query params:
 *   limit: número de localizações a retornar (default: 10, max: 100)
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

    const userIdSupabase = await ensureUserExists();
    if (!userIdSupabase) {
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

    const supabase = await createClient({ useServiceRole: true });

    // Buscar device garantindo ownership
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id')
      .eq('hardware_id', hardwareId)
      .eq('user_id', userIdSupabase)
      .single();

    if (deviceError || !device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Buscar últimas localizações
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('*')
      .eq('device_id', device.id)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (locationsError) {
      console.error('Error fetching locations:', locationsError);
      return NextResponse.json(
        { error: 'Failed to fetch locations' },
        { status: 500 }
      );
    }

    return NextResponse.json(locations || []);
  } catch (error) {
    console.error('Error in GET /api/devices/[hardwareId]/locations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
