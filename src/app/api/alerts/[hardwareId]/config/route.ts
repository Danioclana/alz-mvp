import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { AlertConfigSchema } from '@/lib/validations/alert';

type RouteContext = {
  params: Promise<{ hardwareId: string }>;
};

/**
 * GET /api/alerts/[hardwareId]/config
 * Busca configuração de alertas
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

    // Buscar configuração
    const { data: config, error } = await supabase
      .from('alert_configs')
      .select('*')
      .eq('device_id', device.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch alert config' },
        { status: 500 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error in GET /api/alerts/config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/alerts/[hardwareId]/config
 * Atualiza configuração de alertas
 */
export async function PUT(
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
    const validation = AlertConfigSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
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

    // Atualizar configuração
    const updateData: any = {};
    if (validation.data.alertsEnabled !== undefined) {
      updateData.alerts_enabled = validation.data.alertsEnabled;
    }
    if (validation.data.recipientEmails !== undefined) {
      updateData.recipient_emails = validation.data.recipientEmails;
    }
    if (validation.data.recipientPhones !== undefined) {
      updateData.recipient_phones = validation.data.recipientPhones;
    }
    if (validation.data.alertFrequencyMinutes !== undefined) {
      updateData.alert_frequency_minutes = validation.data.alertFrequencyMinutes;
    }

    const { data: config, error } = await supabase
      .from('alert_configs')
      .update(updateData)
      .eq('device_id', device.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update alert config' },
        { status: 500 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error in PUT /api/alerts/config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
