import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{ hardwareId: string }>;
};

/**
 * POST /api/alerts/[hardwareId]/pause
 * Pausa alertas por um período
 * Body: { minutes: number }
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { hardwareId } = await context.params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const minutes = body.minutes || 60; // Padrão: 1 hora

    if (minutes < 1 || minutes > 1440) {
      return NextResponse.json(
        { error: 'Minutes must be between 1 and 1440 (24 hours)' },
        { status: 400 }
      );
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

    // Calcular data de fim da pausa
    const pausedUntil = new Date();
    pausedUntil.setMinutes(pausedUntil.getMinutes() + minutes);

    // Atualizar status
    const { data: status, error } = await supabase
      .from('alert_status')
      .update({
        alert_paused_until: pausedUntil.toISOString(),
      })
      .eq('device_id', device.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to pause alerts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Alerts paused successfully',
      pausedUntil: pausedUntil.toISOString(),
      status,
    });
  } catch (error) {
    console.error('Error in POST /api/alerts/pause:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
