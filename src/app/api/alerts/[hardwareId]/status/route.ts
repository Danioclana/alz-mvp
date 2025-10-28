import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{ hardwareId: string }>;
};

/**
 * GET /api/alerts/[hardwareId]/status
 * Busca status atual de alertas
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

    const supabase = await createClient();

    // Buscar device
    const { data: device } = await supabase
      .from('devices')
      .select('id')
      .eq('hardware_id', hardwareId)
      .single();

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Buscar status
    const { data: status, error } = await supabase
      .from('alert_status')
      .select('*')
      .eq('device_id', device.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch alert status' },
        { status: 500 }
      );
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error in GET /api/alerts/status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
