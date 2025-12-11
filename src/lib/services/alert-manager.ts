import { createClient } from '@/lib/supabase/server';
import { sendGeofenceAlertEmail } from './email';
import { sendGeofenceAlertWhatsApp } from './whatsapp';
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
      .maybeSingle();

    if (configError) {
      console.error('Error fetching alert config:', configError);
      return;
    }

    if (!alertConfig) {
      console.log(`⚠️ [Alert] No alert config found for device ${deviceId}. Creating default...`);
      // Criar config padrão se não existir
      const { data: newConfig, error: createError } = await supabase
        .from('alert_configs')
        .insert({
          device_id: deviceId,
          alerts_enabled: true,
          recipient_emails: [],
          alert_frequency_minutes: 15,
        })
        .select()
        .single();

      if (createError || !newConfig) {
        console.error('Error creating default alert config:', createError);
        return;
      }

      // Continuar com a nova config (que estará vazia de emails/phones, então vai parar na próxima verificação)
      // Mas pelo menos garante que o registro existe
      return;
    }

    // Se alertas estão desabilitados, não fazer nada
    if (!alertConfig.alerts_enabled) {
      return;
    }

    // Separar emails e telefones (telefones vêm com prefixo phone: dentro de recipient_emails)
    const rawEmails = alertConfig.recipient_emails || [];
    const realEmails = rawEmails.filter((e: string) => !e.startsWith('phone:'));
    const phonesFromEmails = rawEmails
      .filter((e: string) => e.startsWith('phone:'))
      .map((e: string) => e.replace('phone:', ''));

    const realPhones = phonesFromEmails; // recipient_phones não existe no banco

    console.log(`📋 [Alert] Config found: Emails=${realEmails.length}, Phones=${realPhones.length}, Enabled=${alertConfig.alerts_enabled}`);
    console.log(`📱 [Alert] Phone numbers from DB:`, realPhones);

    const hasEmails = realEmails.length > 0;
    const hasPhones = realPhones.length > 0;

    if (!hasEmails && !hasPhones) {
      console.log(`⚠️ [Alert] No recipients configured for device ${deviceId}`);
      return;
    }

    // Buscar status de alerta
    const { data: alertStatus, error: statusError } = await supabase
      .from('alert_status')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (statusError) {
      console.error('Error fetching alert status:', statusError);
      return;
    }

    // Se não existir status, criar um padrão
    let currentStatus = alertStatus;
    if (!currentStatus) {
      const { data: newStatus, error: createStatusError } = await supabase
        .from('alert_status')
        .insert({
          device_id: deviceId,
          is_outside_geofence: true, // Assumindo que está fora pois foi chamado
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createStatusError) {
        console.error('Error creating alert status:', createStatusError);
        return;
      }
      currentStatus = newStatus;
    }

    // Verificar se alertas estão pausados
    if (currentStatus.alert_paused_until) {
      const pausedUntil = new Date(currentStatus.alert_paused_until);
      if (pausedUntil > new Date()) {
        console.log(`Alerts paused until ${pausedUntil.toISOString()}`);
        return;
      }
    }

    // Verificar se está no modo acompanhado
    if (currentStatus.accompanied_mode_enabled && currentStatus.accompanied_mode_until) {
      const accompaniedUntil = new Date(currentStatus.accompanied_mode_until);
      if (accompaniedUntil > new Date()) {
        console.log(`Accompanied mode active until ${accompaniedUntil.toISOString()}`);
        return;
      }
    }

    // Verificar frequência de alertas (não enviar se já enviou recentemente)
    if (currentStatus.last_alert_sent_at) {
      const lastAlertTime = new Date(currentStatus.last_alert_sent_at);
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
    if (hasEmails) {
      console.log(`📧 [Alert] Sending email to ${realEmails.length} recipients...`);
      if (!process.env.RESEND_API_KEY) {
        console.error('❌ [Alert] RESEND_API_KEY is missing!');
      } else {
        await sendGeofenceAlertEmail({
          recipientEmails: realEmails,
          deviceName: device.name,
          patientName: device.patient_name,
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
          pauseAlertLink,
        });
        console.log('✅ [Alert] Email sent successfully');
      }
    }

    // Enviar WhatsApp
    if (hasPhones) {
      console.log(`📱 [Alert] Sending WhatsApp to ${realPhones.length} recipients...`);
      if (!process.env.CALLMEBOT_API_KEY) {
        console.error('❌ [Alert] CALLMEBOT_API_KEY is missing!');
      } else {
        try {
          await sendGeofenceAlertWhatsApp({
            recipientPhones: realPhones,
            deviceName: device.name,
            patientName: device.patient_name,
            latitude,
            longitude,
            pauseAlertLink,
          });
          console.log('✅ [Alert] WhatsApp sent successfully');
        } catch (error) {
          console.error('❌ [Alert] Failed to send WhatsApp:', error);
        }
      }
    }

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
      sent_to_emails: alertConfig.recipient_emails || [],
      sent_to_phones: alertConfig.recipient_phones || [],
      sent_at: new Date().toISOString(),
    });

    console.log(`Geofence alert sent for device ${deviceId}`);
  } catch (error) {
    console.error('Error sending geofence alert:', error);
  }
}
