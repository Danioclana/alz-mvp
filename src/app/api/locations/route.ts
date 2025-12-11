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
    console.log(`📍 [API] Receiving location for device: ${deviceId}`);

    if (!deviceId) {
      console.error('❌ [API] Missing X-Device-ID header');
      return NextResponse.json(
        { error: 'X-Device-ID header is required' },
        { status: 400 }
      );
    }

    // 2. Parse e validar body
    const body = await request.json();
    console.log('📦 [API] Payload:', JSON.stringify(body));
    const validation = LocationSchema.safeParse(body);

    if (!validation.success) {
      console.error('❌ [API] Validation failed:', validation.error.format());
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { latitude, longitude, timestamp, batteryLevel } = validation.data;
    console.log(`✅ [API] Valid data: Lat=${latitude}, Lon=${longitude}, Bat=${batteryLevel}%`);

    // 3. Conectar ao Supabase com SERVICE ROLE (bypass RLS)
    const supabase = await createClient({ useServiceRole: true });

    // 4. Verificar se device existe
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id, user_id')
      .eq('hardware_id', deviceId)
      .single();

    if (deviceError || !device) {
      console.error(`❌ [API] Device not found: ${deviceId}`);
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }
    console.log(`✅ [API] Device found: ID=${device.id}`);

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
      console.error('❌ [API] Error inserting location:', locationError);
      return NextResponse.json(
        { error: 'Failed to save location' },
        { status: 500 }
      );
    }
    console.log('✅ [API] Location saved to DB');

    // 6. Atualizar device (bateria e timestamp)
    await supabase
      .from('devices')
      .update({
        battery_level: batteryLevel,
        last_location_at: new Date(timestamp * 1000).toISOString(),
      })
      .eq('id', device.id);

    // 7. Verificar geofences e processar alertas (async, não bloqueia resposta)
    console.log('🔍 [API] Checking geofences...');
    checkGeofenceViolation(device.id, latitude, longitude)
      .then((isOutside) => {
        console.log(`🛡️ [API] Geofence check result: ${isOutside ? 'OUTSIDE' : 'INSIDE'}`);
        if (isOutside) {
          console.log('🚨 [API] Triggering alert...');
          sendGeofenceAlert(device.id, latitude, longitude);
        }
      })
      .catch((error) => {
        console.error('❌ [API] Error checking geofence:', error);
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
