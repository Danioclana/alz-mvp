import axios from 'axios';

interface SendWhatsAppMessageParams {
    phoneNumber: string;
    message: string;
}

/**
 * Remove o "9" extra de números brasileiros para compatibilidade com CallMeBot
 * Números brasileiros: 55 + DDD (2 dígitos) + 9 + número (8 dígitos) = 13 dígitos
 * CallMeBot espera: 55 + DDD (2 dígitos) + número (8 dígitos) = 12 dígitos
 */
function normalizeBrazilianPhone(phone: string): string {
    // Remove tudo que não é dígito
    const digitsOnly = phone.replace(/\D/g, '');

    // Se é número brasileiro (começa com 55)
    if (digitsOnly.startsWith('55')) {
        // Verifica se tem 13 dígitos E o 5º caractere é 9 (após 55 + DDD de 2 dígitos)
        // Ex: 5531989277806 -> o 5º caractere (índice 4) é "9"
        if (digitsOnly.length === 13 && digitsOnly[4] === '9') {
            // Remove o "9" na posição 4
            return digitsOnly.slice(0, 4) + digitsOnly.slice(5);
        }

        // Se já tem 12 dígitos, pode já estar normalizado
        if (digitsOnly.length === 12) {
            return digitsOnly;
        }

        // Se tem 11 dígitos e o 3º caractere é 9 (sem código de país completo)
        // Ex: 31989277806 -> assumir que falta o código do país
        if (digitsOnly.length === 11 && digitsOnly[2] === '9') {
            // Remove o "9" na posição 2
            return digitsOnly.slice(0, 2) + digitsOnly.slice(3);
        }

        // Se tem menos de 11 dígitos mas começa com 55 e tem 9 na posição 4
        // Ex: 55989277806 (11 dígitos) onde 98 é o DDD e o próximo é 9
        if (digitsOnly.length >= 11 && digitsOnly.length < 13 && digitsOnly[4] === '9') {
            return digitsOnly.slice(0, 4) + digitsOnly.slice(5);
        }
    }

    return digitsOnly;
}

export async function sendWhatsAppMessage({
    phoneNumber,
    message,
}: SendWhatsAppMessageParams) {
    const apiKey = process.env.CALLMEBOT_API_KEY;

    console.log(`📞 [WhatsApp] Received phoneNumber parameter:`, phoneNumber);

    if (!apiKey) {
        console.warn('CALLMEBOT_API_KEY is not set. WhatsApp message will not be sent.');
        return;
    }

    // Normaliza números brasileiros removendo o "9" extra
    const formattedPhone = normalizeBrazilianPhone(phoneNumber);
    console.log(`🔢 [WhatsApp] Normalized phone:`, formattedPhone);

    try {
        const encodedMessage = encodeURIComponent(message);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${formattedPhone}&text=${encodedMessage}&apikey=${apiKey}`;

        console.log(`🔍 [WhatsApp] Sending to: +${formattedPhone}`);
        console.log(`🔗 [WhatsApp] URL: https://api.callmebot.com/whatsapp.php?phone=${formattedPhone}&text=${encodedMessage.substring(0, 50)}...&apikey=${apiKey}`);

        const response = await axios.get(url);

        console.log(`📡 [WhatsApp] Response status: ${response.status}, data:`, response.data);

        // Accept any 2xx status code as success (200-299)
        if (response.status < 200 || response.status >= 300) {
            throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
        }

        // Check if response contains error messages (CallMeBot returns 203 even on errors)
        const responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        if (responseText.includes('APIKey is invalid') ||
            responseText.includes('error') ||
            responseText.includes('Error')) {
            throw new Error(`CallMeBot API error: ${responseText.substring(0, 200)}`);
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
