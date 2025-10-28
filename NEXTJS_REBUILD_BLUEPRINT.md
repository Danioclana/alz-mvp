# Blueprint Completo - Alzheimer Care em Next.js

## 🎯 Objetivo
blueprint
Criar o sistema de monitoramento completo usando **apenas Next.js**, sem backend separado.

---

## 📋 Stack Tecnológica

```
Frontend:     Next.js 15 (App Router) + React + TailwindCSS
Backend:      Next.js API Routes + Server Actions
Database:     Supabase (PostgreSQL)
Auth:         Clerk
Email:        Resend
AI:           Google Gemini API
Maps:         Leaflet
Deploy:       Vercel (frontend + API)
Monitoring:   Vercel Analytics
```

---

## 🗂️ Estrutura de Pastas Completa

```
alzheimer-care/
├── public/
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Rotas de autenticação
│   │   │   ├── sign-in/
│   │   │   │   └── [[...sign-in]]/
│   │   │   │       └── page.tsx
│   │   │   └── sign-up/
│   │   │       └── [[...sign-up]]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── (dashboard)/               # Rotas protegidas
│   │   │   ├── layout.tsx             # Layout com navbar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx           # Lista de dispositivos
│   │   │   ├── devices/
│   │   │   │   ├── page.tsx           # Lista detalhada
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx       # Registrar novo
│   │   │   │   └── [hardwareId]/
│   │   │   │       ├── page.tsx       # Detalhes do device
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx   # Editar device
│   │   │   ├── map/
│   │   │   │   └── page.tsx           # Mapa com localização
│   │   │   ├── geofences/
│   │   │   │   └── [hardwareId]/
│   │   │   │       └── page.tsx       # Gerenciar geofences
│   │   │   ├── alerts/
│   │   │   │   └── [hardwareId]/
│   │   │   │       └── page.tsx       # Config de alertas
│   │   │   └── history/
│   │   │       └── [hardwareId]/
│   │   │           └── page.tsx       # Histórico de localizações
│   │   │
│   │   ├── api/                       # Backend (API Routes)
│   │   │   ├── webhooks/
│   │   │   │   └── clerk/
│   │   │   │       └── route.ts       # Webhook Clerk (sync users)
│   │   │   │
│   │   │   ├── devices/
│   │   │   │   ├── route.ts           # GET (list), POST (create)
│   │   │   │   └── [hardwareId]/
│   │   │   │       └── route.ts       # GET, PUT, DELETE (by ID)
│   │   │   │
│   │   │   ├── locations/
│   │   │   │   ├── route.ts           # POST (ESP32 envia aqui)
│   │   │   │   └── [hardwareId]/
│   │   │   │       ├── latest/
│   │   │   │       │   └── route.ts   # GET última localização
│   │   │   │       └── history/
│   │   │   │           └── route.ts   # GET histórico
│   │   │   │
│   │   │   ├── geofences/
│   │   │   │   └── [hardwareId]/
│   │   │   │       ├── route.ts       # GET (list), POST (create)
│   │   │   │       └── [id]/
│   │   │   │           └── route.ts   # DELETE
│   │   │   │
│   │   │   ├── alerts/
│   │   │   │   └── [hardwareId]/
│   │   │   │       ├── config/
│   │   │   │       │   └── route.ts   # GET, PUT config
│   │   │   │       ├── status/
│   │   │   │       │   └── route.ts   # GET status atual
│   │   │   │       ├── pause/
│   │   │   │       │   └── route.ts   # POST pausar alertas
│   │   │   │       ├── accompanied-mode/
│   │   │   │       │   └── route.ts   # POST ativar modo
│   │   │   │       └── history/
│   │   │   │           └── route.ts   # GET histórico
│   │   │   │
│   │   │   └── chat/
│   │   │       └── route.ts           # POST chat com IA
│   │   │
│   │   ├── alerts/
│   │   │   └── pause/
│   │   │       └── page.tsx           # Página pública (link email)
│   │   │
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Landing page
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                        # Componentes UI base
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   └── toast.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── devices/
│   │   │   ├── DeviceCard.tsx
│   │   │   ├── DeviceForm.tsx
│   │   │   └── DeviceList.tsx
│   │   │
│   │   ├── map/
│   │   │   ├── Map.tsx                # Componente Leaflet
│   │   │   ├── GeofenceCircle.tsx
│   │   │   └── LocationMarker.tsx
│   │   │
│   │   ├── alerts/
│   │   │   ├── AlertConfigPanel.tsx
│   │   │   ├── AlertStatusBanner.tsx
│   │   │   ├── AlertHistoryList.tsx
│   │   │   ├── AccompaniedModeToggle.tsx
│   │   │   └── QuickAlertPause.tsx
│   │   │
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx
│   │   │   └── ChatMessage.tsx
│   │   │
│   │   └── providers/
│   │       ├── ClerkProvider.tsx
│   │       └── ToastProvider.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Cliente browser
│   │   │   ├── server.ts              # Cliente server
│   │   │   └── database.types.ts      # Types gerados
│   │   │
│   │   ├── db/
│   │   │   ├── devices.ts             # Queries de devices
│   │   │   ├── locations.ts           # Queries de localizações
│   │   │   ├── geofences.ts           # Queries de geofences
│   │   │   └── alerts.ts              # Queries de alertas
│   │   │
│   │   ├── services/
│   │   │   ├── email.ts               # Envio de emails (Resend)
│   │   │   ├── geofence-checker.ts    # Verifica se está fora
│   │   │   ├── alert-manager.ts       # Gerencia alertas
│   │   │   └── gemini.ts              # Chat IA
│   │   │
│   │   ├── validations/
│   │   │   ├── device.ts              # Schemas Zod
│   │   │   ├── location.ts
│   │   │   ├── geofence.ts
│   │   │   └── alert.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── distance.ts            # Calcula distância GPS
│   │   │   ├── format.ts              # Formatação de dados
│   │   │   └── token.ts               # Gera tokens JWT
│   │   │
│   │   └── constants.ts               # Constantes do app
│   │
│   ├── types/
│   │   ├── index.ts                   # Types principais
│   │   ├── api.ts                     # Types de API
│   │   └── database.ts                # Types do banco
│   │
│   └── middleware.ts                  # Clerk auth middleware
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql     # Schema inicial
│   └── seed.sql                       # Dados de teste
│
├── .env.local                         # Variáveis de ambiente
├── .env.example                       # Template de env
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🗄️ Schema do Banco de Dados (Supabase)

### SQL Completo

```sql
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
```

---

## 🔐 Variáveis de Ambiente

### `.env.local`

```env
# ==========================================
# CLERK (Autenticação)
# ==========================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# URLs do Clerk
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Webhook Secret (para sincronizar usuários)
CLERK_WEBHOOK_SECRET=whsec_...

