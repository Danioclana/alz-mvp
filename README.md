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

**Fórmula implementada:**
```math
a = \sin^2(\frac{\Delta\phi}{2}) + \cos \phi_1 \cdot \cos \phi_2 \cdot \sin^2(\frac{\Delta\lambda}{2})
c = 2 \cdot \text{atan2}(\sqrt{a}, \sqrt{1-a})
d = R \cdot c
```
Onde:
*   $\phi$ é a latitude, $\lambda$ é a longitude.
*   $R$ é o raio da Terra (aproximadamente 6.371 km).
*   $d$ é a distância resultante em metros.

*Implementação: `src/lib/utils/distance.ts`*

### 2. Verificação de Geofence (Point-in-Circle)
O sistema verifica a segurança do paciente a cada atualização de posição enviada pelo dispositivo.

**Algoritmo:**
1.  O sistema busca todas as geofences ativas associadas ao dispositivo.
2.  Para cada geofence (definida por um centro $C$ e um raio $r$), calcula-se a distância $d$ entre a posição atual do paciente $P$ e $C$.
3.  **Condição de Segurança:** Se $d \le r$, o paciente está dentro da zona segura.
4.  **Violação:** Se o paciente não estiver dentro de **nenhuma** das geofences configuradas, um alerta é disparado.

*Implementação: `src/lib/services/geofence-checker.ts`*

### 3. Gerenciamento de Alertas
Para evitar spam de notificações (flapping), implementamos um sistema de controle de frequência:
*   Verifica-se o timestamp do último alerta enviado.
*   Novos alertas só são disparados se `(agora - ultimo_alerta) > frequencia_configurada`.

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
*O `X-Device-ID` deve corresponder ao "ID do Hardware" cadastrado no painel do sistema.*

**Body (JSON):**
```json
{
  "latitude": -23.550520,   // Obrigatório: Decimal (-90 a 90)
  "longitude": -46.633308,  // Obrigatório: Decimal (-180 a 180)
  "timestamp": 1702904400,  // Obrigatório: Unix Timestamp em segundos (UTC)
  "batteryLevel": 85.5      // Opcional: Nível da bateria (0 a 100)
}
```

### Exemplo de Implementação (C++ / ESP32)

```cpp
HTTPClient http;
http.begin("https://alz-mvp.vercel.app/api/locations");
http.addHeader("Content-Type", "application/json");
http.addHeader("X-Device-ID", "ESP32-DEVICE-001");

String json = "{\"latitude\": -23.55, \"longitude\": -46.63, \"timestamp\": 1702904400, \"batteryLevel\": 90}";
int httpResponseCode = http.POST(json);
```

## 📂 Estrutura do Projeto

As principais pastas e responsabilidades:

*   `src/app`: Rotas e páginas (App Router).
    *   `(dashboard)`: Área logada (Mapas, Dispositivos, Alertas).
    *   `api`: Endpoints da API (Webhooks, Locations, etc).
*   `src/components`: Componentes React reutilizáveis.
    *   `map`: Componentes de visualização de mapas (Google/Leaflet).
    *   `geofences`: Editores e listas de zonas seguras.
*   `src/lib`: Lógica de negócios e utilitários.
    *   `services`: Lógica complexa (Geofence Checker, Alert Manager, AI).
    *   `utils`: Funções matemáticas e formatadores.
    *   `validations`: Schemas Zod para validação de dados.

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
    Crie um arquivo `.env.local` com as chaves necessárias (Supabase, Clerk, Google Maps, etc).

4.  **Rode o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

5.  Acesse `http://localhost:3000`.