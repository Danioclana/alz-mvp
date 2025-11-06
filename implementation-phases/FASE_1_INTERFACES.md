# Fase 1: Implementação de Interfaces de Gerenciamento

## Contexto

Você está trabalhando em um sistema de rastreamento para pacientes com Alzheimer. O backend e APIs já estão completos e funcionais. Sua tarefa é implementar as interfaces de usuário faltantes para tornar o sistema utilizável.

## Objetivo desta Fase

Implementar 3 interfaces críticas:
1. **Editor de Geofences** - Interface para criar e gerenciar zonas seguras
2. **Configuração de Alertas** - Formulário para configurar notificações
3. **Histórico de Localização** - Visualização de trajetos e timeline

## Status Atual

### O que já existe e funciona:
- ✅ API completa para geofences (`/api/geofences/[hardwareId]`)
- ✅ API completa para alertas (`/api/alerts/[hardwareId]`)
- ✅ API de locations com histórico
- ✅ Componente MapView (Leaflet) funcional
- ✅ Autenticação com Clerk
- ✅ Database schema completo
- ✅ Páginas skeleton criadas

### O que falta:
- ❌ Interface interativa para criar geofences
- ❌ Formulário de configuração de alertas
- ❌ Visualização de histórico em timeline e mapa

## Arquivos Envolvidos

### Páginas que precisam ser implementadas:
1. `src/app/(dashboard)/geofences/[hardwareId]/page.tsx` - Editor de geofences
2. `src/app/(dashboard)/alerts/[hardwareId]/page.tsx` - Config de alertas
3. `src/app/(dashboard)/history/[hardwareId]/page.tsx` - Histórico

### Componentes a criar:
1. `src/components/geofences/GeofenceEditor.tsx`
2. `src/components/geofences/GeofenceList.tsx`
3. `src/components/alerts/AlertConfigForm.tsx`
4. `src/components/history/LocationTimeline.tsx`
5. `src/components/history/LocationMap.tsx`
6. `src/components/history/HistoryFilters.tsx`

### APIs já disponíveis:

#### Geofences API
```typescript
// GET /api/geofences/[hardwareId]
// Returns: Array<Geofence>

// POST /api/geofences/[hardwareId]
// Body: { name: string, latitude: number, longitude: number, radius: number }
// Returns: Geofence

// DELETE /api/geofences/[hardwareId]
// Query: ?geofenceId=uuid
// Returns: { success: boolean }
```

#### Alerts API
```typescript
// GET /api/alerts/[hardwareId]/config
// Returns: AlertConfig

// PUT /api/alerts/[hardwareId]/config
// Body: AlertConfig
// Returns: AlertConfig

interface AlertConfig {
  enabled: boolean;
  alert_emails: string[];
  min_frequency_minutes: number;
  is_accompanied: boolean;
  low_battery_threshold: number;
}
```

#### Locations API
```typescript
// Fetch via Supabase client
const { data: locations } = await supabase
  .from('locations')
  .select('*')
  .eq('hardware_id', hardwareId)
  .order('timestamp', { ascending: false })
  .limit(100);
```

### Tipos TypeScript já definidos:
```typescript
// src/types/index.ts

export interface Geofence {
  id: string;
  hardware_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  is_active: boolean;
  created_at: string;
}

export interface AlertConfig {
  enabled: boolean;
  alert_emails: string[];
  min_frequency_minutes: number;
  is_accompanied: boolean;
  low_battery_threshold: number;
}

export interface Location {
  id: string;
  hardware_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  battery_level: number;
}
```

---

## Tarefa 1: Editor de Geofences

### Requisitos Funcionais

1. **Visualização de Geofences Existentes**
   - Listar todas as geofences do dispositivo
   - Mostrar nome, raio e status (ativa/inativa)
   - Opção de editar e excluir

2. **Criação de Nova Geofence**
   - Clicar no botão "Adicionar Zona Segura"
   - Clicar no mapa para definir o centro
   - Ajustar raio com slider (50m - 1000m)
   - Nomear a zona
   - Preview visual no mapa (círculo)
   - Salvar

3. **Edição de Geofence**
   - Clicar em geofence da lista
   - Editar nome e raio
   - Atualizar posição no mapa
   - Salvar alterações