# ==========================================
# SUPABASE (Database)
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...  # Chave pública (browser)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...      # Chave privada (server only)

# ==========================================
# RESEND (Email)
# ==========================================
RESEND_API_KEY=re_...
ALERTS_FROM_EMAIL=alerts@yourdomain.com
ALERTS_FROM_NAME=Alzheimer Care

# ==========================================
# GEMINI AI (Chat)
# ==========================================
GEMINI_API_KEY=AIzaSy...

# ==========================================
# APP CONFIG
# ==========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Produção: https://seu-app.vercel.app

# ==========================================
# SECURITY
# ==========================================
JWT_SECRET=seu_secret_muito_seguro_aqui_min_32_chars
```

---

## 📡 API Routes Completas

### 1. `/api/locations/route.ts` - Receber dados do ESP32

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LocationSchema } from '@/lib/validations/location';
import { checkGeofenceViolation } from '@/lib/services/geofence-checker';
import { sendGeofenceAlert } from '@/lib/services/alert-manager';

/**
 * POST /api/locations
 *
 * Recebe dados de localização do ESP32
 *
 * Headers:
 *   X-Device-ID: string (required)
 *
 * Body:
 *   {
 *     latitude: number,
 *     longitude: number,
 *     timestamp: number (Unix timestamp),
 *     batteryLevel?: number (0-100)
 *   }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validar Device ID
    const deviceId = request.headers.get('X-Device-ID');
    if (!deviceId) {
      return NextResponse.json(
        { error: 'X-Device-ID header is required' },
        { status: 400 }
      );
    }

    // 2. Parse e validar body
    const body = await request.json();
    const validation = LocationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { latitude, longitude, timestamp, batteryLevel } = validation.data;

    // 3. Conectar ao Supabase com SERVICE ROLE (bypass RLS)
    const supabase = createClient({ useServiceRole: true });

    // 4. Verificar se device existe
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id, user_id')
      .eq('hardware_id', deviceId)
      .single();

    if (deviceError || !device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    // 5. Inserir localização
    const { error: locationError } = await supabase
      .from('locations')
      .insert({
        device_id: device.id,
        latitude,
        longitude,
        timestamp: new Date(timestamp * 1000).toISOString(),
        battery_level: batteryLevel,
      });

    if (locationError) {
      console.error('Error inserting location:', locationError);
      return NextResponse.json(
        { error: 'Failed to save location' },
        { status: 500 }
      );
    }

    // 6. Atualizar device (bateria e timestamp)
    await supabase
      .from('devices')
      .update({
        battery_level: batteryLevel,
        last_location_at: new Date(timestamp * 1000).toISOString(),
      })
      .eq('id', device.id);

    // 7. Verificar geofences e processar alertas (async, não bloqueia resposta)
    checkGeofenceViolation(device.id, latitude, longitude)
      .then((isOutside) => {
        if (isOutside) {
          sendGeofenceAlert(device.id, latitude, longitude);
        }
      })
      .catch((error) => {
        console.error('Error checking geofence:', error);
      });

    // 8. Responder ao ESP32
    return NextResponse.json(
      { message: 'Location received' },
      { status: 202 } // 202 Accepted
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/locations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 2. `/api/devices/route.ts` - CRUD de dispositivos

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/server';
import { DeviceSchema } from '@/lib/validations/device';

/**
 * GET /api/devices
 * Lista todos os dispositivos do usuário autenticado
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Autenticação
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Buscar user_id do Supabase
    const supabase = createClient();
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Buscar devices (RLS automático)
    const { data: devices, error } = await supabase
      .from('devices')
      .select(`
        *,
        locations!locations_device_id_fkey(
          latitude,
          longitude,
          timestamp,
          battery_level
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching devices:', error);
      return NextResponse.json(
        { error: 'Failed to fetch devices' },
        { status: 500 }
      );
    }

    // 4. Formatar resposta (incluir lastLocation se existir)
    const formattedDevices = devices.map((device) => ({
      ...device,
      lastLocation: device.locations[0] || null,
      locations: undefined, // Remover do response
    }));

    return NextResponse.json(formattedDevices);
  } catch (error) {
    console.error('Unexpected error in GET /api/devices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/devices
 * Registra novo dispositivo
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Autenticação
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validar body
    const body = await request.json();
    const validation = DeviceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { hardwareId, name, patientName } = validation.data;

    // 3. Buscar user_id
    const supabase = createClient();
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 4. Verificar se hardwareId já existe
    const { data: existing } = await supabase
      .from('devices')
      .select('id')
      .eq('hardware_id', hardwareId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Device with this hardware ID already exists' },
        { status: 409 }
      );
    }

    // 5. Criar device
    const { data: device, error } = await supabase
      .from('devices')
      .insert({
        user_id: user.id,
        hardware_id: hardwareId,
        name,
        patient_name: patientName,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating device:', error);
      return NextResponse.json(
        { error: 'Failed to create device' },
        { status: 500 }
      );
    }

    return NextResponse.json(device, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/devices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3. `/api/geofences/[hardwareId]/route.ts` - CRUD de geofences

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/server';
import { GeofenceSchema } from '@/lib/validations/geofence';

/**
 * GET /api/geofences/[hardwareId]
 * Lista geofences do device
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { hardwareId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();

    // Buscar device (RLS garante ownership)
    const { data: device } = await supabase
      .from('devices')
      .select('id')
      .eq('hardware_id', params.hardwareId)
      .single();

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Buscar geofences
    const { data: geofences, error } = await supabase
      .from('geofences')
      .select('*')
      .eq('device_id', device.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch geofences' },
        { status: 500 }
      );
    }

    return NextResponse.json(geofences);
  } catch (error) {
    console.error('Error in GET /api/geofences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/geofences/[hardwareId]
 * Cria nova geofence
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { hardwareId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = GeofenceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Buscar device
    const { data: device } = await supabase
      .from('devices')
      .select('id')
      .eq('hardware_id', params.hardwareId)
      .single();

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Criar geofence
    const { data: geofence, error } = await supabase
      .from('geofences')
      .insert({
        device_id: device.id,
        ...validation.data,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create geofence' },
        { status: 500 }
      );
    }

    return NextResponse.json(geofence, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/geofences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 🔒 Segurança

### 1. Middleware de Autenticação (`middleware.ts`)

```typescript
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // Rotas públicas (não requerem login)
  publicRoutes: [
    '/',
    '/api/locations',              // ESP32 envia aqui
    '/api/webhooks/clerk',         // Webhook Clerk
    '/alerts/pause',               // Link no email
  ],

  // Rotas ignoradas (assets, etc)
  ignoredRoutes: [
    '/api/webhooks/clerk',
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### 2. Validação de Device (ESP32)

`src/lib/services/device-auth.ts`

```typescript
import { createClient } from '@/lib/supabase/server';

export async function validateDeviceId(
  hardwareId: string
): Promise<{ valid: boolean; deviceId?: number; userId?: number }> {
  const supabase = createClient({ useServiceRole: true });

  const { data: device, error } = await supabase
    .from('devices')
    .select('id, user_id')
    .eq('hardware_id', hardwareId)
    .single();

  if (error || !device) {
    return { valid: false };
  }

  return {
    valid: true,
    deviceId: device.id,
    userId: device.user_id,
  };
}
```

### 3. Validações com Zod

`src/lib/validations/location.ts`

```typescript
import { z } from 'zod';

export const LocationSchema = z.object({
  latitude: z
    .number()
    .min(-90, 'Latitude must be >= -90')
    .max(90, 'Latitude must be <= 90'),
  longitude: z
    .number()
    .min(-180, 'Longitude must be >= -180')
    .max(180, 'Longitude must be <= 180'),
  timestamp: z
    .number()
    .int()
    .positive('Timestamp must be positive'),
  batteryLevel: z
    .number()
    .min(0, 'Battery must be >= 0')
    .max(100, 'Battery must be <= 100')
    .optional(),
});

export type LocationInput = z.infer<typeof LocationSchema>;
```

`src/lib/validations/device.ts`

```typescript
import { z } from 'zod';

export const DeviceSchema = z.object({
  hardwareId: z
    .string()
    .min(1, 'Hardware ID is required')
    .max(100, 'Hardware ID too long'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name too long'),
  patientName: z
    .string()
    .min(1, 'Patient name is required')
    .max(255, 'Patient name too long'),
});

export type DeviceInput = z.infer<typeof DeviceSchema>;
```

`src/lib/validations/geofence.ts`

```typescript
import { z } from 'zod';

export const GeofenceSchema = z.object({
  name: z.string().min(1).max(255),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().positive().max(10000), // máximo 10km
});

export type GeofenceInput = z.infer<typeof GeofenceSchema>;
```

---

## 🔧 Configuração do Supabase

### 1. Cliente Browser (`src/lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 2. Cliente Server (`src/lib/supabase/server.ts`)

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient(options?: { useServiceRole?: boolean }) {
  const cookieStore = cookies();

  // Service role bypassa RLS (para ESP32, webhooks, etc)
  if (options?.useServiceRole) {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
  }

  // Cliente normal (respeita RLS com auth do usuário)
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

---

## 📦 Dependencies (`package.json`)

```json
{
  "name": "alzheimer-care",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@clerk/nextjs": "^5.0.0",
    "@google/generative-ai": "^0.1.3",
    "@supabase/ssr": "^0.1.0",
    "@supabase/supabase-js": "^2.39.0",
    "axios": "^1.6.5",
    "date-fns": "^3.0.6",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.309.0",
    "next": "15.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-leaflet": "^4.2.1",
    "resend": "^3.0.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.8",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "15.0.0",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

---

## 🌐 ESP32: Como Enviar Dados

### Código Arduino (ESP32)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <ArduinoJson.h>

// Configurações WiFi
const char* ssid = "SEU_WIFI";
const char* password = "SUA_SENHA";

// Configurações do servidor
const char* serverUrl = "https://seu-app.vercel.app/api/locations";
const char* deviceId = "ESP32-ABC123";  // ID único do dispositivo

// GPS
HardwareSerial gpsSerial(1);
TinyGPSPlus gps;

// Bateria
const int batteryPin = 34; // Pino ADC para leitura de bateria

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17); // RX=16, TX=17

  // Conectar WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Ler GPS
  while (gpsSerial.available() > 0) {
    if (gps.encode(gpsSerial.read())) {
      if (gps.location.isValid()) {
        sendLocation(
          gps.location.lat(),
          gps.location.lng(),
          readBatteryLevel()
        );
      }
    }
  }

  delay(10000); // Enviar a cada 10 segundos
}

void sendLocation(double lat, double lng, float battery) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Configurar request
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-ID", deviceId);

    // Criar JSON payload
    StaticJsonDocument<200> doc;
    doc["latitude"] = lat;
    doc["longitude"] = lng;
    doc["timestamp"] = millis() / 1000; // Unix timestamp
    doc["batteryLevel"] = battery;

    String payload;
    serializeJson(doc, payload);

    // Enviar POST
    int httpCode = http.POST(payload);

    // Verificar resposta
    if (httpCode > 0) {
      Serial.printf("HTTP Code: %d\n", httpCode);
      if (httpCode == 202) {
        Serial.println("Location sent successfully!");
      } else {
        String response = http.getString();
        Serial.println("Response: " + response);
      }
    } else {
      Serial.printf("HTTP Error: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
  } else {
    Serial.println("WiFi not connected!");
  }
}

float readBatteryLevel() {
  int rawValue = analogRead(batteryPin);
  // Converter para percentual (ajustar conforme seu circuito)
  // Exemplo: 4.2V = 100%, 3.0V = 0%
  float voltage = (rawValue / 4095.0) * 3.3 * 2; // *2 se usar divisor de tensão
  float percentage = ((voltage - 3.0) / (4.2 - 3.0)) * 100;
  return constrain(percentage, 0, 100);
}
```

---

## 🔄 Fluxo de Dados Completo

```
┌────────────┐
│   ESP32    │
│  (GPS +    │
│  Battery)  │
└─────┬──────┘
      │ POST /api/locations
      │ Headers: X-Device-ID
      │ Body: { lat, lng, timestamp, battery }
      ↓
┌─────────────────────────────────────┐
│  Next.js API Route                  │
│  /api/locations/route.ts            │
│                                     │
│  1. Validar Device ID               │
│  2. Validar dados (Zod)             │
│  3. Salvar location no Supabase     │
│  4. Atualizar device (battery)      │
│  5. Verificar geofences (async)     │
│  6. Enviar alertas se necessário    │
└─────────────────────────────────────┘
      ↓
┌──────────────────────┐
│  Supabase Database   │
│                      │
│  - devices           │
│  - locations         │
│  - geofences         │
│  - alert_status      │
└──────────────────────┘
      ↓ (Se fora da geofence)
┌──────────────────────┐
│  Resend Email        │
│  Envia alerta para   │
│  emails cadastrados  │
└──────────────────────┘
```

---

## 🚀 Deploy no Vercel

### 1. Preparar Projeto

```bash
# Criar .vercelignore
node_modules
.env.local
.next
```

### 2. Conectar ao Vercel

1. Push para GitHub
2. Acesse https://vercel.com
3. **Import Project**
4. Selecione o repositório
5. Configure environment variables
6. **Deploy!**

### 3. Configurar Environment Variables na Vercel

No painel da Vercel, adicione todas as variáveis do `.env.local`:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `GEMINI_API_KEY`
- Etc...

---

## ✅ Checklist de Implementação

### Fase 1: Setup Inicial (2-3h)
- [ ] Criar projeto Next.js (`npx create-next-app@latest`)
- [ ] Instalar dependências
- [ ] Configurar TailwindCSS
- [ ] Criar estrutura de pastas

### Fase 2: Banco de Dados (2h)
- [ ] Criar projeto Supabase
- [ ] Executar migration SQL
- [ ] Configurar RLS
- [ ] Testar conexão

### Fase 3: Autenticação (2h)
- [ ] Configurar Clerk
- [ ] Criar rotas de sign-in/sign-up
- [ ] Implementar middleware
- [ ] Criar webhook para sync users

### Fase 4: API Routes Core (4h)
- [ ] `/api/locations` (ESP32)
- [ ] `/api/devices` (CRUD)
- [ ] `/api/geofences` (CRUD)
- [ ] Validações Zod

### Fase 5: Frontend Core (6h)
- [ ] Dashboard page
- [ ] Device list/create
- [ ] Map component (Leaflet)
- [ ] Geofence manager

### Fase 6: Sistema de Alertas (6h)
- [ ] Alert config API
- [ ] Email service (Resend)
- [ ] Geofence checker
- [ ] Alert manager
- [ ] Frontend de alertas

### Fase 7: Features Avançadas (4h)
- [ ] Chat IA (Gemini)
- [ ] Histórico de localizações
- [ ] Modo acompanhado
- [ ] Pausa de alertas

### Fase 8: Testes e Deploy (3h)
- [ ] Testar com ESP32
- [ ] Testar fluxo completo
- [ ] Deploy na Vercel
- [ ] Configurar domínio

**Total: ~30 horas de desenvolvimento**

---

## 📚 Documentação de Referência

- **Next.js:** https://nextjs.org/docs
- **Supabase:** https://supabase.com/docs
- **Clerk:** https://clerk.com/docs
- **Resend:** https://resend.com/docs
- **Zod:** https://zod.dev
- **Leaflet:** https://react-leaflet.js.org

---

**Criado em:** 27/10/2025
**Versão:** 1.0
**Status:** ✅ Blueprint Completo - Pronto para Implementação
