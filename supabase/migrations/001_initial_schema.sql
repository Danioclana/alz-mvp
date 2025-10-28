-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);

-- =============================================
-- DEVICES TABLE
-- =============================================
CREATE TABLE devices (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hardware_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  battery_level DECIMAL(5,2),
  last_location_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_devices_user_id ON devices(user_id);
CREATE INDEX idx_devices_hardware_id ON devices(hardware_id);
CREATE INDEX idx_devices_created_at ON devices(created_at DESC);

-- =============================================
-- LOCATIONS TABLE
-- =============================================
CREATE TABLE locations (
  id BIGSERIAL PRIMARY KEY,
  device_id BIGINT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  battery_level DECIMAL(5,2),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_locations_device_id ON locations(device_id);
CREATE INDEX idx_locations_timestamp ON locations(timestamp DESC);
CREATE INDEX idx_locations_device_timestamp ON locations(device_id, timestamp DESC);

-- =============================================
-- GEOFENCES TABLE
-- =============================================
CREATE TABLE geofences (
  id BIGSERIAL PRIMARY KEY,
  device_id BIGINT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius DECIMAL(10, 2) NOT NULL, -- metros
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_geofences_device_id ON geofences(device_id);

-- =============================================
-- ALERT CONFIGS TABLE
-- =============================================
CREATE TABLE alert_configs (
  id BIGSERIAL PRIMARY KEY,
  device_id BIGINT UNIQUE NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  alerts_enabled BOOLEAN DEFAULT true,
  recipient_emails JSONB NOT NULL DEFAULT '[]'::jsonb, -- array de emails
  alert_frequency_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alert_configs_device_id ON alert_configs(device_id);

-- =============================================
-- ALERT STATUS TABLE
-- =============================================
CREATE TABLE alert_status (
  id BIGSERIAL PRIMARY KEY,
  device_id BIGINT UNIQUE NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  is_outside_geofence BOOLEAN DEFAULT false,
  last_alert_sent_at TIMESTAMP WITH TIME ZONE,
  alert_paused_until TIMESTAMP WITH TIME ZONE,
  accompanied_mode_enabled BOOLEAN DEFAULT false,
  accompanied_mode_until TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alert_status_device_id ON alert_status(device_id);

-- =============================================
-- ALERT HISTORY TABLE
-- =============================================
CREATE TABLE alert_history (
  id BIGSERIAL PRIMARY KEY,
  device_id BIGINT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'GEOFENCE_VIOLATION'
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  sent_to_emails JSONB NOT NULL, -- array de emails
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_alert_history_device_id ON alert_history(device_id);
CREATE INDEX idx_alert_history_sent_at ON alert_history(sent_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;

-- Users: só pode ver/editar próprio perfil
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');

-- Devices: só pode ver/editar próprios devices
CREATE POLICY "Users can view own devices" ON devices
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub')
  );

CREATE POLICY "Users can insert own devices" ON devices
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub')
  );

CREATE POLICY "Users can update own devices" ON devices
  FOR UPDATE USING (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub')
  );

CREATE POLICY "Users can delete own devices" ON devices
  FOR DELETE USING (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub')
  );

-- Locations: só pode ver localizações dos próprios devices
CREATE POLICY "Users can view own device locations" ON locations
  FOR SELECT USING (
    device_id IN (
      SELECT id FROM devices WHERE user_id = (
        SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
      )
    )
  );

-- ESP32 pode inserir (sem auth) - tratado em service role
CREATE POLICY "Service role can insert locations" ON locations
  FOR INSERT WITH CHECK (true);

-- Geofences: só pode ver/editar geofences dos próprios devices
CREATE POLICY "Users can view own device geofences" ON geofences
  FOR SELECT USING (
    device_id IN (
      SELECT id FROM devices WHERE user_id = (
        SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
      )
    )
  );

CREATE POLICY "Users can insert own device geofences" ON geofences
  FOR INSERT WITH CHECK (
    device_id IN (
      SELECT id FROM devices WHERE user_id = (
        SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
      )
    )
  );

CREATE POLICY "Users can delete own device geofences" ON geofences
  FOR DELETE USING (
    device_id IN (
      SELECT id FROM devices WHERE user_id = (
        SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
      )
    )
  );

-- Alert configs/status/history: mesma lógica
CREATE POLICY "Users can manage own device alerts" ON alert_configs
  FOR ALL USING (
    device_id IN (
      SELECT id FROM devices WHERE user_id = (
        SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
      )
    )
  );

CREATE POLICY "Users can manage own alert status" ON alert_status
  FOR ALL USING (
    device_id IN (
      SELECT id FROM devices WHERE user_id = (
        SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
      )
    )
  );

CREATE POLICY "Users can view own alert history" ON alert_history
  FOR SELECT USING (
    device_id IN (
      SELECT id FROM devices WHERE user_id = (
        SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
      )
    )
  );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geofences_updated_at BEFORE UPDATE ON geofences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_configs_updated_at BEFORE UPDATE ON alert_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_status_updated_at BEFORE UPDATE ON alert_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Criar alert_config e alert_status automaticamente ao criar device
CREATE OR REPLACE FUNCTION create_alert_records()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar alert_config padrão
  INSERT INTO alert_configs (device_id, recipient_emails)
  VALUES (NEW.id, '[]'::jsonb);

  -- Criar alert_status padrão
  INSERT INTO alert_status (device_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_alert_records_trigger AFTER INSERT ON devices
  FOR EACH ROW EXECUTE FUNCTION create_alert_records();
