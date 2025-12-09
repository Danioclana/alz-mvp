import axios from 'axios';

interface SendWhatsAppMessageParams {
    phoneNumber: string;
    message: string;
}

export async function sendWhatsAppMessage({
    phoneNumber,
    message,
}: SendWhatsAppMessageParams) {
    const apiKey = process.env.CALLMEBOT_API_KEY;

    if (!apiKey) {
        console.warn('CALLMEBOT_API_KEY is not set. WhatsApp message will not be sent.');
        return;
    }

    // CallMeBot expects the phone number to include the country code
    // We'll assume the input might or might not have it, but for now let's pass it as is
    // or sanitize it.
    const formattedPhone = phoneNumber.replace(/\D/g, '');

    try {
        const encodedMessage = encodeURIComponent(message);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${formattedPhone}&text=${encodedMessage}&apikey=${apiKey}`;

        const response = await axios.get(url);

        if (response.status !== 200) {
            throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
        }

        return response.data;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        // Don't throw, just log, so we don't break the whole alert flow if WA fails
    }
}

interface SendGeofenceAlertWhatsAppParams {
    recipientPhones: string[];
    deviceName: string;
    patientName: string;
    latitude: number;
    longitude: number;
    pauseAlertLink: string;
}

export async function sendGeofenceAlertWhatsApp({
    recipientPhones,
    deviceName,
    patientName,
    latitude,
    longitude,
    pauseAlertLink,
}: SendGeofenceAlertWhatsAppParams) {
    const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    const message = `🚨 *ALERTA DE SEGURANÇA* 🚨

O paciente *${patientName}* (Dispositivo: ${deviceName}) saiu da área segura!

📍 *Localização Atual:*
${googleMapsLink}

⏸️ *Pausar Alertas:*
${pauseAlertLink}

_Mensagem automática do sistema de monitoramento._`;

    const promises = recipientPhones.map((phone) =>
        sendWhatsAppMessage({
            phoneNumber: phone,
            message,
        })
    );

    await Promise.all(promises);
}
