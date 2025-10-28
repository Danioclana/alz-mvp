import { createClient } from '@/lib/supabase/server';
import { sendGeofenceAlertEmail } from './email';
import type { AlertConfig, AlertStatus, Device } from '@/types';

/**
 * Processa e envia alertas de geofence se necessário
 * @param deviceId ID do device
 * @param latitude Latitude atual
 * @param longitude Longitude atual
 */
export async function sendGeofenceAlert(
  deviceId: number,
  latitude: number,
  longitude: number
) {
  const supabase = await createClient({ useServiceRole: true });

  try {
    // Buscar configurações de alerta
    const { data: alertConfig, error: configError } = await supabase
      .from('alert_configs')
      .select('*')
      .eq('device_id', deviceId)
      .single();

    if (configError) {
      console.error('Error fetching alert config:', configError);
      return;
    }

    // Se alertas estão desabilitados, não fazer nada
    if (!alertConfig.alerts_enabled) {
      return;
    }

    // Se não há emails configurados, não fazer nada
    if (!alertConfig.recipient_emails || alertConfig.recipient_emails.length === 0) {
      return;
    }

    // Buscar status de alerta
    const { data: alertStatus, error: statusError } = await supabase
      .from('alert_status')
      .select('*')
      .eq('device_id', deviceId)
      .single();

    if (statusError) {
      console.error('Error fetching alert status:', statusError);
      return;
    }

    // Verificar se alertas estão pausados
    if (alertStatus.alert_paused_until) {
      const pausedUntil = new Date(alertStatus.alert_paused_until);
      if (pausedUntil > new Date()) {
        console.log(`Alerts paused until ${pausedUntil.toISOString()}`);
        return;
      }
    }

    // Verificar se está no modo acompanhado
    if (alertStatus.accompanied_mode_enabled && alertStatus.accompanied_mode_until) {
      const accompaniedUntil = new Date(alertStatus.accompanied_mode_until);
      if (accompaniedUntil > new Date()) {
        console.log(`Accompanied mode active until ${accompaniedUntil.toISOString()}`);
        return;
      }
    }

    // Verificar frequência de alertas (não enviar se já enviou recentemente)
    if (alertStatus.last_alert_sent_at) {
      const lastAlertTime = new Date(alertStatus.last_alert_sent_at);
      const minutesSinceLastAlert =
        (Date.now() - lastAlertTime.getTime()) / (1000 * 60);

      if (minutesSinceLastAlert < alertConfig.alert_frequency_minutes) {
        console.log(
          `Alert throttled. Last sent ${minutesSinceLastAlert.toFixed(1)} minutes ago`
        );
        return;
      }
    }

    // Buscar informações do device
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('*')
      .eq('id', deviceId)
      .single();

    if (deviceError || !device) {
      console.error('Error fetching device:', deviceError);
      return;
    }

    // Criar link para pausar alertas
    const pauseAlertLink = `${process.env.NEXT_PUBLIC_APP_URL}/alerts/pause?device=${device.hardware_id}`;

    // Enviar email
    await sendGeofenceAlertEmail({
      recipientEmails: alertConfig.recipient_emails,
      deviceName: device.name,
      patientName: device.patient_name,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
      pauseAlertLink,
    });

    // Atualizar último alerta enviado
    await supabase
      .from('alert_status')
      .update({
        last_alert_sent_at: new Date().toISOString(),
      })
      .eq('device_id', deviceId);

    // Registrar no histórico
    await supabase.from('alert_history').insert({
      device_id: deviceId,
      alert_type: 'GEOFENCE_VIOLATION',
      latitude,
      longitude,
      sent_to_emails: alertConfig.recipient_emails,
      sent_at: new Date().toISOString(),
    });

    console.log(`Geofence alert sent for device ${deviceId}`);
  } catch (error) {
    console.error('Error sending geofence alert:', error);
  }
}
