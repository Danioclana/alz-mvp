# Plano de Implementação - Sistema Alzheimer Care

## Status Atual do Projeto

**Progresso Geral: ~60% Concluído**

### ✅ O que está funcionando:
- Infraestrutura completa (Next.js, Supabase, Clerk)
- Sistema de autenticação robusto
- Recepção de dados GPS do ESP32
- Detecção de geofences e alertas por email
- Visualização em mapa interativo
- Chat com IA (Gemini)
- API RESTful completa

### ⚠️ O que precisa ser melhorado:
- Interfaces de usuário incompletas (skeletons)
- Falta de atualizações em tempo real
- Ausência de notificações push
- Firmware ESP32 não implementado
- Sem análise preditiva com IA

---

## Análise de Gaps (O que está faltando)

### 🔴 Crítico (Necessário para MVP funcional)

#### 1. Interface de Gerenciamento de Geofences
**Status**: Página existe mas sem funcionalidade
**Localização**: `src/app/(dashboard)/geofences/[hardwareId]/page.tsx`

**O que falta:**
- Editor de mapa interativo para desenhar geofences
- Formulário para nomear e configurar raio
- Lista de geofences existentes com opção de editar/excluir
- Preview visual das zonas no mapa

**Complexidade**: Média
**Tempo Estimado**: 6-8 horas

---

#### 2. Interface de Configuração de Alertas
**Status**: Página existe mas sem funcionalidade
**Localização**: `src/app/(dashboard)/alerts/[hardwareId]/page.tsx`

**O que falta:**
- Formulário de configuração de alertas
- Toggle para ativar/desativar alertas
- Campo para emails de notificação (múltiplos)
- Configuração de frequência de alertas
- Toggle para modo acompanhado
- Botão de teste de alerta

**Complexidade**: Baixa
**Tempo Estimado**: 4-6 horas

---

#### 3. Visualização de Histórico de Localização
**Status**: Página existe mas sem funcionalidade
**Localização**: `src/app/(dashboard)/history/[hardwareId]/page.tsx`

**O que falta:**
- Timeline de localizações
- Filtro por data/hora
- Mapa com trajeto (polyline)
- Exportação de dados (CSV)
- Estatísticas (distância percorrida, tempo em cada zona)

**Complexidade**: Média-Alta
**Tempo Estimado**: 8-10 horas

---

#### 4. Atualizações em Tempo Real
**Status**: Não implementado
**Impacto**: Alto - Mapa e status não atualizam sem refresh

**O que falta:**
- WebSocket ou Server-Sent Events (SSE)
- Hook React para subscrição de updates
- Auto-refresh de localização no mapa
- Notificações em tempo real de alertas
- Status de conexão do dispositivo (online/offline)

**Opções:**
1. **Pusher** (recomendado para MVP)
   - Serviço gerenciado
   - Fácil integração
   - Free tier generoso

2. **Supabase Realtime**
   - Já usando Supabase
   - Baseado em PostgreSQL triggers
   - Sem custo adicional

3. **WebSocket customizado**
   - Maior controle
   - Mais complexo de implementar
   - Requer servidor dedicado

**Complexidade**: Média-Alta
**Tempo Estimado**: 12-16 horas

---

#### 5. Firmware ESP32 Completo
**Status**: Documentação existe, código não
**Impacto**: Crítico - Sem hardware não há sistema

**O que falta:**
- Código Arduino/PlatformIO completo
- Integração GPS NEO-6M
- Integração SIM7600G-H
- Gerenciamento de energia (sleep modes)
- Envio de dados via HTTP
- Retry logic para falhas de conexão
- LED de status
- Configuração via Serial/Bluetooth

**Componentes a implementar:**
```cpp
// GPS Reading (TinyGPS++)
// SIM7600G-H HTTP Client
// Battery Monitoring (ADC)
// Power Management (Deep Sleep)
// WiFi/4G Connection Manager
// Data Buffering (offline mode)
// OTA Update Support
```

**Complexidade**: Alta
**Tempo Estimado**: 20-30 horas

