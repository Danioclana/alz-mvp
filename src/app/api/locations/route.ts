import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LocationSchema } from '@/lib/validations/location';
import { checkGeofenceViolation } from '@/lib/services/geofence-checker';
import { sendGeofenceAlert } from '@/lib/services/alert-manager';

/**
 * POST /api/locations
 *
 * Recebe dados de localização do ESP32
 *
 * Headers:
 *   X-Device-ID: string (required)
 *
 * Body:
 *   {
 *     latitude: number,
 *     longitude: number,
 *     timestamp: number (Unix timestamp),
 *     batteryLevel?: number (0-100)
 *   }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validar Device ID
    const deviceId = request.headers.get('X-Device-ID');
    if (!deviceId) {
      return NextResponse.json(
        { error: 'X-Device-ID header is required' },
        { status: 400 }
      );
    }

    // 2. Parse e validar body
    const body = await request.json();
    const validation = LocationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { latitude, longitude, timestamp, batteryLevel } = validation.data;

    // 3. Conectar ao Supabase com SERVICE ROLE (bypass RLS)
    const supabase = await createClient({ useServiceRole: true });

    // 4. Verificar se device existe
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id, user_id')
      .eq('hardware_id', deviceId)
      .single();

    if (deviceError || !device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    // 5. Inserir localização
    const { error: locationError } = await supabase
      .from('locations')
      .insert({
        device_id: device.id,
        latitude,
        longitude,
        timestamp: new Date(timestamp * 1000).toISOString(),
        battery_level: batteryLevel,
      });

    if (locationError) {
      console.error('Error inserting location:', locationError);
      return NextResponse.json(
        { error: 'Failed to save location' },
        { status: 500 }
      );
    }

    // 6. Atualizar device (bateria e timestamp)
    await supabase
      .from('devices')
      .update({
        battery_level: batteryLevel,
        last_location_at: new Date(timestamp * 1000).toISOString(),
      })
      .eq('id', device.id);

    // 7. Verificar geofences e processar alertas (async, não bloqueia resposta)
    checkGeofenceViolation(device.id, latitude, longitude)
      .then((isOutside) => {
        if (isOutside) {
          sendGeofenceAlert(device.id, latitude, longitude);
        }
      })
      .catch((error) => {
        console.error('Error checking geofence:', error);
      });

    // 8. Responder ao ESP32
    return NextResponse.json(
      { message: 'Location received' },
      { status: 202 } // 202 Accepted
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/locations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
