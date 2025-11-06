# Fase 2: Implementação de Real-time Updates

## Contexto

O sistema já possui todas as interfaces funcionais (geofences, alertas, histórico) e as APIs estão completas. No entanto, o usuário precisa fazer refresh manual da página para ver atualizações. Esta fase implementa **atualizações em tempo real** para que o mapa e status dos dispositivos sejam atualizados automaticamente.

## Objetivo desta Fase

Implementar sistema de real-time updates usando **Supabase Realtime** para:
1. Atualizar localização no mapa automaticamente
2. Atualizar status de bateria
3. Mostrar indicador "online/offline" do dispositivo
4. Notificar quando novo alerta é disparado
5. Atualizar lista de dispositivos em tempo real

## Por que Supabase Realtime?

- ✅ Já estamos usando Supabase
- ✅ Sem custo adicional
- ✅ Baseado em PostgreSQL NOTIFY/LISTEN
- ✅ Client library pronta para React
- ✅ Fácil de implementar

## Arquitetura

```
┌─────────────────┐
│    ESP32        │
│   (GPS Device)  │
└────────┬────────┘
         │
         │ HTTP POST /api/locations
         ▼
┌─────────────────────────┐
│   Next.js API Route     │
│  /api/locations         │
└────────┬────────────────┘
         │
         │ INSERT location
         ▼
┌─────────────────────────┐
│   PostgreSQL            │
│   (Supabase)            │
│                         │
│   ┌──────────────────┐  │
│   │  Trigger:        │  │
│   │  AFTER INSERT    │──┼───┐
│   │  ON locations    │  │   │
│   └──────────────────┘  │   │
└─────────────────────────┘   │
                              │ PostgreSQL NOTIFY
                              ▼
                    ┌──────────────────────┐
                    │  Supabase Realtime   │
                    │  Channel Broadcast   │
                    └──────────┬───────────┘
                               │
                               │ WebSocket
                               ▼
                    ┌──────────────────────┐
                    │   React Client       │
                    │   useRealtimeLocation│
                    └──────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   MapView Update     │
                    │   (Marker moves)     │
                    └──────────────────────┘
```

## Arquivos Envolvidos

### Hooks a criar:
1. `src/hooks/useRealtimeLocation.ts` - Hook para escutar updates de localização
2. `src/hooks/useRealtimeDeviceStatus.ts` - Hook para status online/offline
3. `src/hooks/useRealtimeAlerts.ts` - Hook para novos alertas

### Componentes a atualizar:
1. `src/components/map/MapView.tsx` - Adicionar hook de realtime
2. `src/components/devices/DeviceCard.tsx` - Status online/offline
3. `src/app/(dashboard)/dashboard/page.tsx` - Lista de devices

### Migrations:
1. `supabase/migrations/002_realtime_setup.sql` - Configurar triggers e RLS

---

## Passo 1: Configurar Database

### Migration: Triggers para Realtime

```sql
-- supabase/migrations/002_realtime_setup.sql

-- =====================================================
-- REALTIME SETUP
-- =====================================================

-- Adicionar coluna last_seen aos devices (para status online/offline)
ALTER TABLE devices
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;

-- Função para atualizar last_seen automaticamente
CREATE OR REPLACE FUNCTION update_device_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE devices
  SET last_seen = NEW.timestamp
  WHERE hardware_id = NEW.hardware_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Atualizar last_seen quando nova localização chega
DROP TRIGGER IF EXISTS on_location_insert_update_last_seen ON locations;
CREATE TRIGGER on_location_insert_update_last_seen
AFTER INSERT ON locations
FOR EACH ROW
EXECUTE FUNCTION update_device_last_seen();

-- =====================================================
-- HABILITAR REALTIME NAS TABELAS
-- =====================================================

-- Habilitar Realtime para locations
ALTER PUBLICATION supabase_realtime ADD TABLE locations;

-- Habilitar Realtime para devices (para status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE devices;

-- Habilitar Realtime para alert_history (para notificações)
ALTER PUBLICATION supabase_realtime ADD TABLE alert_history;

-- =====================================================
-- RLS POLICIES PARA REALTIME
-- =====================================================

-- Usuários podem escutar updates dos seus próprios devices
CREATE POLICY "Users can subscribe to their own locations"
  ON locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.hardware_id = locations.hardware_id
      AND devices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can subscribe to their own devices"
  ON devices FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can subscribe to their own alerts"
  ON alert_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = alert_history.device_id
      AND devices.user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTION: CHECK IF DEVICE IS ONLINE
-- =====================================================

-- Um device é considerado online se enviou dados nos últimos 5 minutos
CREATE OR REPLACE FUNCTION is_device_online(device_last_seen TIMESTAMPTZ)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN device_last_seen > NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Como Executar Migration

1. Acesse Supabase Dashboard → SQL Editor
2. Cole e execute o SQL acima
3. Verifique se não há erros

---

## Passo 2: Criar Hooks de Realtime

### Hook 1: useRealtimeLocation

```typescript
// src/hooks/useRealtimeLocation.ts

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Location } from '@/types';

