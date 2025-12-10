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

    // Buscar device com verificação de propriedade
    const { data: device } = await supabase
      .from('devices')
      .select('id')
      .eq('hardware_id', hardwareId)
      .eq('user_id', user.id) // Garantir que o usuário é dono do device
      .single();

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Buscar configuração
    const { data: config, error } = await supabase
      .from('alert_configs')
      .select('*')
      .eq('device_id', device.id)
      .maybeSingle(); // Usar maybeSingle para não estourar erro se não existir

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch alert config' },
        { status: 500 }
      );
    }

    // Se não existir configuração, retornar padrão (ou criar)
    if (!config) {
      const defaultConfig = {
        device_id: device.id,
        alerts_enabled: true,
        recipient_emails: [],
        recipient_phones: [],
        alert_frequency_minutes: 15,
      };

      // Opcional: Criar no banco para a próxima vez
      await supabase.from('alert_configs').insert(defaultConfig);

      return NextResponse.json(defaultConfig);
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
    console.log('[PUT /api/alerts/config] Request body:', JSON.stringify(body, null, 2));

    const validation = AlertConfigSchema.partial().safeParse(body);

    if (!validation.success) {
      console.error('[PUT /api/alerts/config] Validation error:', validation.error.format());
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
        { status: 400 }
      );
    }

    console.log('[PUT /api/alerts/config] Validation passed:', JSON.stringify(validation.data, null, 2));

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

    // Buscar device com verificação de propriedade
    const { data: device } = await supabase
      .from('devices')
      .select('id')
      .eq('hardware_id', hardwareId)
      .eq('user_id', user.id)
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
    // Note: recipient_phones não existe no banco, os telefones vão dentro de recipient_emails com prefixo phone:
    if (validation.data.alertFrequencyMinutes !== undefined) {
      updateData.alert_frequency_minutes = validation.data.alertFrequencyMinutes;
    }

    // Usar upsert para garantir que cria se não existir
    // Precisamos do device_id para o upsert funcionar corretamente se for insert
    const upsertData = {
      device_id: device.id,
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    console.log('[PUT /api/alerts/config] Upsert data:', JSON.stringify(upsertData, null, 2));

    const { data: config, error } = await supabase
      .from('alert_configs')
      .upsert(upsertData, { onConflict: 'device_id' })
      .select()
      .single();

    if (error) {
      console.error('[PUT /api/alerts/config] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update alert config', details: error.message },
        { status: 500 }
      );
    }

    console.log('[PUT /api/alerts/config] Success:', config);

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error in PUT /api/alerts/config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
