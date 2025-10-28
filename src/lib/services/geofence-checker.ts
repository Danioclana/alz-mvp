import { createClient } from '@/lib/supabase/server';
import { isPointInsideCircle } from '@/lib/utils/distance';
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
  const isInsideAnyGeofence = geofences.some((geofence: Geofence) =>
    isPointInsideCircle(
      latitude,
      longitude,
      geofence.latitude,
      geofence.longitude,
      geofence.radius
    )
  );

  // Se não está dentro de nenhuma, está fora (violação)
  const isOutside = !isInsideAnyGeofence;

  // Atualizar status de alerta
  await supabase
    .from('alert_status')
    .update({
      is_outside_geofence: isOutside,
      updated_at: new Date().toISOString(),
    })
    .eq('device_id', deviceId);

  return isOutside;
}
