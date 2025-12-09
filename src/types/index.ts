export interface Device {
  id: number;
  user_id: number;
  hardware_id: string;
  name: string;
  patient_name: string;
  battery_level: number | null;
  last_location_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: number;
  device_id: number;
  latitude: number;
  longitude: number;
  battery_level: number | null;
  timestamp: string;
  created_at: string;
}

export interface Geofence {
  id: number;
  device_id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  created_at: string;
  updated_at: string;
}

export interface AlertConfig {
  id: number;
  device_id: number;
  alerts_enabled: boolean;
  recipient_emails: string[];
  recipient_phones: string[];
  alert_frequency_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface AlertStatus {
  id: number;
  device_id: number;
  is_outside_geofence: boolean;
  last_alert_sent_at: string | null;
  alert_paused_until: string | null;
  accompanied_mode_enabled: boolean;
  accompanied_mode_until: string | null;
  updated_at: string;
}

export interface AlertHistory {
  id: number;
  device_id: number;
  alert_type: string;
  latitude: number;
  longitude: number;
  sent_to_emails: string[];
  sent_to_phones: string[];
  sent_at: string;
  acknowledged: boolean;
  acknowledged_at: string | null;
}

export interface User {
  id: number;
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}
