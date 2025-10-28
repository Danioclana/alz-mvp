export const APP_NAME = 'Alzheimer Care';
export const APP_DESCRIPTION = 'Sistema de monitoramento e geolocalização para idosos com Alzheimer';

// Configurações de alertas
export const DEFAULT_ALERT_FREQUENCY_MINUTES = 5;
export const MIN_ALERT_FREQUENCY_MINUTES = 1;
export const MAX_ALERT_FREQUENCY_MINUTES = 60;

// Configurações de geofence
export const DEFAULT_GEOFENCE_RADIUS = 100; // metros
export const MIN_GEOFENCE_RADIUS = 10; // metros
export const MAX_GEOFENCE_RADIUS = 10000; // metros (10km)

// Configurações de bateria
export const LOW_BATTERY_THRESHOLD = 20; // %
export const CRITICAL_BATTERY_THRESHOLD = 10; // %

// Configurações de localização
export const LOCATION_STALE_THRESHOLD_MINUTES = 30; // considera "desatualizado" após 30 minutos