4. **Exclusão**
   - Botão delete com confirmação
   - Remover do mapa e lista

### Design Sugerido

```
┌─────────────────────────────────────────────────────────┐
│ Navbar                                                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ← Voltar  |  Zonas Seguras - [Device Name]             │
│                                                           │
│  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │                     │  │                         │  │
│  │  Lista de Zonas     │  │                         │  │
│  │                     │  │                         │  │
│  │  [+ Adicionar]      │  │      MAPA LEAFLET       │  │
│  │                     │  │                         │  │
│  │  □ Casa (200m)      │  │    (círculos das       │  │
│  │    [✏️] [🗑️]        │  │     geofences)         │  │
│  │                     │  │                         │  │
│  │  □ Parque (500m)    │  │                         │  │
│  │    [✏️] [🗑️]        │  │                         │  │
│  │                     │  │                         │  │
│  └─────────────────────┘  └─────────────────────────┘  │
│                                                           │
│  Modal de Criação:                                       │
│  ┌──────────────────────────────────────────────┐       │
│  │ Nova Zona Segura                         [X] │       │
│  │                                               │       │
│  │ Nome: [________________]                     │       │
│  │                                               │       │
│  │ Raio: [====●======] 200m                     │       │
│  │                                               │       │
│  │ 1. Clique no mapa para definir o centro      │       │
│  │ 2. Ajuste o raio                              │       │
│  │ 3. Clique em Salvar                           │       │
│  │                                               │       │
│  │           [Cancelar]  [Salvar]                │       │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

### Componente: GeofenceEditor.tsx

```typescript
'use client';

import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { Geofence } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface GeofenceEditorProps {
  hardwareId: string;
  existingGeofences: Geofence[];
  onSave: (geofence: Omit<Geofence, 'id' | 'created_at'>) => Promise<void>;
}

