/**
 * Definição de Funções Disponíveis para o Assistente IA
 * 
 * Estas funções permitem que o assistente execute ações no sistema,
 * como consultar localizações, criar zonas seguras, etc.
 */

export interface FunctionDefinition {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: Record<string, {
            type: string;
            description: string;
            enum?: string[];
            items?: { type: string };
        }>;
        required: string[];
    };
}

/**
 * Funções disponíveis para o Gemini Function Calling
 */
export const AVAILABLE_FUNCTIONS: FunctionDefinition[] = [
    {
        name: 'getCurrentLocation',
        description: 'Obtém a localização atual de um dispositivo específico. Use quando o usuário perguntar "onde está" ou "qual a localização".',
        parameters: {
            type: 'object',
            properties: {
                deviceId: {
                    type: 'string',
                    description: 'ID do dispositivo (hardware_id). Se o usuário não especificar, use o primeiro dispositivo disponível.',
                },
            },
            required: ['deviceId'],
        },
    },
    {
        name: 'getDeviceStatus',
        description: 'Obtém o status completo de um dispositivo, incluindo bateria, última atualização e estado online/offline.',
        parameters: {
            type: 'object',
            properties: {
                deviceId: {
                    type: 'string',
                    description: 'ID do dispositivo (hardware_id)',
                },
            },
            required: ['deviceId'],
        },
    },
    {
        name: 'listGeofences',
        description: 'Lista todas as zonas seguras (geofences) configuradas para um dispositivo.',
        parameters: {
            type: 'object',
            properties: {
                deviceId: {
                    type: 'string',
                    description: 'ID do dispositivo (hardware_id)',
                },
            },
            required: ['deviceId'],
        },
    },
    {
        name: 'createGeofence',
        description: 'Cria uma nova zona segura (geofence) para um dispositivo. Use IMEDIATAMENTE quando o usuário pedir para criar uma área segura. Se ele der um endereço, use geocodeAddress primeiro e depois SEMPRE chame esta função com as coordenadas obtidas. NÃO peça confirmação - crie automaticamente.',
        parameters: {
            type: 'object',
            properties: {
                deviceId: {
                    type: 'string',
                    description: 'ID do dispositivo (hardware_id)',
                },
                name: {
                    type: 'string',
                    description: 'Nome da zona segura (ex: "Casa", "Parque", "Casa da Filha")',
                },
                latitude: {
                    type: 'number',
                    description: 'Latitude do centro da zona (ex: -23.550520)',
                },
                longitude: {
                    type: 'number',
                    description: 'Longitude do centro da zona (ex: -46.633308)',
                },
                radius: {
                    type: 'number',
                    description: 'Raio da zona em metros (mínimo 10, máximo 5000, padrão 20)',
                },
            },
            required: ['deviceId', 'name', 'latitude', 'longitude', 'radius'],
        },
    },
    {
        name: 'deleteGeofence',
        description: 'Remove uma zona segura (geofence) específica.',
        parameters: {
            type: 'object',
            properties: {
                deviceId: {
                    type: 'string',
                    description: 'ID do dispositivo (hardware_id)',
                },
                geofenceId: {
                    type: 'number',
                    description: 'ID numérico da geofence a ser removida (pode ser obtido listando as geofences)',
                },
                geofenceName: {
                    type: 'string',
                    description: 'Nome da geofence a ser removida (alternativa ao ID)',
                },
            },
            required: ['deviceId'],
        },
    },
    {
        name: 'getAlertHistory',
        description: 'Obtém o histórico de alertas de um dispositivo nos últimos dias.',
        parameters: {
            type: 'object',
            properties: {
                deviceId: {
                    type: 'string',
                    description: 'ID do dispositivo (hardware_id)',
                },
                days: {
                    type: 'number',
                    description: 'Número de dias para buscar (padrão: 7)',
                },
            },
            required: ['deviceId'],
        },
    },
    {
        name: 'getLocationHistory',
        description: 'Obtém o histórico de localizações de um dispositivo nas últimas horas.',
        parameters: {
            type: 'object',
            properties: {
                deviceId: {
                    type: 'string',
                    description: 'ID do dispositivo (hardware_id)',
                },
                hours: {
                    type: 'number',
                    description: 'Número de horas para buscar (padrão: 24)',
                },
            },
            required: ['deviceId'],
        },
    },
    {
        name: 'listDevices',
        description: 'Lista todos os dispositivos cadastrados do usuário.',
        parameters: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
    {
        name: 'geocodeAddress',
        description: 'Converte um endereço em coordenadas geográficas (latitude e longitude). Use quando o usuário mencionar um endereço mas não coordenadas. IMPORTANTE: Esta função é apenas para obter coordenadas - se o usuário pediu para criar uma zona segura, você DEVE chamar createGeofence logo após esta função.',
        parameters: {
            type: 'object',
            properties: {
                address: {
                    type: 'string',
                    description: 'Endereço completo (ex: "Rua das Flores 123, São Paulo, SP")',
                },
            },
            required: ['address'],
        },
    },
    {
        name: 'analyzeGeofenceSuggestions',
        description: 'Analisa o histórico de localização recente para sugerir melhorias nas zonas seguras (geofences). Use quando o usuário pedir para analisar, otimizar ou verificar se as zonas estão corretas.',
        parameters: {
            type: 'object',
            properties: {
                deviceId: {
                    type: 'string',
                    description: 'ID do dispositivo (hardware_id)',
                },
                days: {
                    type: 'number',
                    description: 'Número de dias de histórico para analisar (padrão: 7)',
                },
            },
            required: ['deviceId'],
        },
    },
    {
        name: 'registerDevice',
        description: 'Registra um novo dispositivo para o usuário. Use quando o usuário pedir para "cadastrar dispositivo", "adicionar rastreador" ou similar.',
        parameters: {
            type: 'object',
            properties: {
                hardwareId: {
                    type: 'string',
                    description: 'ID de hardware do dispositivo (geralmente impresso no aparelho)',
                },
                name: {
                    type: 'string',
                    description: 'Nome para identificar o dispositivo (ex: "Relógio do Vovô")',
                },
                patientName: {
                    type: 'string',
                    description: 'Nome do paciente que usará o dispositivo',
                },
            },
            required: ['hardwareId', 'name', 'patientName'],
        },
    },
    {
        name: 'deleteDevice',
        description: 'Remove um dispositivo do sistema. CUIDADO: Esta ação é irreversível e apagará todo o histórico e configurações.',
        parameters: {
            type: 'object',
            properties: {
                deviceId: {
                    type: 'string',
                    description: 'ID do dispositivo (hardware_id)',
                },
            },
            required: ['deviceId'],
        },
    },
    {
        name: 'updateAlertConfig',
        description: 'Atualiza as configurações de alerta de um dispositivo, incluindo emails e telefones. Use quando o usuário pedir para "cadastrar email", "adicionar telefone", "mudar frequência de alertas".',
        parameters: {
            type: 'object',
            properties: {
                deviceId: {
                    type: 'string',
                    description: 'ID do dispositivo (hardware_id)',
                },
                emails: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Lista de emails para receber alertas',
                },
                phones: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Lista de telefones (WhatsApp) para receber alertas (com DDD)',
                },
                frequencyMinutes: {
                    type: 'number',
                    description: 'Frequência mínima entre alertas em minutos',
                },
                enabled: {
                    type: 'boolean',
                    description: 'Se os alertas devem estar ativados ou não',
                },
            },
            required: ['deviceId'],
        },
    },
    {
        name: 'updatePatientInfo',
        description: 'Atualiza as informações do paciente associado a um dispositivo.',
        parameters: {
            type: 'object',
            properties: {
                deviceId: {
                    type: 'string',
                    description: 'ID do dispositivo (hardware_id)',
                },
                patientName: {
                    type: 'string',
                    description: 'Novo nome do paciente',
                },
                deviceName: {
                    type: 'string',
                    description: 'Novo nome do dispositivo',
                },
            },
            required: ['deviceId'],
        },
    },
];

/**
 * Converte funções para o formato esperado pelo Gemini
 */
export function getFunctionDeclarations() {
    return AVAILABLE_FUNCTIONS.map((func) => ({
        name: func.name,
        description: func.description,
        parameters: func.parameters,
    }));
}
