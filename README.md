# Sistema Inteligente de Apoio a Cuidadores de Pessoas com Alzheimer

## Sobre o Projeto

Este trabalho propõe o desenvolvimento de um **sistema inteligente de apoio a cuidadores de pessoas com Alzheimer**, composto por um aplicativo web e um dispositivo de rastreamento com GPS e conectividade 4G. O sistema monitora em tempo real a localização do paciente, envia alertas em situações de risco e permite a definição de áreas seguras com o auxílio de inteligência artificial.

### Objetivo

A proposta visa aumentar a segurança do idoso e oferecer maior tranquilidade ao cuidador, indo além das soluções existentes através da integração de hardware e software com recursos de IA.

### Diferenciais

- **Zonas Seguras Dinâmicas**: Aplicação de Inteligência Artificial para criação de geofences personalizadas que aprendem com a rotina do paciente
- **Monitoramento Proativo**: Sistema que antecipa situações de risco baseado em padrões comportamentais
- **Integração Completa**: Hardware + Software + IA em uma solução única e de fácil uso
- **Alertas Inteligentes**: Sistema de notificações por email com throttling e modo acompanhado
- **Assistente IA**: Chat especializado com Google Gemini para suporte aos cuidadores

---

## Objetivos Específicos

1. **Projetar e montar um protótipo de hardware** para o dispositivo de rastreamento, utilizando microcontrolador, módulo GPS e conectividade 4G
2. **Desenvolver aplicativo web** que permita ao cuidador visualizar a localização do paciente em mapa, receber alertas e configurar o sistema
3. **Implementar comunicação em tempo real** entre o dispositivo de rastreamento e o aplicativo através de backend robusto
4. **Desenvolver módulo de Inteligência Artificial** para criação de zonas seguras (geofencing) de forma inteligente, baseado em padrões de deslocamento
5. **Realizar testes de usabilidade, precisão e eficiência** do sistema integrado para validação da solução

---

## Arquitetura do Sistema

### Componentes de Hardware

- **Microcontrolador**: ESP32 (dual-core, Wi-Fi/Bluetooth integrado, baixo custo)
- **Módulo GPS**: NEO-6M (alta precisão, ampla documentação)
- **Módulo de Comunicação**: SIM7600G-H 4G (transmissão de dados em tempo real)
- **Bateria**: Li-Po 1200mAh (operação contínua)
- **Carregamento**: Módulo TP4056 para gerenciamento de bateria
- **Sensores Adicionais**: Suporte para acelerômetro (detecção de quedas - futuro)

### Stack Tecnológico

#### Frontend
- **Framework**: Next.js 16.0.0 (App Router)
- **UI**: React 19.2.0 + TypeScript 5
- **Estilização**: TailwindCSS 4
- **Mapas**: Leaflet + React-Leaflet
- **Ícones**: Lucide React
- **Validação**: Zod 4.1.12

#### Backend
- **API**: Next.js API Routes (Server-side)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Segurança**: Row Level Security (RLS)
- **Autenticação**: Clerk
- **Email**: Resend
- **IA**: Google Gemini API
- **Webhooks**: Svix

#### Hardware
- **Firmware**: Arduino/PlatformIO (C++)
- **Protocolo**: HTTP REST
- **Formato**: JSON
- **Autenticação**: Hardware ID

---

## Funcionalidades Implementadas

### Core System
- ✅ Autenticação completa com Clerk
- ✅ Sincronização de usuários via webhooks
- ✅ Banco de dados PostgreSQL com RLS
- ✅ API RESTful completa
- ✅ Middleware de segurança

### GPS & Rastreamento
- ✅ Recepção de dados GPS do ESP32
- ✅ Armazenamento de histórico de localização
- ✅ Monitoramento de nível de bateria
- ✅ Visualização em mapa interativo (Leaflet)
- ✅ Suporte para múltiplos dispositivos

### Geofencing & Alertas
- ✅ Sistema de geofences (zonas seguras)
- ✅ Detecção automática de violações
- ✅ Cálculo de distância (Haversine)
- ✅ Alertas por email (templates HTML)
- ✅ Throttling de alertas (anti-spam)
- ✅ Modo acompanhado (pausa de alertas)
- ✅ Alertas de bateria baixa
- ✅ Histórico completo de alertas
- ✅ Integração com Google Maps nos emails

### Gerenciamento de Dispositivos
- ✅ Cadastro de dispositivos
- ✅ Visualização de status (online/offline)
- ✅ Indicadores de bateria
- ✅ Last seen timestamp
- ✅ Dashboard com lista de dispositivos