export function GeofenceEditor({ hardwareId, existingGeofences, onSave }: GeofenceEditorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newGeofence, setNewGeofence] = useState<{
    name: string;
    latitude?: number;
    longitude?: number;
    radius: number;
  }>({
    name: '',
    radius: 200,
  });

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (isCreating) {
          setNewGeofence(prev => ({
            ...prev,
            latitude: e.latlng.lat,
            longitude: e.latlng.lng,
          }));
        }
      },
    });
    return null;
  };

  const handleSave = async () => {
    if (!newGeofence.latitude || !newGeofence.longitude || !newGeofence.name) {
      alert('Preencha todos os campos e clique no mapa');
      return;
    }

    await onSave({
      hardware_id: hardwareId,
      name: newGeofence.name,
      latitude: newGeofence.latitude,
      longitude: newGeofence.longitude,
      radius: newGeofence.radius,
      is_active: true,
    });

    // Reset form
    setNewGeofence({ name: '', radius: 200 });
    setIsCreating(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lista lateral */}
      <div className="space-y-4">
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="w-full"
        >
          {isCreating ? 'Cancelar' : '+ Adicionar Zona Segura'}
        </Button>

        {isCreating && (
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">Nova Zona</h3>

            <div>
              <label className="text-sm">Nome</label>
              <Input
                value={newGeofence.name}
                onChange={(e) => setNewGeofence(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Casa, Parque..."
              />
            </div>

            <div>
              <label className="text-sm">Raio: {newGeofence.radius}m</label>
              <Slider
                value={[newGeofence.radius]}
                onValueChange={([value]) => setNewGeofence(prev => ({ ...prev, radius: value }))}
                min={50}
                max={1000}
                step={50}
              />
            </div>

            <p className="text-sm text-gray-600">
              {newGeofence.latitude
                ? '✓ Centro definido. Ajuste o raio e clique em Salvar.'
                : '1. Clique no mapa para definir o centro'
              }
            </p>

            <Button
              onClick={handleSave}
              disabled={!newGeofence.latitude || !newGeofence.name}
              className="w-full"
            >
              Salvar Zona
            </Button>
          </div>
        )}

        {/* Lista de geofences existentes */}
        <GeofenceList geofences={existingGeofences} />
      </div>

      {/* Mapa */}
      <div className="lg:col-span-2 h-[600px] rounded-lg overflow-hidden">
        <MapContainer
          center={[-23.550520, -46.633308]}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler />

          {/* Geofences existentes */}
          {existingGeofences.map((geofence) => (
            <Circle
              key={geofence.id}
              center={[geofence.latitude, geofence.longitude]}
              radius={geofence.radius}
              pathOptions={{
                color: geofence.is_active ? 'green' : 'gray',
                fillColor: geofence.is_active ? 'green' : 'gray',
                fillOpacity: 0.2,
              }}
            />
          ))}

          {/* Preview da nova geofence */}
          {isCreating && newGeofence.latitude && newGeofence.longitude && (
            <Circle
              center={[newGeofence.latitude, newGeofence.longitude]}
              radius={newGeofence.radius}
              pathOptions={{
                color: 'blue',
                fillColor: 'blue',
                fillOpacity: 0.3,
                dashArray: '5, 5',
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
```

### Componente: GeofenceList.tsx

```typescript
'use client';

import { Geofence } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface GeofenceListProps {
  geofences: Geofence[];
  onEdit?: (geofence: Geofence) => void;
  onDelete?: (id: string) => void;
}

export function GeofenceList({ geofences, onEdit, onDelete }: GeofenceListProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Zonas Cadastradas</h3>

      {geofences.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma zona cadastrada</p>
      ) : (
        geofences.map((geofence) => (
          <div
            key={geofence.id}
            className="border rounded-lg p-3 flex items-center justify-between"
          >
            <div>
              <h4 className="font-medium">{geofence.name}</h4>
              <p className="text-sm text-gray-600">Raio: {geofence.radius}m</p>
              <Badge variant={geofence.is_active ? 'default' : 'secondary'}>
                {geofence.is_active ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>

            <div className="flex gap-2">
              {onEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(geofence)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`Excluir zona "${geofence.name}"?`)) {
                      onDelete(geofence.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
```

### Página: geofences/[hardwareId]/page.tsx

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Geofence, Device } from '@/types';
import { GeofenceEditor } from '@/components/geofences/GeofenceEditor';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GeofencesPage() {
  const params = useParams();
  const router = useRouter();
  const hardwareId = params.hardwareId as string;

  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [hardwareId]);

  const fetchData = async () => {
    try {
      // Fetch device info
      const deviceRes = await fetch('/api/devices');
      const devices = await deviceRes.json();
      const currentDevice = devices.find((d: Device) => d.hardware_id === hardwareId);
      setDevice(currentDevice);

      // Fetch geofences
      const geofencesRes = await fetch(`/api/geofences/${hardwareId}`);
      const data = await geofencesRes.json();
      setGeofences(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeofence = async (geofence: Omit<Geofence, 'id' | 'created_at'>) => {
    try {
      const res = await fetch(`/api/geofences/${hardwareId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geofence),
      });

      if (!res.ok) throw new Error('Failed to save geofence');

      // Refresh list
      await fetchData();
    } catch (error) {
      console.error('Error saving geofence:', error);
      alert('Erro ao salvar zona segura');
    }
  };

  const handleDeleteGeofence = async (geofenceId: string) => {
    try {
      const res = await fetch(`/api/geofences/${hardwareId}?geofenceId=${geofenceId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete geofence');

      // Refresh list
      await fetchData();
    } catch (error) {
      console.error('Error deleting geofence:', error);
      alert('Erro ao excluir zona segura');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">
          Zonas Seguras - {device?.name || hardwareId}
        </h1>
      </div>

      <GeofenceEditor
        hardwareId={hardwareId}
        existingGeofences={geofences}
        onSave={handleSaveGeofence}
      />
    </div>
  );
}
```

---

## Tarefa 2: Configuração de Alertas

### Requisitos Funcionais

1. Formulário com campos:
   - Toggle: Alertas ativados
   - Input: Emails de notificação (múltiplos)
   - Slider: Frequência mínima entre alertas (15-120 min)
   - Toggle: Modo acompanhado (desativa alertas temporariamente)
   - Input: Threshold de bateria baixa (10-30%)

2. Botão "Enviar Teste de Alerta"

3. Salvar configurações

### Componente: AlertConfigForm.tsx

```typescript
'use client';

import { useState, useEffect } from 'react';
import { AlertConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Send } from 'lucide-react';

interface AlertConfigFormProps {
  hardwareId: string;
  initialConfig?: AlertConfig;
  onSave: (config: AlertConfig) => Promise<void>;
}

export function AlertConfigForm({ hardwareId, initialConfig, onSave }: AlertConfigFormProps) {
  const [config, setConfig] = useState<AlertConfig>({
    enabled: true,
    alert_emails: [],
    min_frequency_minutes: 30,
    is_accompanied: false,
    low_battery_threshold: 20,
    ...initialConfig,
  });

  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const addEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Email inválido');
      return;
    }

    if (config.alert_emails.includes(email)) {
      alert('Email já adicionado');
      return;
    }

    setConfig(prev => ({
      ...prev,
      alert_emails: [...prev.alert_emails, email],
    }));
    setNewEmail('');
  };

  const removeEmail = (email: string) => {
    setConfig(prev => ({
      ...prev,
      alert_emails: prev.alert_emails.filter(e => e !== email),
    }));
  };

  const handleSave = async () => {
    if (config.alert_emails.length === 0) {
      alert('Adicione pelo menos um email');
      return;
    }

    setSaving(true);
    try {
      await onSave(config);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    setSendingTest(true);
    try {
      // Implementar endpoint de teste
      const res = await fetch(`/api/alerts/${hardwareId}/test`, {
        method: 'POST',
      });

      if (res.ok) {
        alert('Email de teste enviado!');
      } else {
        throw new Error('Failed to send test');
      }
    } catch (error) {
      alert('Erro ao enviar teste');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 border rounded-lg p-6">
      <h2 className="text-2xl font-bold">Configuração de Alertas</h2>

      {/* Ativar/Desativar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Alertas Ativados</h3>
          <p className="text-sm text-gray-600">
            Receber notificações quando o dispositivo sair das zonas seguras
          </p>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
        />
      </div>

      <hr />

      {/* Emails */}
      <div>
        <h3 className="font-semibold mb-2">Emails de Notificação</h3>
        <div className="flex gap-2 mb-2">
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addEmail()}
          />
          <Button onClick={addEmail}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {config.alert_emails.map((email) => (
            <Badge key={email} variant="secondary" className="gap-2">
              {email}
              <button onClick={() => removeEmail(email)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <hr />

      {/* Frequência */}
      <div>
        <h3 className="font-semibold mb-2">
          Frequência Mínima: {config.min_frequency_minutes} minutos
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          Tempo mínimo entre alertas consecutivos (evita spam)
        </p>
        <Slider
          value={[config.min_frequency_minutes]}
          onValueChange={([value]) => setConfig(prev => ({ ...prev, min_frequency_minutes: value }))}
          min={15}
          max={120}
          step={15}
        />
      </div>

      <hr />

      {/* Modo Acompanhado */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Modo Acompanhado</h3>
          <p className="text-sm text-gray-600">
            Desativa alertas temporariamente quando está com o paciente
          </p>
        </div>
        <Switch
          checked={config.is_accompanied}
          onCheckedChange={(checked) => setConfig(prev => ({ ...prev, is_accompanied: checked }))}
        />
      </div>

      <hr />

      {/* Bateria */}
      <div>
        <h3 className="font-semibold mb-2">
          Alerta de Bateria Baixa: {config.low_battery_threshold}%
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          Receber notificação quando a bateria atingir este nível
        </p>
        <Slider
          value={[config.low_battery_threshold]}
          onValueChange={([value]) => setConfig(prev => ({ ...prev, low_battery_threshold: value }))}
          min={10}
          max={30}
          step={5}
        />
      </div>

      <hr />

      {/* Ações */}
      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={saving || config.alert_emails.length === 0}
          className="flex-1"
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>

        <Button
          variant="outline"
          onClick={handleSendTest}
          disabled={sendingTest || config.alert_emails.length === 0}
        >
          <Send className="h-4 w-4 mr-2" />
          {sendingTest ? 'Enviando...' : 'Testar Alerta'}
        </Button>
      </div>
    </div>
  );
}
```

### Página: alerts/[hardwareId]/page.tsx

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertConfig, Device } from '@/types';
import { AlertConfigForm } from '@/components/alerts/AlertConfigForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AlertsPage() {
  const params = useParams();
  const router = useRouter();
  const hardwareId = params.hardwareId as string;

  const [config, setConfig] = useState<AlertConfig | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [hardwareId]);

  const fetchData = async () => {
    try {
      // Fetch device
      const deviceRes = await fetch('/api/devices');
      const devices = await deviceRes.json();
      const currentDevice = devices.find((d: Device) => d.hardware_id === hardwareId);
      setDevice(currentDevice);

      // Fetch config
      const configRes = await fetch(`/api/alerts/${hardwareId}/config`);
      const data = await configRes.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newConfig: AlertConfig) => {
    const res = await fetch(`/api/alerts/${hardwareId}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig),
    });

    if (!res.ok) throw new Error('Failed to save config');

    setConfig(newConfig);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">
          Alertas - {device?.name || hardwareId}
        </h1>
      </div>

      {config && (
        <AlertConfigForm
          hardwareId={hardwareId}
          initialConfig={config}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
```

---

## Tarefa 3: Histórico de Localização

### Requisitos

1. Timeline de localizações
2. Mapa com trajeto (polyline)
3. Filtros por data
4. Estatísticas básicas
5. Exportação CSV

### Componentes necessários:

```typescript
// src/components/history/LocationTimeline.tsx
// src/components/history/LocationMap.tsx
// src/components/history/HistoryFilters.tsx
// src/components/history/HistoryStats.tsx
```

(Código completo similar aos anteriores - implementar seguindo o mesmo padrão)

---

## Checklist de Implementação

### Preparação
- [ ] Instalar dependências faltantes
  ```bash
  npm install react-leaflet-draw date-fns
  ```
- [ ] Criar componente Slider se não existir (shadcn/ui)
- [ ] Criar componente Switch se não existir (shadcn/ui)

### Geofences
- [ ] Criar `GeofenceEditor.tsx`
- [ ] Criar `GeofenceList.tsx`
- [ ] Implementar página `geofences/[hardwareId]/page.tsx`
- [ ] Testar criação de geofence
- [ ] Testar edição de geofence
- [ ] Testar exclusão de geofence
- [ ] Validar preview no mapa

### Alertas
- [ ] Criar `AlertConfigForm.tsx`
- [ ] Implementar página `alerts/[hardwareId]/page.tsx`
- [ ] Criar endpoint de teste `/api/alerts/[hardwareId]/test`
- [ ] Testar salvamento de config
- [ ] Testar envio de email de teste
- [ ] Validar emails múltiplos

### Histórico
- [ ] Criar `LocationTimeline.tsx`
- [ ] Criar `LocationMap.tsx` com polyline
- [ ] Criar `HistoryFilters.tsx`
- [ ] Criar `HistoryStats.tsx`
- [ ] Implementar exportação CSV
- [ ] Implementar página `history/[hardwareId]/page.tsx`
- [ ] Testar filtros de data
- [ ] Validar cálculos de estatísticas

---

## Critérios de Aceitação

### Geofences
- ✓ Usuário consegue criar zona clicando no mapa
- ✓ Círculo aparece visualmente no mapa
- ✓ Lista mostra todas as zonas cadastradas
- ✓ Exclusão funciona com confirmação
- ✓ API retorna sucesso após salvar

### Alertas
- ✓ Formulário salva corretamente
- ✓ Emails são validados
- ✓ Botão de teste envia email
- ✓ Toggles funcionam corretamente
- ✓ Valores são persistidos após refresh

### Histórico
- ✓ Timeline mostra últimas 100 localizações
- ✓ Mapa desenha trajeto com polyline
- ✓ Filtro de data funciona
- ✓ Exportação CSV gera arquivo válido
- ✓ Estatísticas são calculadas corretamente

---

## Tempo Estimado

- **Geofences**: 8 horas
- **Alertas**: 6 horas
- **Histórico**: 10 horas
- **Testes & Ajustes**: 4 horas

**Total: ~28 horas (3-4 dias)**

---

## Próxima Fase

Após completar esta fase, o sistema terá todas as interfaces essenciais funcionando. A próxima fase será adicionar **Real-time Updates** para que o mapa atualize automaticamente.

Ver: `FASE_2_REALTIME.md`
