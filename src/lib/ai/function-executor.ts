import { createClient } from '@/lib/supabase/server';

/**
 * Executor de Funções do Assistente IA
 * 
 * Este módulo executa as funções chamadas pelo Gemini,
 * interagindo com o banco de dados e APIs externas.
 */

interface FunctionArgs {
    [key: string]: any;
}

/**
 * Obtém a localização atual de um dispositivo
 */
async function getCurrentLocation(deviceId: string, userId: string) {
    const supabase = await createClient({ useServiceRole: true });

    // Verificar se o dispositivo pertence ao usuário
    const { data: device, error: deviceError } = await supabase
        .from('devices')
        .select('*')
        .eq('hardware_id', deviceId)
        .eq('user_id', userId)
        .single();

    if (deviceError || !device) {
        return {
            success: false,
            error: 'Dispositivo não encontrado ou você não tem permissão para acessá-lo.',
        };
    }

    // Buscar última localização
    const { data: location, error: locationError } = await supabase
        .from('locations')
        .select('*')
        .eq('hardware_id', deviceId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

    if (locationError || !location) {
        return {
            success: false,
            error: 'Nenhuma localização encontrada para este dispositivo.',
        };
    }

    // Calcular tempo desde última atualização
    const lastUpdate = new Date(location.timestamp);
    const now = new Date();
    const minutesAgo = Math.floor((now.getTime() - lastUpdate.getTime()) / 60000);

    return {
        success: true,
        data: {
            deviceName: device.name,
            latitude: location.latitude,
            longitude: location.longitude,
            batteryLevel: location.battery_level,
            timestamp: location.timestamp,
            minutesAgo,
            mapsUrl: `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
        },
    };
}

/**
 * Obtém o status completo de um dispositivo
 */
async function getDeviceStatus(deviceId: string, userId: string) {
    const supabase = await createClient({ useServiceRole: true });

    const { data: device, error } = await supabase
        .from('devices')
        .select('*')
        .eq('hardware_id', deviceId)
        .eq('user_id', userId)
        .single();

    if (error || !device) {
        return {
            success: false,
            error: 'Dispositivo não encontrado.',
        };
    }

    // Buscar última localização para bateria
    const { data: location } = await supabase
        .from('locations')
        .select('battery_level, timestamp')
        .eq('hardware_id', deviceId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

    const lastSeen = location?.timestamp ? new Date(location.timestamp) : null;
    const isOnline = lastSeen ? (new Date().getTime() - lastSeen.getTime()) < 600000 : false; // 10 min

    return {
        success: true,
        data: {
            name: device.name,
            hardwareId: device.hardware_id,
            batteryLevel: location?.battery_level || null,
            lastSeen: lastSeen?.toISOString() || null,
            isOnline,
            createdAt: device.created_at,
        },
    };
}

/**
 * Lista todas as zonas seguras de um dispositivo
 */
async function listGeofences(deviceId: string, userId: string) {
    const supabase = await createClient({ useServiceRole: true });

    // Verificar permissão
    const { data: device } = await supabase
        .from('devices')
        .select('id')
        .eq('hardware_id', deviceId)
        .eq('user_id', userId)
        .single();

    if (!device) {
        return {
            success: false,
            error: 'Dispositivo não encontrado.',
        };
    }

    const { data: geofences, error } = await supabase
        .from('geofences')
        .select('*')
        .eq('hardware_id', deviceId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        return {
            success: false,
            error: 'Erro ao buscar zonas seguras.',
        };
    }

    return {
        success: true,
        data: {
            count: geofences?.length || 0,
            geofences: geofences?.map((g) => ({
                id: g.id,
                name: g.name,
                latitude: g.latitude,
                longitude: g.longitude,
                radius: g.radius,
                createdAt: g.created_at,
            })) || [],
        },
    };
}

/**
 * Cria uma nova zona segura
 */
async function createGeofence(
    deviceId: string,
    name: string,
    latitude: number,
    longitude: number,
    radius: number,
    userId: string
) {
    const supabase = await createClient({ useServiceRole: true });

    // Verificar permissão
    const { data: device } = await supabase
        .from('devices')
        .select('id')
        .eq('hardware_id', deviceId)
        .eq('user_id', userId)
        .single();

    if (!device) {
        return {
            success: false,
            error: 'Dispositivo não encontrado.',
        };
    }

    // Validar raio
    if (radius < 50 || radius > 1000) {
        return {
            success: false,
            error: 'O raio deve estar entre 50 e 1000 metros.',
        };
    }

    // Criar geofence
    const { data: geofence, error } = await supabase
        .from('geofences')
        .insert({
            hardware_id: deviceId,
            name,
            latitude,
            longitude,
            radius,
            is_active: true,
        })
        .select()
        .single();

    if (error) {
        return {
            success: false,
            error: 'Erro ao criar zona segura.',
        };
    }

    return {
        success: true,
        data: {
            id: geofence.id,
            name: geofence.name,
            message: `Zona segura "${name}" criada com sucesso! Raio de ${radius} metros.`,
        },
    };
}

/**
 * Obtém histórico de alertas
 */
async function getAlertHistory(deviceId: string, days: number = 7, userId: string) {
    const supabase = await createClient({ useServiceRole: true });

    // Verificar permissão
    const { data: device } = await supabase
        .from('devices')
        .select('id')
        .eq('hardware_id', deviceId)
        .eq('user_id', userId)
        .single();

    if (!device) {
        return {
            success: false,
            error: 'Dispositivo não encontrado.',
        };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: alerts, error } = await supabase
        .from('alert_history')
        .select('*')
        .eq('hardware_id', deviceId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

    if (error) {
        return {
            success: false,
            error: 'Erro ao buscar histórico de alertas.',
        };
    }

    return {
        success: true,
        data: {
            count: alerts?.length || 0,
            days,
            alerts: alerts?.map((a) => ({
                type: a.alert_type,
                message: a.message,
                timestamp: a.created_at,
            })) || [],
        },
    };
}

/**
 * Obtém histórico de localizações
 */
async function getLocationHistory(deviceId: string, hours: number = 24, userId: string) {
    const supabase = await createClient({ useServiceRole: true });

    // Verificar permissão
    const { data: device } = await supabase
        .from('devices')
        .select('id')
        .eq('hardware_id', deviceId)
        .eq('user_id', userId)
        .single();

    if (!device) {
        return {
            success: false,
            error: 'Dispositivo não encontrado.',
        };
    }

    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    const { data: locations, error } = await supabase
        .from('locations')
        .select('latitude, longitude, battery_level, timestamp')
        .eq('hardware_id', deviceId)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });

    if (error) {
        return {
            success: false,
            error: 'Erro ao buscar histórico de localizações.',
        };
    }

    return {
        success: true,
        data: {
            count: locations?.length || 0,
            hours,
            locations: locations || [],
        },
    };
}

/**
 * Lista todos os dispositivos do usuário
 */
async function listDevices(userId: string) {
    const supabase = await createClient({ useServiceRole: true });

    const { data: devices, error } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        return {
            success: false,
            error: 'Erro ao buscar dispositivos.',
        };
    }

    return {
        success: true,
        data: {
            count: devices?.length || 0,
            devices: devices?.map((d) => ({
                hardwareId: d.hardware_id,
                name: d.name,
                createdAt: d.created_at,
            })) || [],
        },
    };
}

/**
 * Analisa sugestões de geofence baseadas no histórico
 */
async function analyzeGeofenceSuggestions(deviceId: string, days: number = 7, userId: string) {
    const supabase = await createClient({ useServiceRole: true });

    // Verificar permissão
    const { data: device } = await supabase
        .from('devices')
        .select('id')
        .eq('hardware_id', deviceId)
        .eq('user_id', userId)
        .single();

    if (!device) {
        return {
            success: false,
            error: 'Dispositivo não encontrado.',
        };
    }

    // Buscar histórico de localização
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: locations } = await supabase
        .from('locations')
        .select('latitude, longitude, timestamp')
        .eq('hardware_id', deviceId)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false })
        .limit(1000); // Limitar para não estourar contexto

    // Buscar geofences atuais
    const { data: geofences } = await supabase
        .from('geofences')
        .select('*')
        .eq('hardware_id', deviceId)
        .eq('is_active', true);

    // Buscar histórico de alertas de saída de zona
    const { data: alerts } = await supabase
        .from('alert_history')
        .select('*')
        .eq('hardware_id', deviceId)
        .eq('alert_type', 'GEOFENCE_EXIT')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

    return {
        success: true,
        data: {
            analysisPeriod: `${days} dias`,
            totalLocations: locations?.length || 0,
            locations: locations || [],
            currentGeofences: geofences || [],
            geofenceExitAlerts: alerts || [],
            instructions: "Analise estes dados. Se houver muitos alertas de saída de zona seguidos de retorno rápido, ou se o paciente frequenta muito uma área próxima mas fora da zona, sugira ajustes nas zonas seguras (aumentar raio, mover centro ou criar nova zona)."
        },
    };
}

/**
 * Converte endereço em coordenadas usando Nominatim (OpenStreetMap)
 */
async function geocodeAddress(address: string) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
            {
                headers: {
                    'User-Agent': 'AlzheimerCare/1.0',
                },
            }
        );

        const data = await response.json();

        if (!data || data.length === 0) {
            return {
                success: false,
                error: 'Endereço não encontrado. Tente ser mais específico.',
            };
        }

        const result = data[0];

        return {
            success: true,
            data: {
                address: result.display_name,
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon),
            },
        };
    } catch (error) {
        return {
            success: false,
            error: 'Erro ao buscar endereço.',
        };
    }
}

/**
 * Executor principal de funções
 */
export async function executeFunction(
    functionName: string,
    args: FunctionArgs,
    userId: string
): Promise<any> {
    try {
        switch (functionName) {
            case 'getCurrentLocation':
                return await getCurrentLocation(args.deviceId, userId);

            case 'getDeviceStatus':
                return await getDeviceStatus(args.deviceId, userId);

            case 'listGeofences':
                return await listGeofences(args.deviceId, userId);

            case 'createGeofence':
                return await createGeofence(
                    args.deviceId,
                    args.name,
                    args.latitude,
                    args.longitude,
                    args.radius,
                    userId
                );

            case 'getAlertHistory':
                return await getAlertHistory(args.deviceId, args.days || 7, userId);

            case 'getLocationHistory':
                return await getLocationHistory(args.deviceId, args.hours || 24, userId);

            case 'listDevices':
                return await listDevices(userId);

            case 'geocodeAddress':
                return await geocodeAddress(args.address);

            case 'analyzeGeofenceSuggestions':
                return await analyzeGeofenceSuggestions(args.deviceId, args.days, userId);

            default:
                return {
                    success: false,
                    error: `Função desconhecida: ${functionName}`,
                };
        }
    } catch (error) {
        console.error(`Error executing function ${functionName}:`, error);
        return {
            success: false,
            error: 'Erro ao executar função.',
        };
    }
}