/**
 * Hook para escutar atualizações de localização em tempo real
 * @param hardwareId - ID do dispositivo para monitorar
 * @returns Última localização recebida
 */
export function useRealtimeLocation(hardwareId: string | null) {
  const [location, setLocation] = useState<Location | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!hardwareId) return;

    console.log('[Realtime] Subscribing to location updates for:', hardwareId);

    // Canal específico para este dispositivo
    const channel = supabase
      .channel(`location:${hardwareId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'locations',
          filter: `hardware_id=eq.${hardwareId}`,
        },
        (payload) => {
          console.log('[Realtime] New location received:', payload.new);
          setLocation(payload.new as Location);
        }
      )
      .on('system', {}, (payload) => {
        // Eventos de sistema (connect, disconnect)
        if (payload.type === 'connected') {
          console.log('[Realtime] Connected');
          setIsConnected(true);
        } else if (payload.type === 'disconnected') {
          console.log('[Realtime] Disconnected');
          setIsConnected(false);
        }
      })
      .subscribe();

    // Cleanup: remover subscrição quando componente desmontar
    return () => {
      console.log('[Realtime] Unsubscribing from:', hardwareId);
      supabase.removeChannel(channel);
    };
  }, [hardwareId]);

  return { location, isConnected };
}
```

### Hook 2: useRealtimeDeviceStatus

```typescript
// src/hooks/useRealtimeDeviceStatus.ts

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Device } from '@/types';

/**
 * Hook para monitorar status online/offline de múltiplos devices
 * @param hardwareIds - Lista de IDs de dispositivos
 * @returns Map de hardware_id -> status
 */
export function useRealtimeDeviceStatus(hardwareIds: string[]) {
  const [statusMap, setStatusMap] = useState<Map<string, boolean>>(new Map());
  const supabase = createClient();

  useEffect(() => {
    if (hardwareIds.length === 0) return;

    console.log('[Realtime] Subscribing to device status updates');

    const channel = supabase
      .channel('device-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'devices',
          filter: `hardware_id=in.(${hardwareIds.join(',')})`,
        },
        (payload) => {
          const device = payload.new as Device;
          const isOnline = isDeviceOnline(device.last_seen);

          setStatusMap(prev => {
            const next = new Map(prev);
            next.set(device.hardware_id, isOnline);
            return next;
          });
        }
      )
      .subscribe();

    // Fetch inicial
    fetchInitialStatus();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hardwareIds.join(',')]);

  const fetchInitialStatus = async () => {
    const { data } = await supabase
      .from('devices')
      .select('hardware_id, last_seen')
      .in('hardware_id', hardwareIds);

    if (data) {
      const map = new Map<string, boolean>();
      data.forEach(device => {
        map.set(device.hardware_id, isDeviceOnline(device.last_seen));
      });
      setStatusMap(map);
    }
  };

  const isDeviceOnline = (lastSeen: string | null): boolean => {
    if (!lastSeen) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(lastSeen) > fiveMinutesAgo;
  };

  return statusMap;
}
```

### Hook 3: useRealtimeAlerts

```typescript
// src/hooks/useRealtimeAlerts.ts

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Alert {
  id: string;
  device_id: string;
  alert_type: string;
  message: string;
  created_at: string;
}

/**
 * Hook para receber notificações de novos alertas em tempo real
 * @param userId - ID do usuário logado
 * @returns Lista de novos alertas
 */
export function useRealtimeAlerts(userId: string | null) {
  const [newAlerts, setNewAlerts] = useState<Alert[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    console.log('[Realtime] Subscribing to alert notifications');

    const channel = supabase
      .channel('alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alert_history',
        },
        async (payload) => {
          const alert = payload.new as Alert;

          // Verificar se o alerta pertence aos devices do usuário
          const { data: device } = await supabase
            .from('devices')
            .select('id')
            .eq('id', alert.device_id)
            .eq('user_id', userId)
            .single();

          if (device) {
            console.log('[Realtime] New alert:', alert);
            setNewAlerts(prev => [...prev, alert]);

            // Mostrar notificação no navegador
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Alerta Alzheimer Care', {
                body: alert.message,
                icon: '/icon-192x192.png',
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const clearAlerts = () => setNewAlerts([]);

  return { newAlerts, clearAlerts };
}
```

---

## Passo 3: Atualizar Componentes

### MapView com Realtime

```typescript
// src/components/map/MapView.tsx

'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { Device, Location } from '@/types';
import { useRealtimeLocation } from '@/hooks/useRealtimeLocation';
import { Badge } from '@/components/ui/badge';
import { Battery, Clock, Wifi } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MapViewProps {
  devices: Device[];
  initialLocations: Map<string, Location>;
}

export function MapView({ devices, initialLocations }: MapViewProps) {
  const [locations, setLocations] = useState(initialLocations);

  // Subscribe to realtime updates for all devices
  devices.forEach(device => {
    const { location, isConnected } = useRealtimeLocation(device.hardware_id);

    useEffect(() => {
      if (location) {
        setLocations(prev => {
          const next = new Map(prev);
          next.set(device.hardware_id, location);
          return next;
        });
      }
    }, [location]);
  });

  return (
    <div className="relative">
      {/* Indicador de conexão realtime */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">Ao vivo</span>
        </div>
      </div>

      <MapContainer
        center={[-23.550520, -46.633308]}
        zoom={13}
        className="h-[600px] w-full rounded-lg"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {devices.map(device => {
          const location = locations.get(device.hardware_id);
          if (!location) return null;

          const position: LatLngExpression = [location.latitude, location.longitude];

          return (
            <Marker
              key={device.hardware_id}
              position={position}
              icon={createCustomIcon(location.battery_level)}
            >
              <Popup>
                <div className="space-y-2">
                  <h3 className="font-bold">{device.name}</h3>

                  <div className="flex items-center gap-2">
                    <Battery className="h-4 w-4" />
                    <span>{location.battery_level}%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatDistanceToNow(new Date(location.timestamp), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>

                  <Badge variant="secondary">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </Badge>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

function createCustomIcon(batteryLevel: number) {
  const color = batteryLevel > 50 ? 'green' : batteryLevel > 20 ? 'orange' : 'red';

  return new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}
```

### DeviceCard com Status Online/Offline

```typescript
// src/components/devices/DeviceCard.tsx

'use client';

import { Device } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Battery, MapPin, Clock, Wifi, WifiOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

interface DeviceCardProps {
  device: Device;
  isOnline: boolean;
}

export function DeviceCard({ device, isOnline }: DeviceCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">{device.name}</h3>
            {isOnline ? (
              <Badge className="bg-green-500">
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="secondary">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>

          {device.last_location && (
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {device.last_location.latitude.toFixed(4)},
                  {device.last_location.longitude.toFixed(4)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4" />
                <span>{device.last_location.battery_level}%</span>
              </div>

              {device.last_seen && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatDistanceToNow(new Date(device.last_seen), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Link href={`/map?device=${device.hardware_id}`}>
            <Button size="sm">Ver no Mapa</Button>
          </Link>
          <Link href={`/geofences/${device.hardware_id}`}>
            <Button size="sm" variant="outline">Zonas Seguras</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
```

### Dashboard com Realtime Status

```typescript
// src/app/(dashboard)/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Device } from '@/types';
import { DeviceCard } from '@/components/devices/DeviceCard';
import { useRealtimeDeviceStatus } from '@/hooks/useRealtimeDeviceStatus';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useUser();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  // Realtime hooks
  const hardwareIds = devices.map(d => d.hardware_id);
  const statusMap = useRealtimeDeviceStatus(hardwareIds);
  const { newAlerts, clearAlerts } = useRealtimeAlerts(user?.id || null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      setDevices(data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Meus Dispositivos</h1>

        {newAlerts.length > 0 && (
          <Button onClick={clearAlerts} variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            {newAlerts.length} novos alertas
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map(device => (
          <DeviceCard
            key={device.id}
            device={device}
            isOnline={statusMap.get(device.hardware_id) || false}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## Passo 4: Configurar Supabase Realtime

### No Dashboard do Supabase:

1. Acesse **Database** → **Replication**
2. Habilite replicação para as tabelas:
   - `locations`
   - `devices`
   - `alert_history`

3. Verifique que RLS está ativado

---

## Passo 5: Testar

### Teste Manual

1. **Abra o dashboard em 2 abas do navegador**

2. **Simule envio de localização**:
```bash
curl -X POST http://localhost:3000/api/locations \
  -H "X-Device-ID: seu-hardware-id" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -23.550520,
    "longitude": -46.633308,
    "timestamp": "2025-10-29T12:00:00Z",
    "batteryLevel": 75
  }'
