import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendGeofenceAlertEmailParams {
  recipientEmails: string[];
  deviceName: string;
  patientName: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  pauseAlertLink: string;
}

export async function sendGeofenceAlertEmail({
  recipientEmails,
  deviceName,
  patientName,
  latitude,
  longitude,
  timestamp,
  pauseAlertLink,
}: SendGeofenceAlertEmailParams) {
  const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

  try {
    const { data, error } = await resend.emails.send({
      // Usando domínio de teste padrão do Resend (sempre funciona sem verificação)
      from: `${process.env.ALERTS_FROM_NAME || 'Alzheimer Care'} <onboarding@resend.dev>`,
      to: recipientEmails,
      subject: `🚨 Alerta: ${patientName} saiu da área segura`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .alert-box { background-color: #fee; border-left: 4px solid #f00; padding: 15px; margin: 20px 0; }
              .info-box { background-color: #f9f9f9; border: 1px solid #ddd; padding: 15px; margin: 20px 0; }
              .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
              .button-secondary { background-color: #6c757d; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>🚨 Alerta de Geofence</h2>

              <div class="alert-box">
                <strong>${patientName}</strong> saiu da área segura configurada.
              </div>

              <div class="info-box">
                <p><strong>Dispositivo:</strong> ${deviceName}</p>
                <p><strong>Paciente:</strong> ${patientName}</p>
                <p><strong>Horário:</strong> ${new Date(timestamp).toLocaleString('pt-BR')}</p>
                <p><strong>Localização:</strong> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
              </div>

              <div style="text-align: center;">
                <a href="${googleMapsLink}" class="button" target="_blank">
                  Ver Localização no Mapa
                </a>
                <a href="${pauseAlertLink}" class="button button-secondary" target="_blank">
                  Pausar Alertas por 1 hora
                </a>
              </div>

              <div class="footer">
                <p>Este é um alerta automático do sistema ${process.env.ALERTS_FROM_NAME}.</p>
                <p>Se você está acompanhando o paciente, clique em "Pausar Alertas" para não receber notificações temporariamente.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send geofence alert email:', error);
    throw error;
  }
}

interface SendLowBatteryEmailParams {
  recipientEmails: string[];
  deviceName: string;
  patientName: string;
  batteryLevel: number;
}

export async function sendLowBatteryEmail({
  recipientEmails,
  deviceName,
  patientName,
  batteryLevel,
}: SendLowBatteryEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      // Usando domínio de teste padrão do Resend (sempre funciona sem verificação)
      from: `${process.env.ALERTS_FROM_NAME || 'Alzheimer Care'} <onboarding@resend.dev>`,
      to: recipientEmails,
      subject: `🔋 Bateria Baixa: ${deviceName} - ${Math.round(batteryLevel)}%`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .warning-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
              .info-box { background-color: #f9f9f9; border: 1px solid #ddd; padding: 15px; margin: 20px 0; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>🔋 Alerta de Bateria Baixa</h2>

              <div class="warning-box">
                O dispositivo de <strong>${patientName}</strong> está com bateria baixa.
              </div>

              <div class="info-box">
                <p><strong>Dispositivo:</strong> ${deviceName}</p>
                <p><strong>Paciente:</strong> ${patientName}</p>
                <p><strong>Nível de Bateria:</strong> ${Math.round(batteryLevel)}%</p>
              </div>

              <p>Por favor, carregue o dispositivo o mais breve possível para garantir o monitoramento contínuo.</p>

              <div class="footer">
                <p>Este é um alerta automático do sistema ${process.env.ALERTS_FROM_NAME}.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send low battery email:', error);
    throw error;
  }
}