---

### 🟡 Importante (Necessário para sistema completo)

#### 6. Notificações Push (PWA)
**Status**: Não implementado
**Impacto**: Médio - Alertas só por email atualmente

**O que falta:**
- Service Worker
- Push API integration
- Permissão de notificações
- FCM (Firebase Cloud Messaging)
- Notificações em background

**Complexidade**: Média
**Tempo Estimado**: 10-12 horas

---

#### 7. Dashboard com Analytics
**Status**: Não implementado
**Impacto**: Médio - Falta visualização de dados

**O que falta:**
- Gráficos de movimento ao longo do tempo
- Heatmap de localizações frequentes
- Estatísticas de alertas
- Análise de bateria
- Relatórios semanais/mensais
- Exportação de relatórios (PDF)

**Bibliotecas sugeridas:**
- Recharts ou Chart.js
- React-PDF para geração de relatórios

**Complexidade**: Média
**Tempo Estimado**: 12-16 horas

---

#### 8. Compartilhamento de Dispositivos
**Status**: Não implementado
**Impacto**: Médio - Só um usuário por dispositivo

**O que falta:**
- Tabela `device_shares` no banco
- Sistema de convites por email
- Roles (owner, viewer, admin)
- Gerenciamento de permissões
- UI para convidar/remover usuários

**Complexidade**: Média-Alta
**Tempo Estimado**: 10-14 horas

---

### 🟢 Desejável (Features avançadas)

#### 9. IA Preditiva para Zonas Seguras
**Status**: Não implementado
**Impacto**: Baixo (diferencial, mas não essencial)

**O que falta:**
- Coleta de dados históricos (3-4 semanas)
- Modelo de clustering (K-means, DBSCAN)
- Análise de padrões temporais
- Sugestão automática de geofences
- API para treinamento e predição

**Abordagem sugerida:**
```python
# Pipeline ML
1. Coleta de dados: locations table
2. Feature engineering:
   - Hora do dia
   - Dia da semana
   - Duração em cada local
3. Clustering: DBSCAN (density-based)
4. Validação: Silhouette score
5. Deploy: Python API (FastAPI)
6. Integração: Next.js chama API externa
```

**Complexidade**: Muito Alta
**Tempo Estimado**: 30-40 horas

---

#### 10. Detecção de Quedas
**Status**: Não implementado
**Hardware Necessário**: Acelerômetro (MPU6050)

**O que falta:**
- Integração do sensor no ESP32
- Algoritmo de detecção de quedas
- Calibração de thresholds
- Alerta imediato ao cuidador
- Confirmação de "falso positivo"

**Complexidade**: Média-Alta
**Tempo Estimado**: 12-16 horas

---

#### 11. Botão SOS
**Status**: Não implementado
**Hardware Necessário**: Botão físico no dispositivo

**O que falta:**
- Botão conectado ao ESP32
- Debounce logic
- Envio de alerta SOS
- Notificação prioritária
- Chamada de emergência (via SIM7600G-H)

**Complexidade**: Baixa-Média
**Tempo Estimado**: 6-8 horas

---

#### 12. Alertas via SMS
**Status**: Não implementado
**Requer**: Créditos para SMS

**O que falta:**
- Integração Twilio ou similar
- Fallback quando email falha
- Configuração de números de emergência
- Templates de SMS

**Complexidade**: Baixa
**Tempo Estimado**: 4-6 horas

---

#### 13. Aplicativo Mobile Nativo
**Status**: Não implementado
**Tecnologia Sugerida**: React Native ou Flutter

**O que falta:**
- Aplicativo iOS/Android
- Notificações push nativas
- Geolocalização otimizada
- Background sync
- Offline mode

**Complexidade**: Muito Alta
**Tempo Estimado**: 80-120 horas

---

## Priorização para Conclusão do TCC

### Sprint 1: Completar MVP (2-3 semanas)
**Objetivo**: Sistema funcional end-to-end