```

3. **Verifique**:
   - ✓ Ambas as abas atualizaram o mapa
   - ✓ Status online/offline mudou
   - ✓ Badge "Ao vivo" aparece
   - ✓ Console mostra logs de realtime

### Teste Automatizado (opcional)

```typescript
// tests/realtime.test.ts
describe('Realtime Updates', () => {
  it('should receive location update', async () => {
    // Test implementation
  });
});
```

---

## Checklist de Implementação

### Database
- [ ] Executar migration `002_realtime_setup.sql`
- [ ] Adicionar coluna `last_seen` em devices
- [ ] Criar triggers
- [ ] Habilitar realtime nas tabelas
- [ ] Verificar RLS policies

### Hooks
- [ ] Criar `useRealtimeLocation.ts`
- [ ] Criar `useRealtimeDeviceStatus.ts`
- [ ] Criar `useRealtimeAlerts.ts`
- [ ] Testar conexão/reconexão

### Componentes
- [ ] Atualizar MapView
- [ ] Atualizar DeviceCard
- [ ] Adicionar badge "Online/Offline"
- [ ] Adicionar indicador "Ao vivo"

### Dashboard
- [ ] Integrar hooks no dashboard
- [ ] Mostrar contagem de novos alertas
- [ ] Testar com múltiplos devices

### Supabase Config
- [ ] Habilitar replicação nas tabelas
- [ ] Verificar limites de conexões (Free tier: 200 concurrent)

### Testes
- [ ] Testar update em tempo real
- [ ] Testar reconexão após perda de rede
- [ ] Testar com múltiplos devices
- [ ] Testar notificações de alerta
- [ ] Verificar memory leaks (cleanup de subscriptions)

---

## Troubleshooting

### Problema: Realtime não conecta

**Solução**:
```typescript
// Verificar no console se há erros
// Checar se as políticas RLS permitem SELECT
// Verificar se realtime está habilitado nas tabelas
```

### Problema: Updates lentos

**Solução**:
- Verificar latência da rede
- Checar se há muitas subscriptions abertas
- Considerar debounce nos updates

### Problema: Subscriptions não fazem cleanup

**Solução**:
```typescript
// Sempre retornar cleanup no useEffect
return () => {
  supabase.removeChannel(channel);
};
```

---

## Otimizações

### 1. Debounce de Updates

```typescript
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const debouncedLocation = useDebouncedValue(location, 1000);
```

### 2. Reconnection Logic

```typescript
const channel = supabase
  .channel('location')
  .on('system', {}, (payload) => {
    if (payload.type === 'error') {
      console.error('Realtime error, reconnecting...');
      // Implement exponential backoff
    }
  });
