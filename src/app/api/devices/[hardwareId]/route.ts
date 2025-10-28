import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { DeviceSchema } from '@/lib/validations/device';

type RouteContext = {
  params: Promise<{ hardwareId: string }>;
};

/**
 * GET /api/devices/[hardwareId]
 * Busca um dispositivo específico
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

    // Buscar device (RLS garante ownership)
    const { data: device, error } = await supabase
      .from('devices')
      .select('*')
      .eq('hardware_id', hardwareId)
      .single();

    if (error || !device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    return NextResponse.json(device);
  } catch (error) {
    console.error('Error in GET /api/devices/[hardwareId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/devices/[hardwareId]
 * Atualiza um dispositivo
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
    const validation = DeviceSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Buscar device para verificar ownership
    const { data: existingDevice } = await supabase
      .from('devices')
      .select('id')
      .eq('hardware_id', hardwareId)
      .single();

    if (!existingDevice) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Atualizar device
    const updateData: any = {};
    if (validation.data.name) updateData.name = validation.data.name;
    if (validation.data.patientName) updateData.patient_name = validation.data.patientName;

    const { data: device, error } = await supabase
      .from('devices')
      .update(updateData)
      .eq('hardware_id', hardwareId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update device' },
        { status: 500 }
      );
    }

    return NextResponse.json(device);
  } catch (error) {
    console.error('Error in PUT /api/devices/[hardwareId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/devices/[hardwareId]
 * Remove um dispositivo
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

    const supabase = await createClient();

    // Deletar device (RLS garante ownership)
    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('hardware_id', hardwareId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete device' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/devices/[hardwareId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