### Inteligência Artificial
- ✅ Chat assistente com Gemini AI
- ✅ Conhecimento especializado em Alzheimer
- ✅ Suporte emocional aos cuidadores
- ✅ Histórico de conversação
- ✅ **Function Calling** - Assistente executa ações no sistema:
  - ✅ Consultar localização atual (`getCurrentLocation`)
  - ✅ Verificar status do dispositivo (`getDeviceStatus`)
  - ✅ Listar zonas seguras (`listGeofences`)
  - ✅ Criar zonas seguras via chat (`createGeofence`)
  - ✅ Ver histórico de alertas (`getAlertHistory`)
  - ✅ Ver histórico de movimentação (`getLocationHistory`)
  - ✅ Listar dispositivos (`listDevices`)
  - ✅ Converter endereços em coordenadas (`geocodeAddress`)

---

## Funcionalidades em Desenvolvimento

### Alta Prioridade
- ⏳ **Simulador de Hardware** - Para testes sem ESP32 físico
- ⏳ Atualizações em tempo real (WebSockets/SSE)
- ⏳ Notificações push (PWA)
- ⏳ Firmware ESP32 completo

### Funcionalidades Futuras
- 📋 Modelo de IA para predição de zonas seguras
- 📋 Análise de padrões comportamentais
- 📋 Dashboard com analytics e gráficos
- 📋 Exportação de relatórios (PDF/CSV)
- 📋 Compartilhamento de dispositivos
- 📋 Gerenciamento de múltiplos cuidadores
- 📋 Alertas via SMS (usando SIM7600G-H)
- 📋 Detecção de quedas (acelerômetro)
- 📋 Botão SOS no dispositivo
- 📋 Suporte multi-idioma

---

## Estrutura do Banco de Dados

### Tabelas Principais

**users**
- Sincronizado com Clerk
- Armazena perfil e preferências

**devices**
- Dispositivos ESP32 cadastrados
- Hardware ID único
- Vinculado ao usuário

**locations**
- Histórico de coordenadas GPS
- Timestamp e nível de bateria
- Indexado para queries rápidas

**geofences**
- Definição de zonas seguras
- Raio em metros
- Ativação/desativação

**alert_configs**
- Configurações de alertas por dispositivo
- Frequência, emails de destino
- Modo acompanhado

**alert_status**
- Estado atual dos alertas
- Controle de throttling
- Pausa temporária

**alert_history**
- Log completo de alertas enviados
- Auditoria e analytics

---

## Segurança

### Autenticação
- Clerk para gerenciamento de sessões
- Tokens JWT seguros
- Protected routes via middleware

### Autorização
- Row Level Security (RLS) no Supabase
- Usuários só acessam seus próprios dados
- Service Role Key para ESP32 (bypass controlado)

### Validação
- Zod schemas em todas as entradas
- Validação de hardware_id
- Sanitização de dados

### Comunicação
- HTTPS obrigatório
- Headers de autenticação
- Webhook signature verification (Clerk)

---

## Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- npm/yarn/pnpm
- Conta Supabase
- Conta Clerk
- Conta Resend
- API Key do Google Gemini

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/alz.git
cd alz
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Clerk (Autenticação)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Resend (Email)
RESEND_API_KEY=re_...
ALERTS_FROM_EMAIL=alerts@yourdomain.com
ALERTS_FROM_NAME=Alzheimer Care

# Gemini AI (Chat)
GEMINI_API_KEY=AIzaSy...

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Security
JWT_SECRET=seu_secret_muito_seguro_aqui_min_32_chars
```

### 4. Configure o banco de dados

Execute a migration no Supabase:

```bash
# Acesse o SQL Editor no dashboard do Supabase
# Cole e execute o conteúdo de: supabase/migrations/001_initial_schema.sql
```

### 5. Configure o webhook do Clerk

1. Acesse o dashboard do Clerk
2. Vá em Webhooks → Add Endpoint
3. URL: `https://seu-dominio.vercel.app/api/webhooks/clerk`
4. Eventos: `user.created`, `user.updated`
5. Copie o Signing Secret para `CLERK_WEBHOOK_SECRET`

### 6. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## Configuração do Hardware (ESP32)

### Pinagem Sugerida

```
ESP32           Componente
GPIO 16 (RX)  → TX do SIM7600G-H
GPIO 17 (TX)  → RX do SIM7600G-H
GPIO 16 (RX2) → TX do NEO-6M
GPIO 17 (TX2) → RX do NEO-6M
GPIO 34       → Leitura de bateria (ADC)
GPIO 5        → LED de status
```

