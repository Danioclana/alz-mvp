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

        console.log(`🔍 [WhatsApp] Sending to: +${formattedPhone}`);

        const response = await axios.get(url);

        console.log(`📡 [WhatsApp] Response status: ${response.status}, data:`, response.data);

        if (response.status !== 200) {
            throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
        }

        console.log(`✅ WhatsApp sent to +${formattedPhone}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`❌ Error sending WhatsApp to +${formattedPhone}:`, {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
        } else {
            console.error(`❌ Error sending WhatsApp to +${formattedPhone}:`, error);
        }
        throw error; // Re-lançar o erro para que o alert-manager saiba que falhou
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
