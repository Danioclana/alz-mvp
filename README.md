# ALZ - Sistema de Monitoramento para Pacientes com Alzheimer

Este projeto é uma solução de IoT (Internet das Coisas) desenvolvida para auxiliar no cuidado e monitoramento de segurança de pacientes diagnosticados com Alzheimer ou outras demências. O sistema permite o rastreamento em tempo real, definição de zonas de segurança (geofences) e alertas automáticos para cuidadores.

> **Nota:** Este projeto foi desenvolvido como parte de um Trabalho de Conclusão de Curso (TCC).

## 🛠️ Tecnologias Utilizadas (Stack)

O projeto utiliza uma arquitetura moderna, escalável e serverless:

### Frontend & Backend
*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
*   **Componentes:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
*   **Mapas:** Google Maps API (Principal) & Leaflet (Fallback)

### Infraestrutura & Dados
*   **Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL)
*   **Autenticação:** [Clerk](https://clerk.com/)
*   **Inteligência Artificial:** Google Gemini (Google AI SDK) para assistente virtual
*   **Emails Transacionais:** [Resend](https://resend.com/)

## 📐 Fundamentação Teórica e Algoritmos

A precisão e confiabilidade do sistema baseiam-se em algoritmos geométricos fundamentais para sistemas de geolocalização.

### 1. Cálculo de Distância (Fórmula de Haversine)
Para determinar se o paciente está dentro ou fora de uma zona segura, utilizamos a **Fórmula de Haversine**. Esta equação permite calcular a distância do grande círculo entre dois pontos em uma esfera (a Terra) a partir de suas longitudes e latitudes.

**Implementação (`src/lib/utils/distance.ts`):**
```typescript
/**
 * Calcula a distância entre duas coordenadas GPS usando a fórmula de Haversine
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distância em metros
}
```

### 2. Algoritmo de Verificação de Geofence
O sistema verifica a segurança do paciente a cada atualização de posição enviada pelo dispositivo. O algoritmo opera sob a premissa de que o paciente está seguro se estiver dentro de *qualquer* uma das zonas configuradas.

**Implementação (`src/lib/services/geofence-checker.ts`):**
```typescript
export async function checkGeofenceViolation(
  deviceId: number,
  latitude: number,
  longitude: number
): Promise<boolean> {
  // 1. Busca todas as geofences do dispositivo
  const { data: geofences } = await supabase
    .from('geofences')
    .select('*')
    .eq('device_id', deviceId);

  if (!geofences || geofences.length === 0) return false;

  // 2. Verifica se o ponto está dentro de ALGUMA geofence
  const isInsideAnyGeofence = geofences.some((geofence) => {
    return isPointInsideCircle(
      latitude,
      longitude,
      geofence.latitude,
      geofence.longitude,
      geofence.radius
    );
  });

  // 3. Se não estiver dentro de nenhuma, considera violação
  const isOutside = !isInsideAnyGeofence;

  if (isOutside) {
    // Dispara o alerta (com controle de frequência)
    await sendGeofenceAlert(deviceId, latitude, longitude);
  }

  return isOutside;
}
```

### 3. Assistente Inteligente com Google Gemini (Function Calling)

O sistema integra o LLM Google Gemini Pro para oferecer suporte conversacional. O diferencial é o uso de **Function Calling** (Chamada de Função), que permite ao modelo executar ações reais no sistema.

#### Exemplo de Fluxo de Function Calling:

**1. Usuário envia:** "Onde está o meu pai?"

**2. Gemini processa a intenção e retorna uma chamada de ferramenta:**
```json
{
  "functionCall": {
    "name": "getCurrentLocation",
    "args": {
      "deviceId": "ESP32-001" // Inferido do contexto ou perguntado
    }
  }
}
```

**3. Sistema executa a função (Backend):**
*   Busca a última localização no banco de dados.
*   Retorna um JSON para o Gemini:
    ```json
    {
      "latitude": -23.550520,
      "longitude": -46.633308,
      "timestamp": "2023-12-18T14:30:00Z",
      "address": "Praça da Sé, São Paulo"
    }
    ```

**4. Gemini gera a resposta final:**
"Seu pai está na Praça da Sé, São Paulo. A última atualização foi há 5 minutos."

---

## 🗺️ Sistema de Mapas e Visualização

### Visualização em Tempo Real
O mapa exibe a localização dos dispositivos com as seguintes características:
*   **Pontos Exibidos:** O sistema busca as **2 últimas localizações** de cada dispositivo. Isso permite traçar um vetor de direção (uma linha conectando o ponto anterior ao atual), dando ao cuidador uma noção visual do sentido do movimento.
*   **Atualização Automática:** O componente `AutoReloadMap` força uma revalidação dos dados a cada 30 segundos, garantindo que o cuidador veja a posição real sem precisar recarregar a página manualmente (`window.location.reload()`).
*   **Filtros:** Ao acessar via Dashboard geral, todos os dispositivos são mostrados. Ao acessar via "Detalhes do Dispositivo", o mapa foca e filtra apenas aquele hardware específico.

### Cadastro de Geofences (Zonas Seguras)
O processo de criação de zonas seguras utiliza a API de desenho do Google Maps (`DrawingManager`):
1.  O usuário clica no mapa para definir o **centro** da zona.
2.  Arrasta para definir o **raio** (em metros).
3.  O frontend captura as coordenadas (`lat`, `lng`) e o raio (`radius`).
4.  Esses dados são validados (Zod Schema) e enviados via `POST` para o Supabase.
5.  Imediatamente, o backend passa a considerar essa nova geometria nos cálculos de segurança.

---

## 🚨 Sistema de Notificações e Alertas

Os alertas são cruciais para a segurança do paciente. Utilizamos o serviço **Resend** para entrega confiável de emails.

### Tipos de Alerta
1.  **Violação de Perímetro (Geofence):** Quando o paciente sai de todas as zonas seguras.
2.  **Bateria Baixa:** Quando o nível de carga cai abaixo de 20%.

### Exemplo de Conteúdo de Alerta (Email)

**Assunto:** 🚨 Alerta: Maria Silva saiu da área segura

**Corpo (HTML Simplificado):**
```html
<div class="alert-box">
  <strong>Maria Silva</strong> saiu da área segura configurada.
</div>

<div class="info-box">
  <p><strong>Dispositivo:</strong> Rastreador 01</p>
  <p><strong>Horário:</strong> 18/12/2025 14:30:00</p>
  <p><strong>Localização:</strong> -23.550520, -46.633308</p>
</div>

<a href="https://maps.google.com/?q=-23.550520,-46.633308" class="button">
  Ver Localização no Mapa
</a>
```

---

## 🔌 Integração de Hardware (Universal)

O sistema foi projetado para ser agnóstico ao hardware. Qualquer dispositivo capaz de realizar uma requisição HTTP POST e obter coordenadas GPS pode ser integrado.

### Contrato da API

Para integrar um novo dispositivo (ESP32, Arduino, Raspberry Pi, Rastreador GPS comercial, ou App Mobile), envie os dados para:

**Endpoint:**
`POST https://seu-dominio.com/api/locations`

**Headers:**
```http
Content-Type: application/json
X-Device-ID: <SEU_ID_UNICO_DO_HARDWARE>
```

**Body (JSON):**
```json
{
  "latitude": -23.550520,   // Obrigatório: Decimal (-90 a 90)
  "longitude": -46.633308,  // Obrigatório: Decimal (-180 a 180)
  "timestamp": 1702904400,  // Obrigatório: Unix Timestamp em segundos (UTC)
  "batteryLevel": 85.5      // Opcional: Nível da bateria (0 a 100)
}
```

## 💾 Modelagem de Dados (Schema)

A estrutura do banco de dados (PostgreSQL) é composta pelas seguintes tabelas principais:

```sql
-- Dispositivos rastreados
CREATE TABLE devices (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  hardware_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255),
  patient_name VARCHAR(255),
  battery_level DECIMAL(5,2),
  last_location_at TIMESTAMP
);

-- Histórico de localizações (Série Temporal)
CREATE TABLE locations (
  id BIGSERIAL PRIMARY KEY,
  device_id BIGINT REFERENCES devices(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timestamp TIMESTAMP,
  battery_level DECIMAL(5,2)
);

-- Zonas Seguras
CREATE TABLE geofences (
  id BIGSERIAL PRIMARY KEY,
  device_id BIGINT REFERENCES devices(id),
  name VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  radius DECIMAL(10, 2) -- Em metros
);
```

## ⚠️ Troubleshooting e Desafios Comuns

Seção dedicada à resolução de problemas comuns durante o desenvolvimento e uso do sistema.

### 1. GPS Drift (Imprecisão do GPS)
**Problema:** O dispositivo reporta falsas saídas da zona segura mesmo estando parado, devido a flutuações no sinal GPS (especialmente em ambientes internos ou dias nublados).
**Mitigação:**
*   Aumentar o raio mínimo das geofences (recomendado: > 30 metros) para criar uma margem de erro.
*   No hardware, implementar filtro de média móvel para suavizar as coordenadas antes de enviar.

### 2. Alertas Repetitivos (Flapping)
**Problema:** O paciente fica na borda da zona segura, causando múltiplos alertas de "Saiu" e "Entrou" em curto período.
**Solução:** O sistema implementa um *debounce* configurável (`alert_frequency_minutes`). Se um alerta foi enviado há menos de X minutos (padrão 30 min), novos alertas são suprimidos até que o tempo expire.

### 3. Latência de Rede
**Problema:** Demora na atualização do mapa.
**Solução:** O frontend utiliza a diretiva `force-dynamic` nas páginas de mapa e componentes de atualização automática (`AutoReloadMap`) para garantir que os dados exibidos sejam sempre os mais recentes recebidos pelo backend, evitando cache agressivo de páginas estáticas.

### 4. Erros de Configuração de Hardware
**Problema:** O dispositivo envia dados mas eles não aparecem.
**Verificações:**
*   Confira se o `X-Device-ID` no header da requisição é EXATAMENTE igual ao cadastrado no painel (case-sensitive).
*   Verifique se o timestamp enviado está em formato UNIX (segundos), não milissegundos.
*   Valide se o JSON está bem formatado.

## 🚀 Como Rodar Localmente

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/alz-mvp.git
    cd alz-mvp
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env.local` com as chaves necessárias (Supabase, Clerk, Google Maps, Gemini).

4.  **Rode o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

5.  Acesse `http://localhost:3000`.