### Endpoint da API

O ESP32 deve enviar dados para:

```
POST https://seu-dominio.vercel.app/api/locations
Headers:
  X-Device-ID: hardware_id_do_dispositivo
  Content-Type: application/json

Body:
{
  "latitude": -23.550520,
  "longitude": -46.633308,
  "timestamp": "2025-10-29T10:30:00Z",
  "batteryLevel": 87
}
```

### Exemplo de Código Arduino

Ver documentação completa em: `NEXTJS_REBUILD_BLUEPRINT.md`

---

## Deploy

### Vercel (Recomendado)

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

```bash
npm install -g vercel
vercel --prod
```

### Variáveis de Ambiente (Produção)

Não esqueça de configurar no dashboard da Vercel:
- Todas as variáveis do `.env`
- Atualizar `NEXT_PUBLIC_APP_URL` com a URL de produção

---

## Testes

### Testar Endpoint do ESP32

```bash
curl -X POST http://localhost:3000/api/locations \
  -H "X-Device-ID: seu-hardware-id" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -23.550520,
    "longitude": -46.633308,
    "timestamp": "2025-10-29T10:30:00Z",
    "batteryLevel": 87
  }'
```

### Testar Geofence

1. Cadastre um dispositivo no dashboard
2. Crie uma geofence na API
3. Envie coordenadas fora da área
4. Verifique o recebimento de email

---

## Estrutura de Diretórios

```
alz/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rotas de autenticação
│   │   ├── (dashboard)/       # Rotas protegidas
│   │   ├── api/               # API endpoints
│   │   └── page.tsx           # Landing page
│   ├── components/            # Componentes React
│   │   ├── ui/                # Componentes base
│   │   ├── layout/            # Layout components
│   │   ├── devices/           # Device components
│   │   └── map/               # Map components
│   ├── lib/                   # Bibliotecas e utilitários
│   │   ├── services/          # Lógica de negócio
│   │   ├── supabase/          # Database clients
│   │   ├── validations/       # Zod schemas
│   │   └── utils/             # Helper functions
│   ├── types/                 # TypeScript types
│   └── middleware.ts          # Next.js middleware
├── supabase/
│   └── migrations/            # Database migrations
├── public/                    # Arquivos estáticos
└── docs/                      # Documentação adicional
```

---

## Contribuindo

Este é um projeto de TCC (Trabalho de Conclusão de Curso). Contribuições são bem-vindas para fins educacionais.

### Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## Roadmap

### Fase 1: MVP (Concluída ~80%)
- ✅ Infraestrutura básica
- ✅ Sistema de autenticação
- ✅ Recepção de dados GPS
- ✅ Detecção de geofences
- ✅ Alertas por email
- ✅ Interfaces de gerenciamento
- ✅ Editor visual de geofences
- ✅ Chat com IA + Function Calling
- ⏳ Simulador de hardware

### Fase 2: Real-time & Mobile (Em Planejamento)
- ⏳ WebSockets/SSE para updates em tempo real
- ⏳ PWA (Progressive Web App)
- ⏳ Notificações push
- ⏳ Firmware ESP32 completo

### Fase 3: IA & Analytics (Futuro)
- 📋 Modelo de ML para predição de zonas
- 📋 Análise comportamental
- 📋 Dashboard de analytics
- 📋 Relatórios automatizados

### Fase 4: Recursos Avançados (Futuro)
- 📋 Detecção de quedas
- 📋 Monitoramento de saúde
- 📋 Chamadas de emergência
- 📋 Multi-idioma

---

## Licença

Este projeto é um TCC acadêmico desenvolvido para fins educacionais.

---

## Autores

- Daniel - Desenvolvimento Full Stack

---

## Agradecimentos

- Orientador do TCC
- Família e amigos que apoiaram o projeto
- Comunidade open-source pelas ferramentas incríveis
- Cuidadores de pessoas com Alzheimer que inspiraram esta solução

---

## Contato

Para dúvidas ou sugestões sobre o projeto, abra uma issue no repositório.

---

## Referências

- Next.js Documentation: https://nextjs.org/docs
- Supabase Documentation: https://supabase.com/docs
- Clerk Documentation: https://clerk.com/docs
- Leaflet Documentation: https://leafletjs.com/
- ESP32 Documentation: https://docs.espressif.com/
- Google Gemini API: https://ai.google.dev/

---

**Status do Projeto**: 🚧 Em Desenvolvimento Ativo

**Última Atualização**: Outubro 2025