1. **Semana 1: Interfaces**
   - [ ] Interface de geofences (editor de mapa)
   - [ ] Interface de configuração de alertas
   - [ ] Visualização de histórico

2. **Semana 2: Real-time & Firmware**
   - [ ] Implementar Supabase Realtime
   - [ ] Firmware ESP32 básico (GPS + HTTP)
   - [ ] Testes de integração hardware-software

3. **Semana 3: Testes & Documentação**
   - [ ] Testes com usuários
   - [ ] Correções de bugs
   - [ ] Documentação técnica
   - [ ] Preparação da apresentação

---

### Sprint 2: Features Importantes (2 semanas) - Opcional
**Objetivo**: Sistema polido e profissional

1. **Semana 4: Analytics & Compartilhamento**
   - [ ] Dashboard com gráficos
   - [ ] Compartilhamento de dispositivos
   - [ ] Notificações push (PWA)

2. **Semana 5: Firmware Avançado**
   - [ ] Power management (sleep modes)
   - [ ] Buffering offline
   - [ ] OTA updates

---

### Sprint 3: Features Avançadas (3-4 semanas) - Pós-TCC
**Objetivo**: Produto comercial

1. **IA Preditiva**: Modelo de ML para zonas
2. **Detecção de Quedas**: Hardware + software
3. **SMS & Chamadas**: Alertas avançados
4. **Mobile App**: React Native

---

## Plano Detalhado de Implementação

### Fase 1: Interfaces Faltantes

#### 1.1 Interface de Geofences

**Arquivo**: `src/app/(dashboard)/geofences/[hardwareId]/page.tsx`

**Componentes a criar:**

```typescript
// src/components/geofences/GeofenceEditor.tsx
// - Mapa Leaflet interativo
// - Botão "Adicionar Zona"
// - Click no mapa para definir centro
// - Input para raio (slider)
// - Input para nome da zona
// - Círculo visual no mapa
// - Botão salvar

// src/components/geofences/GeofenceList.tsx
// - Lista de geofences existentes
// - Badges de status (ativa/inativa)
// - Botões editar/excluir
// - Confirmação de exclusão
```

**Dependências**:
- react-leaflet-draw (para desenhar círculos)
- Hooks customizados para CRUD

**Checklist**:
- [ ] Instalar react-leaflet-draw
- [ ] Criar componente GeofenceEditor
- [ ] Criar componente GeofenceList
- [ ] Integrar com API existente
- [ ] Adicionar validações
- [ ] Testes de usabilidade

---

#### 1.2 Interface de Configuração de Alertas

**Arquivo**: `src/app/(dashboard)/alerts/[hardwareId]/page.tsx`

**Formulário a criar:**

```typescript
// src/components/alerts/AlertConfigForm.tsx
interface AlertConfig {
  enabled: boolean;
  emails: string[];
  minFrequencyMinutes: number;
  isAccompanied: boolean;
  lowBatteryThreshold: number;
}

// Componentes:
// - Toggle ativar/desativar
// - Input de emails (com validation)
// - Slider para frequência (15-120 min)
// - Toggle modo acompanhado
// - Input threshold de bateria (10-30%)
// - Botão "Enviar Teste de Alerta"
```

**Checklist**:
- [ ] Criar AlertConfigForm
- [ ] Integrar com API GET/PUT
- [ ] Adicionar validação de emails
- [ ] Implementar "Enviar Teste"
- [ ] Feedback de sucesso/erro
- [ ] Loading states

---

#### 1.3 Histórico de Localização

**Arquivo**: `src/app/(dashboard)/history/[hardwareId]/page.tsx`

**Componentes a criar:**

```typescript
// src/components/history/LocationTimeline.tsx
// - Lista de localizações com timestamp
// - Badge de bateria
// - Indicador se estava em zona segura

// src/components/history/LocationMap.tsx
// - Mapa com polyline (trajeto)
// - Markers de início/fim
// - Zoom para fit bounds

// src/components/history/HistoryFilters.tsx
// - Date picker (range)
// - Select de timezone
// - Botão "Exportar CSV"

// src/components/history/HistoryStats.tsx
// - Distância total percorrida
// - Tempo fora de zonas seguras
// - Alertas disparados no período
```