```

### 3. Batch Updates

```typescript
// Se receber múltiplos updates, processar em batch
const [locationQueue, setLocationQueue] = useState<Location[]>([]);

useEffect(() => {
  const interval = setInterval(() => {
    if (locationQueue.length > 0) {
      processLocations(locationQueue);
      setLocationQueue([]);
    }
  }, 2000);

  return () => clearInterval(interval);
}, [locationQueue]);
```

---

## Critérios de Aceitação

- ✓ Mapa atualiza automaticamente quando ESP32 envia dados
- ✓ Badge "Online" aparece se device enviou dados nos últimos 5min
- ✓ Notificação aparece quando novo alerta é disparado
- ✓ Múltiplas abas recebem updates simultaneamente
- ✓ Reconexão automática após perda de rede
- ✓ Subscriptions são limpas corretamente (sem memory leak)
- ✓ Console não mostra erros de realtime

---

## Tempo Estimado

- **Database Setup**: 2 horas
- **Hooks**: 4 horas
- **Componentes**: 6 horas
- **Testes**: 4 horas

**Total: ~16 horas (2 dias)**

---

## Próxima Fase

Após completar o realtime, o sistema terá updates instantâneos. A próxima fase é desenvolver o **Firmware ESP32** para ter um dispositivo real funcionando.

Ver: `FASE_3_ESP32_FIRMWARE.md`
