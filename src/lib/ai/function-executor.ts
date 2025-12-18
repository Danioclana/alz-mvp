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
 * Converte Clerk userId para Supabase user_id
 */
async function getSupabaseUserId(clerkUserId: string): Promise<number | null> {
    const supabase = await createClient({ useServiceRole: true });

    console.log('[getSupabaseUserId] Converting Clerk ID:', clerkUserId);

    const { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkUserId)
        .single();

    console.log('[getSupabaseUserId] Result:', { userId: user?.id, error });

    return user?.id || null;
}

/**
 * Obtém a localização atual de um dispositivo
 */
async function getCurrentLocation(deviceId: string, userId: number) {
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
async function getDeviceStatus(deviceId: string, userId: number) {
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
async function listGeofences(deviceId: string, userId: number) {
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
        .eq('device_id', device.id)  // Corrigido: usar device_id ao invés de hardware_id
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
    userId: number
) {
    console.log('[createGeofence] Called with:', { deviceId, name, latitude, longitude, radius, userId });

    const supabase = await createClient({ useServiceRole: true });

    // Verificar permissão
    const { data: device, error: deviceError } = await supabase
        .from('devices')
        .select('id')
        .eq('hardware_id', deviceId)
        .eq('user_id', userId)
        .single();

    console.log('[createGeofence] Device lookup:', { device, deviceError });

    if (!device) {
        console.log('[createGeofence] Device not found for user');
        return {
            success: false,
            error: 'Dispositivo não encontrado ou você não tem permissão.',
        };
    }

    // Validar raio
    if (radius < 10 || radius > 5000) {
        return {
            success: false,
            error: 'O raio deve estar entre 10 e 5000 metros.',
        };
    }

    // Criar geofence
    console.log('[createGeofence] Inserting:', { device_id: device.id, name, latitude, longitude, radius });

    const { data: geofence, error } = await supabase
        .from('geofences')
        .insert({
            device_id: device.id,  // Corrigido: usar device_id ao invés de hardware_id
            name,
            latitude,
            longitude,
            radius,
        })
        .select()
        .single();

    console.log('[createGeofence] Insert result:', { geofence, error });

    if (error) {
        console.log('[createGeofence] Failed:', error);
        return {
            success: false,
            error: `Erro ao criar zona segura: ${error.message}`,
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
 * Remove uma zona segura
 */
async function deleteGeofence(deviceId: string, userId: number, geofenceId?: number, geofenceName?: string) {
    const supabase = await createClient({ useServiceRole: true });

    // Buscar device
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

    let query = supabase.from('geofences').delete().eq('device_id', device.id);

    if (geofenceId) {
        query = query.eq('id', geofenceId);
    } else if (geofenceName) {
        query = query.eq('name', geofenceName);
    } else {
        return {
            success: false,
            error: 'É necessário fornecer o ID ou nome da zona segura.',
        };
    }

    const { error } = await query;

    if (error) {
        return {
            success: false,
            error: 'Erro ao remover zona segura.',
        };
    }

    return {
        success: true,
        data: {
            message: 'Zona segura removida com sucesso.',
        },
    };
}

/**
 * Obtém histórico de alertas
 */
async function getAlertHistory(deviceId: string, days: number = 7, userId: number) {
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
async function getLocationHistory(deviceId: string, hours: number = 24, userId: number) {
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
async function listDevices(userId: number) {
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
async function analyzeGeofenceSuggestions(deviceId: string, days: number = 7, userId: number) {
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
        .eq('device_id', device.id);  // Corrigido: usar device_id ao invés de hardware_id

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
 * Registra um novo dispositivo
 */
async function registerDevice(hardwareId: string, name: string, patientName: string, userId: number) {
    const supabase = await createClient({ useServiceRole: true });

    // Verificar se já existe
    const { data: existing } = await supabase
        .from('devices')
        .select('id')
        .eq('hardware_id', hardwareId)
        .single();

    if (existing) {
        return {
            success: false,
            error: 'Este dispositivo já está cadastrado.',
        };
    }

    // Criar dispositivo
    const { data: device, error } = await supabase
        .from('devices')
        .insert({
            user_id: userId,
            hardware_id: hardwareId,
            name,
            patient_name: patientName,
        })
        .select()
        .single();

    if (error) {
        return {
            success: false,
            error: 'Erro ao cadastrar dispositivo.',
        };
    }

    // Criar configuração de alerta padrão
    await supabase.from('alert_configs').insert({
        device_id: device.id,
        alerts_enabled: true,
        alert_frequency_minutes: 15,
        recipient_emails: [],
        recipient_phones: [],
    });

    // Criar status inicial
    await supabase.from('alert_status').insert({
        device_id: device.id,
        is_outside_geofence: false,
        accompanied_mode_enabled: false,
    });

    return {
        success: true,
        data: {
            message: `Dispositivo "${name}" cadastrado com sucesso para o paciente ${patientName}!`,
            device,
        },
    };
}

/**
 * Remove um dispositivo
 */
async function deleteDevice(deviceId: string, userId: number) {
    const supabase = await createClient({ useServiceRole: true });

    // Verificar ownership e deletar
    const { error } = await supabase
        .from('devices')
        .delete()
        .eq('hardware_id', deviceId)
        .eq('user_id', userId);

    if (error) {
        return {
            success: false,
            error: 'Erro ao deletar dispositivo.',
        };
    }

    return {
        success: true,
        data: {
            message: 'Dispositivo removido com sucesso.',
        },
    };
}

/**
 * Atualiza configurações de alerta
 */
async function updateAlertConfig(
    deviceId: string,
    userId: number,
    params: {
        emails?: string[];
        phones?: string[];
        frequencyMinutes?: number;
        enabled?: boolean;
    }
) {
    const supabase = await createClient({ useServiceRole: true });

    // Buscar device
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

    // Buscar configuração atual para não sobrescrever
    const { data: currentConfig } = await supabase
        .from('alert_configs')
        .select('*')
        .eq('device_id', device.id)
        .maybeSingle();

    // Arrays atuais
    let currentEmails: string[] = [];
    let currentPhones: string[] = [];

    if (currentConfig) {
        // Separar emails e telefones da lista mista (formato compatível com route.ts)
        const mixedList: string[] = currentConfig.recipient_emails || [];
        
        currentEmails = mixedList.filter(e => !e.startsWith('phone:'));
        currentPhones = mixedList
            .filter(e => e.startsWith('phone:'))
            .map(e => e.replace('phone:', ''));
            
        // Se houver a coluna recipient_phones (migração 002), também considerar
        if (currentConfig.recipient_phones && Array.isArray(currentConfig.recipient_phones)) {
            currentPhones = [...currentPhones, ...currentConfig.recipient_phones];
        }
    }

    // Mesclar com novos valores (sem duplicatas)
    const newEmails = params.emails 
        ? [...new Set([...currentEmails, ...params.emails])] 
        : currentEmails;
        
    const newPhones = params.phones 
        ? [...new Set([...currentPhones, ...params.phones])] 
        : currentPhones;

    // Reempacotar tudo em recipient_emails (padrão do sistema para compatibilidade)
    const bundledEmails = [
        ...newEmails,
        ...newPhones.map(p => `phone:${p}`)
    ];

    const updates: any = {
        recipient_emails: bundledEmails,
        updated_at: new Date().toISOString()
    };

    if (params.frequencyMinutes !== undefined) updates.alert_frequency_minutes = params.frequencyMinutes;
    if (params.enabled !== undefined) updates.alerts_enabled = params.enabled;

    // Usar upsert para criar se não existir
    const { error } = await supabase
        .from('alert_configs')
        .upsert({
            device_id: device.id,
            ...updates
        }, { onConflict: 'device_id' });

    if (error) {
        console.error('[updateAlertConfig] DB Error:', error);
        return {
            success: false,
            error: 'Erro ao atualizar configurações de alerta no banco de dados.',
        };
    }

    return {
        success: true,
        data: {
            message: 'Configurações de alerta atualizadas com sucesso!',
            currentSettings: {
                emails: newEmails,
                phones: newPhones,
                enabled: params.enabled ?? currentConfig?.alerts_enabled ?? true
            }
        },
    };
}

/**
 * Atualiza informações do paciente/dispositivo
 */
async function updatePatientInfo(
    deviceId: string,
    userId: number,
    params: {
        patientName?: string;
        deviceName?: string;
    }
) {
    const supabase = await createClient({ useServiceRole: true });

    const updates: any = {};
    if (params.patientName) updates.patient_name = params.patientName;
    if (params.deviceName) updates.name = params.deviceName;

    const { error } = await supabase
        .from('devices')
        .update(updates)
        .eq('hardware_id', deviceId)
        .eq('user_id', userId);

    if (error) {
        return {
            success: false,
            error: 'Erro ao atualizar informações.',
        };
    }

    return {
        success: true,
        data: {
            message: 'Informações atualizadas com sucesso!',
        },
    };
}

/**
 * Executor principal de funções
 */
export async function executeFunction(
    functionName: string,
    args: FunctionArgs,
    clerkUserId: string
): Promise<any> {
    try {
        // Resolver Supabase ID uma única vez
        const userId = await getSupabaseUserId(clerkUserId);

        if (!userId) {
            console.error('[executeFunction] User not found for Clerk ID:', clerkUserId);
            return {
                success: false,
                error: 'Usuário não autenticado ou não encontrado no sistema.',
            };
        }

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

            case 'registerDevice':
                return await registerDevice(args.hardwareId, args.name, args.patientName, userId);

            case 'deleteDevice':
                return await deleteDevice(args.deviceId, userId);

            case 'deleteGeofence':
                return await deleteGeofence(args.deviceId, userId, args.geofenceId, args.geofenceName);

            case 'updateAlertConfig':
                return await updateAlertConfig(args.deviceId, userId, {
                    emails: args.emails,
                    phones: args.phones,
                    frequencyMinutes: args.frequencyMinutes,
                    enabled: args.enabled,
                });

            case 'updatePatientInfo':
                return await updatePatientInfo(args.deviceId, userId, {
                    patientName: args.patientName,
                    deviceName: args.deviceName,
                });

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