**Biblioteca adicional**:
- date-fns (já instalado)
- react-day-picker para date range

**Checklist**:
- [ ] Criar LocationTimeline
- [ ] Criar LocationMap com polyline
- [ ] Criar HistoryFilters
- [ ] Implementar exportação CSV
- [ ] Criar HistoryStats
- [ ] Otimizar queries (pagination)

---

### Fase 2: Real-time Updates

#### 2.1 Escolher Tecnologia

**Opção Recomendada: Supabase Realtime**

Vantagens:
- Sem custo adicional
- Já usando Supabase
- Baseado em PostgreSQL NOTIFY
- Client library pronta

Desvantagens:
- Limitado ao banco de dados
- Menos flexível que WebSocket puro

**Implementação**:

```typescript
// src/hooks/useRealtimeLocations.ts
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useRealtimeLocations(hardwareId: string) {
  const [location, setLocation] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`locations:${hardwareId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'locations',
          filter: `hardware_id=eq.${hardwareId}`,
        },
        (payload) => {
          setLocation(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hardwareId]);

  return location;
}
```

**Checklist**:
- [ ] Criar hooks de realtime
- [ ] Atualizar MapView para usar hook
- [ ] Atualizar DeviceCard com status real-time
- [ ] Adicionar indicador de "Ao vivo"
- [ ] Tratar reconexões
- [ ] Testes de estabilidade

---

#### 2.2 Status de Conexão do Dispositivo

**Estratégia**:
- Considerar "online" se última localização < 5 min
- Adicionar coluna `last_seen` na tabela devices
- Trigger PostgreSQL para atualizar last_seen

```sql
-- Migration: Add last_seen tracking
CREATE OR REPLACE FUNCTION update_device_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE devices
  SET last_seen = NEW.timestamp
  WHERE hardware_id = NEW.hardware_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_location_insert
AFTER INSERT ON locations
FOR EACH ROW
EXECUTE FUNCTION update_device_last_seen();
```

**Checklist**:
- [ ] Criar migration para last_seen
- [ ] Atualizar tipo Device
- [ ] Criar função isOnline(device)
- [ ] Adicionar badges Online/Offline
- [ ] Alertar se dispositivo ficar offline > 30min

---

### Fase 3: Firmware ESP32

#### 3.1 Setup do Ambiente

**Opção 1: Arduino IDE** (mais simples)
- Fácil para iniciantes
- Menos features

**Opção 2: PlatformIO** (recomendado)
- Gerenciamento de libs melhor
- Debugging avançado
- VSCode integration

**Checklist**:
- [ ] Instalar PlatformIO
- [ ] Criar projeto ESP32
- [ ] Adicionar bibliotecas:
  - TinyGPSPlus
  - ArduinoHttpClient
  - ArduinoJson

---

#### 3.2 Código Base do Firmware

**Estrutura sugerida**:

```cpp
// main.cpp
#include <Arduino.h>
#include <TinyGPS++.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Configurações
#define GPS_RX_PIN 16
#define GPS_TX_PIN 17
#define SIM_RX_PIN 18
#define SIM_TX_PIN 19
#define BATTERY_PIN 34
#define LED_PIN 5

// Constantes
const char* API_URL = "https://seu-app.vercel.app/api/locations";
const char* HARDWARE_ID = "ESP32_UNIQUE_ID";
const int SEND_INTERVAL = 60000; // 60 segundos

TinyGPSPlus gps;
HardwareSerial gpsSerial(1);
HardwareSerial simSerial(2);

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  pinMode(LED_PIN, OUTPUT);
  pinMode(BATTERY_PIN, INPUT);

  connectToNetwork();
}

void loop() {
  readGPS();

  if (shouldSendData()) {
    sendLocationToAPI();
  }

  delay(1000);
}

void readGPS() {
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }
}

