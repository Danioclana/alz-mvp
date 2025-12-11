import { createClient } from '@/lib/supabase/server';
import { isPointInsideCircle } from '@/lib/utils/distance';
import { sendGeofenceAlert } from './alert-manager';
import type { Geofence } from '@/types';

/**
 * Verifica se a localização está fora de todas as geofences do device
 * @param deviceId ID do device
 * @param latitude Latitude atual
 * @param longitude Longitude atual
 * @returns true se está fora de todas as geofences
 */
export async function checkGeofenceViolation(
  deviceId: number,
  latitude: number,
  longitude: number
): Promise<boolean> {
  const supabase = await createClient({ useServiceRole: true });

  // Buscar todas as geofences do device
  const { data: geofences, error } = await supabase
    .from('geofences')
    .select('*')
    .eq('device_id', deviceId);

  if (error) {
    console.error('Error fetching geofences:', error);
    throw error;
  }

  // Se não há geofences configuradas, não há violação
  if (!geofences || geofences.length === 0) {
    return false;
  }

  // Verificar se está dentro de pelo menos uma geofence
  console.log(`🔍 [Geofence] Checking ${geofences.length} geofences for device ${deviceId}`);

  const isInsideAnyGeofence = geofences.some((geofence: Geofence) => {
    const isInside = isPointInsideCircle(
      latitude,
      longitude,
      geofence.latitude,
      geofence.longitude,
      geofence.radius
    );

    if (isInside) {
      console.log(`✅ [Geofence] Inside "${geofence.name}" (ID: ${geofence.id})`);
    }

    return isInside;
  });

  // Se não está dentro de nenhuma, está fora (violação)
  const isOutside = !isInsideAnyGeofence;

  // Atualizar status de alerta (usando upsert para garantir que existe)
  const { error: statusError } = await supabase
    .from('alert_status')
    .upsert({
      device_id: deviceId,
      is_outside_geofence: isOutside,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'device_id' });

  if (statusError) {
    console.error('Error updating alert status:', statusError);
  }

  if (isOutside) {
    // Tentar enviar alerta (o gerenciador cuida da frequência e configurações)
    await sendGeofenceAlert(deviceId, latitude, longitude);
  }

  return isOutside;
}