void sendLocationToAPI() {
  if (!gps.location.isValid()) return;

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-ID", HARDWARE_ID);

  StaticJsonDocument<200> doc;
  doc["latitude"] = gps.location.lat();
  doc["longitude"] = gps.location.lng();
  doc["timestamp"] = getISOTimestamp();
  doc["batteryLevel"] = readBatteryLevel();

  String json;
  serializeJson(doc, json);

  int httpCode = http.POST(json);

  if (httpCode == 200) {
    blinkLED(1); // Sucesso
  } else {
    blinkLED(3); // Erro
  }

  http.end();
}

int readBatteryLevel() {
  int rawValue = analogRead(BATTERY_PIN);
  return map(rawValue, 0, 4095, 0, 100);
}

void blinkLED(int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
}
```

**Checklist**:
- [ ] Implementar código base
- [ ] Testar leitura GPS
- [ ] Testar conexão 4G
- [ ] Implementar envio HTTP
- [ ] Adicionar retry logic
- [ ] Testar bateria
- [ ] Adicionar deep sleep

---

#### 3.3 Gerenciamento de Energia

**Estratégia**:
- Deep sleep entre envios
- Wake up a cada 60 segundos
- Modo ultra-low power se bateria < 20%

```cpp
void enterDeepSleep(int seconds) {
  esp_sleep_enable_timer_wakeup(seconds * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {
  readGPS();
  sendLocationToAPI();

  int battery = readBatteryLevel();

  if (battery < 20) {
    // Modo economia: envia a cada 5 min
    enterDeepSleep(300);
  } else {
    // Modo normal: envia a cada 1 min
    enterDeepSleep(60);
  }
}
```

**Checklist**:
- [ ] Implementar deep sleep
- [ ] Calibrar consumo de energia
- [ ] Testar autonomia da bateria
- [ ] Adicionar alertas de bateria crítica

---

### Fase 4: Features Importantes

#### 4.1 Notificações Push (PWA)

**Service Worker**:

```typescript
// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json();

  const options = {
    body: data.message,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'geofence-alert',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
```

**Checklist**:
- [ ] Criar service worker
- [ ] Adicionar manifest.json (PWA)
- [ ] Solicitar permissão de notificações
- [ ] Integrar FCM (Firebase)
- [ ] Enviar push notifications da API
- [ ] Testar em mobile

---

#### 4.2 Dashboard com Analytics

**Componentes**:

```typescript
// src/app/(dashboard)/analytics/[hardwareId]/page.tsx

// Gráficos:
// 1. Linha: Bateria ao longo do tempo
// 2. Heatmap: Localizações mais frequentes
// 3. Barras: Alertas por dia da semana
// 4. Pizza: Tempo dentro/fora de zonas

// Bibliotecas:
// - recharts (gráficos)
// - react-leaflet-heatmap (mapa de calor)
```

**Checklist**:
- [ ] Instalar recharts
- [ ] Criar endpoint de analytics na API
- [ ] Implementar gráficos
- [ ] Adicionar filtros de período
- [ ] Exportação de relatório PDF
- [ ] Cache de dados agregados

---

#### 4.3 Compartilhamento de Dispositivos

**Schema do Banco**:

```sql
-- Migration: Device sharing
CREATE TYPE share_role AS ENUM ('viewer', 'admin', 'owner');

CREATE TABLE device_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  shared_with_user_id TEXT REFERENCES users(clerk_id),
  role share_role DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT REFERENCES users(clerk_id),
  UNIQUE(device_id, shared_with_user_id)
);

-- RLS Policies
CREATE POLICY "Users can view shared devices"
  ON device_shares FOR SELECT
  USING (shared_with_user_id = auth.uid());
```

**Checklist**:
- [ ] Criar migration
- [ ] Criar API endpoints
- [ ] Interface de convites
- [ ] Emails de convite
- [ ] Aceitar/rejeitar convite
- [ ] Gerenciar permissões

---

### Fase 5: IA Preditiva (Avançado)

#### 5.1 Pipeline de Machine Learning

**Coleta de Dados** (mínimo 3 semanas):

```sql
-- Query para training data
SELECT
  latitude,
  longitude,
  EXTRACT(HOUR FROM timestamp) as hour,
  EXTRACT(DOW FROM timestamp) as day_of_week,
  COUNT(*) as visits,
  AVG(EXTRACT(EPOCH FROM (lead_time - timestamp))) as avg_duration
FROM locations
WHERE hardware_id = $1
  AND timestamp > NOW() - INTERVAL '30 days'
GROUP BY latitude, longitude, hour, day_of_week;
```

**Modelo de Clustering** (Python):

```python
# scripts/ml/zone_predictor.py
from sklearn.cluster import DBSCAN
import numpy as np
import pandas as pd

def predict_safe_zones(locations_df):
    # Feature engineering
    X = locations_df[['latitude', 'longitude', 'hour', 'day_of_week']]

    # DBSCAN clustering
    db = DBSCAN(eps=0.001, min_samples=5)
    clusters = db.fit_predict(X[['latitude', 'longitude']])

    # Extract cluster centers
    zones = []
    for cluster_id in set(clusters):
        if cluster_id == -1:
            continue

        cluster_points = X[clusters == cluster_id]
        center_lat = cluster_points['latitude'].mean()
        center_lng = cluster_points['longitude'].mean()
        radius = calculate_radius(cluster_points)

        zones.append({
            'latitude': center_lat,
            'longitude': center_lng,
            'radius': radius,
            'confidence': len(cluster_points) / len(X)
        })

    return zones
```

**Checklist**:
- [ ] Criar script Python
- [ ] API FastAPI para ML
- [ ] Deploy do modelo (Render/Railway)
- [ ] Integração com Next.js
- [ ] UI para sugestões de zonas
- [ ] Validação humana das sugestões

---

## Cronograma Realista

### Semana 1: Interfaces Core (20h)
- [x] Análise do código existente
- [ ] Interface de geofences (8h)
- [ ] Configuração de alertas (6h)
- [ ] Histórico básico (6h)

### Semana 2: Real-time (16h)
- [ ] Setup Supabase Realtime (4h)
- [ ] Hooks de real-time (4h)
- [ ] Integração no mapa (4h)
- [ ] Status online/offline (4h)

### Semana 3: Firmware ESP32 (24h)
- [ ] Setup ambiente PlatformIO (2h)
- [ ] Código base GPS + HTTP (8h)
- [ ] Integração SIM7600G-H (6h)
- [ ] Power management (4h)
- [ ] Testes de campo (4h)

### Semana 4: Testes & Polimento (16h)
- [ ] Testes de integração (6h)
- [ ] Correção de bugs (4h)
- [ ] Documentação técnica (4h)
- [ ] Vídeo demo (2h)

### Semana 5+: Features Avançadas (Opcional)
- [ ] Dashboard analytics (16h)
- [ ] Compartilhamento (12h)
- [ ] PWA + Push (12h)
- [ ] IA Preditiva (40h)

**Total MVP: ~76 horas (2-3 semanas full-time)**
**Total Completo: ~156 horas (5-6 semanas)**

---

## Prioridades de Bugs Conhecidos

### 🔴 Crítico

#### Bug #1: AuthProvider 403 Error
**Arquivo**: `src/components/AuthProvider.tsx`
**Erro**:
```
AxiosError: Request failed with status code 403
at AuthProvider.useEffect.syncUserWithBackend
```

**Causa Provável**:
- Componente AuthProvider referencia endpoint `/api/protected/sync-user` que não existe
- Sincronização de usuários já é feita via webhook do Clerk
- AuthProvider pode ser removido

**Solução**:
1. Verificar se arquivo existe
2. Se sim, remover ou comentar lógica de sync
3. Usar apenas `useUser()` do Clerk
4. Remover importação em layouts

**Checklist**:
- [ ] Localizar AuthProvider
- [ ] Analisar dependências
- [ ] Remover ou refatorar
- [ ] Testar autenticação
- [ ] Verificar console de erros

---

## Métricas de Sucesso

### MVP (Minimum Viable Product)
- [x] Usuário pode se autenticar
- [x] Usuário pode cadastrar dispositivo
- [ ] Usuário pode criar geofences pelo mapa
- [ ] Usuário pode configurar alertas
- [ ] Usuário recebe email quando paciente sai da zona
- [ ] Dispositivo ESP32 envia localização a cada 60s
- [ ] Mapa atualiza em tempo real
- [x] Chat com IA funciona

### Produto Completo
- [ ] Sistema funciona 24/7 sem interrupções
- [ ] Bateria dura 24h+ com uso normal
- [ ] Latência < 5s entre GPS e mapa
- [ ] Taxa de sucesso de alertas > 99%
- [ ] Notificações push funcionam
- [ ] IA sugere zonas com 80%+ de precisão

---

## Riscos e Mitigações

### Risco 1: Hardware não funciona conforme esperado
**Probabilidade**: Média
**Impacto**: Alto
**Mitigação**:
- Testar módulos individualmente
- Ter módulos backup
- Documentar falhas e soluções

### Risco 2: Bateria não dura o suficiente
**Probabilidade**: Alta
**Impacto**: Médio
**Mitigação**:
- Implementar deep sleep
- Reduzir frequência de envios
- Considerar bateria maior (2000mAh)

### Risco 3: Cobertura 4G inadequada
**Probabilidade**: Média
**Impacto**: Alto
**Mitigação**:
- Implementar buffer offline
- Enviar lote de localizações quando reconectar
- Alertar usuário sobre áreas sem cobertura

### Risco 4: Custo de dados móveis
**Probabilidade**: Baixa
**Impacto**: Médio
**Mitigação**:
- Otimizar payload (enviar apenas lat/lng/bat)
- Comprimir dados (gzip)
- Plano de dados adequado

### Risco 5: Falha na detecção de geofences
**Probabilidade**: Baixa
**Impacto**: Alto
**Mitigação**:
- Testar algoritmo extensivamente
- Adicionar margem de erro (buffer de 10m)
- Logs detalhados para debug

---

## Recursos Necessários

### Hardware (para testes)
- [x] ESP32 DevKit (1x) - R$ 35
- [ ] GPS NEO-6M (1x) - R$ 25
- [ ] SIM7600G-H (1x) - R$ 180
- [ ] Bateria Li-Po 1200mAh (2x) - R$ 40
- [ ] TP4056 charger (2x) - R$ 10
- [ ] Protoboard + jumpers - R$ 30
- [ ] Case 3D printed - R$ 20

**Total Hardware: ~R$ 340**

### Software/Serviços (mensal)
- [x] Supabase: Free tier (OK para TCC)
- [x] Clerk: Free tier (10k users)
- [x] Resend: Free tier (100 emails/dia)
- [x] Vercel: Free tier
- [x] Gemini API: Free tier
- [ ] Plano de dados 4G: R$ 30-50/mês

**Total Software: R$ 30-50/mês durante desenvolvimento**

---

## Conclusão

Este plano de implementação cobre:

1. **Status atual**: 60% do MVP concluído
2. **Gaps críticos**: Interfaces, real-time, firmware
3. **Cronograma**: 2-3 semanas para MVP funcional
4. **Features futuras**: IA, analytics, mobile app
5. **Riscos**: Hardware, bateria, cobertura

### Próximos Passos Imediatos:

1. Corrigir erro do AuthProvider
2. Implementar interface de geofences
3. Adicionar real-time com Supabase
4. Desenvolver firmware ESP32 básico
5. Testes de integração

### Para o TCC:

O sistema já possui:
- ✅ Infraestrutura completa
- ✅ Backend robusto
- ✅ Integração com IA
- ✅ Sistema de alertas funcional

**Com mais 2-3 semanas de desenvolvimento focado, o sistema estará completo e funcional para apresentação do TCC.**

---

**Última Atualização**: 29/10/2025
**Próxima Revisão**: Após Sprint 1 (Semana 1)
