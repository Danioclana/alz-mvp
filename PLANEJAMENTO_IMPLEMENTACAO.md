# Planejamento de Implementação - TCC Alzheimer Care

## 🎯 Objetivo: Completar as funcionalidades críticas do TCC (exceto hardware físico)

**Tempo Total Estimado:** 4-5 semanas  
**Foco:** Assistente Virtual + Simulador de Hardware + Interfaces Faltantes

---

## 📅 CRONOGRAMA DETALHADO

### **SPRINT 1: Simulador de Hardware (Semana 1)**
**Objetivo:** Criar simulador de ESP32 que envia dados GPS simulados

#### Dia 1-2: Estrutura do Simulador
- [ ] Criar página `/simulator` no dashboard
- [ ] Interface para controlar dispositivo simulado
- [ ] Seletor de dispositivo para simular
- [ ] Controles: Play/Pause/Stop simulação

#### Dia 3-4: Lógica de Simulação
- [ ] Gerar coordenadas GPS realistas (rotas)
- [ ] Simular movimento (caminhada ~5km/h)
- [ ] Variação de bateria (descarga gradual)
- [ ] Envio automático para API `/api/locations`

#### Dia 5: Cenários Pré-configurados
- [ ] Rota 1: Dentro da zona segura
- [ ] Rota 2: Saída da zona segura (trigger alerta)
- [ ] Rota 3: Bateria baixa
- [ ] Rota 4: Perambulação aleatória

**Entregável:** Simulador funcional que permite testar todo o sistema

---

### **SPRINT 2: Interface do Assistente Virtual (Semana 2)**
**Objetivo:** Criar interface de chat acessível e funcional

#### Dia 1-2: Componente de Chat
```typescript
Arquivos a criar:
- src/components/chat/ChatWidget.tsx        // Widget flutuante
- src/components/chat/ChatMessage.tsx       // Componente de mensagem
- src/components/chat/ChatInput.tsx         // Input de mensagem
- src/components/chat/ChatHistory.tsx       // Lista de mensagens
- src/app/(dashboard)/chat/page.tsx         // Página dedicada (opcional)
```

**Features:**
- [ ] Botão flutuante no canto inferior direito
- [ ] Modal/drawer que abre o chat
- [ ] Lista de mensagens com scroll
- [ ] Input com envio (Enter ou botão)
- [ ] Indicador de "digitando..."
- [ ] Avatar do assistente
- [ ] Timestamps nas mensagens

#### Dia 3: Integração com API
- [ ] Conectar com `/api/chat` existente
- [ ] Gerenciar estado de conversação
- [ ] Persistir histórico no localStorage
- [ ] Tratamento de erros
- [ ] Loading states

#### Dia 4: Melhorias UX
- [ ] Animações de entrada/saída
- [ ] Scroll automático para última mensagem
- [ ] Formatação de mensagens (markdown)
- [ ] Mensagens de boas-vindas
- [ ] Sugestões de perguntas iniciais

#### Dia 5: Testes e Refinamentos
- [ ] Testar em diferentes dispositivos
- [ ] Ajustes de responsividade
- [ ] Acessibilidade (ARIA labels)
- [ ] Documentação de uso

**Entregável:** Chat funcional e acessível em todo o dashboard

---

### **SPRINT 3: Base de Conhecimento do Assistente (Semana 3)**
**Objetivo:** Expandir conhecimento do assistente sobre o sistema

#### Dia 1-2: Documentação do Sistema
```markdown
Criar arquivo: src/lib/ai/knowledge-base.ts

Conteúdo:
- Informações sobre o sistema
- Como funciona o rastreamento
- Explicação de geofences
- Como interpretar alertas
- Procedimentos de configuração
- FAQ técnico
```

**Tópicos a documentar:**
- [ ] O que é o sistema e como funciona
- [ ] Como cadastrar um dispositivo
- [ ] Como criar zonas seguras
- [ ] Como funcionam os alertas
- [ ] O que fazer quando receber um alerta
- [ ] Troubleshooting comum
- [ ] Informações sobre bateria
- [ ] Privacidade e segurança

#### Dia 3: Integração com Gemini
- [ ] Atualizar `SYSTEM_PROMPT` com conhecimento
- [ ] Adicionar contexto do usuário (dispositivos, zonas)
- [ ] Implementar RAG básico (Retrieval Augmented Generation)
- [ ] Testar respostas sobre o sistema

#### Dia 4-5: Refinamento de Respostas
- [ ] Criar prompts específicos para cada tipo de pergunta
- [ ] Adicionar exemplos de diálogos
- [ ] Testar e ajustar tom de voz
- [ ] Validar precisão das informações

**Entregável:** Assistente que conhece profundamente o sistema

---

### **SPRINT 4: Function Calling - Ações no Sistema (Semana 4)**
**Objetivo:** Permitir que assistente execute ações

#### Dia 1-2: Estrutura de Function Calling
```typescript
Arquivos a criar:
- src/lib/ai/functions.ts              // Definição de funções
- src/lib/ai/function-executor.ts      // Executor de funções
- src/app/api/chat/actions/route.ts    // Endpoint para ações
```

**Funções a implementar:**
- [ ] `getCurrentLocation(deviceId)` - Consultar localização atual
- [ ] `getDeviceStatus(deviceId)` - Status do dispositivo
- [ ] `listGeofences(deviceId)` - Listar zonas seguras
- [ ] `createGeofence(name, lat, lng, radius)` - Criar zona
- [ ] `getAlertHistory(deviceId, days)` - Histórico de alertas
- [ ] `getLocationHistory(deviceId, hours)` - Histórico de movimento

#### Dia 3: Integração com Gemini Function Calling
- [ ] Configurar Gemini para usar function calling
- [ ] Mapear funções para tools do Gemini
- [ ] Implementar executor de funções
- [ ] Validação de permissões

#### Dia 4: Fluxos Conversacionais
**Implementar exemplos do TCC:**

**Exemplo 1: Criar Zona Segura**
```
Usuário: "Preciso criar uma área segura"
Assistente: "Claro! Onde fica esse local?"
Usuário: "Casa da minha mãe, Rua das Flores 123"
Assistente: [geocoding] "Qual o raio da zona?"
Usuário: "50 metros"
Assistente: [createGeofence] "Zona criada com sucesso!"
```

**Exemplo 2: Consultar Localização**
```
Usuário: "Onde está minha mãe agora?"
Assistente: [getCurrentLocation] "Ela está em [endereço], 
            dentro da zona segura 'Casa'. Última atualização: 2 min atrás"
```

#### Dia 5: Testes e Validação
- [ ] Testar cada função individualmente
- [ ] Testar fluxos completos
- [ ] Validar respostas do assistente
- [ ] Documentar capabilities

**Entregável:** Assistente que executa ações no sistema

---

### **SPRINT 5: Editor Visual de Geofences (Semana 5)**
**Objetivo:** Interface visual para criar/editar zonas seguras

#### Dia 1-2: Componente de Mapa Interativo
```typescript
Arquivos a criar:
- src/components/geofences/GeofenceEditor.tsx
- src/components/geofences/GeofenceDrawer.tsx
- src/components/geofences/GeofenceList.tsx
```

**Features:**
- [ ] Mapa interativo (Google Maps ou Leaflet)
- [ ] Click no mapa para definir centro
- [ ] Slider para ajustar raio
- [ ] Preview visual do círculo
- [ ] Geocoding reverso (mostrar endereço)

#### Dia 3: CRUD de Geofences
- [ ] Formulário de criação
- [ ] Lista de geofences existentes
- [ ] Edição de geofence
- [ ] Exclusão com confirmação
- [ ] Ativação/desativação

#### Dia 4: Integração com Backend
- [ ] Conectar com API de geofences
- [ ] Salvar no banco de dados
- [ ] Atualização em tempo real
- [ ] Validações (raio mínimo/máximo)

#### Dia 5: Melhorias e Testes
- [ ] Múltiplas zonas no mesmo mapa
- [ ] Cores diferentes por zona
- [ ] Labels com nome da zona
- [ ] Responsividade mobile
- [ ] Testes de usabilidade

**Entregável:** Editor visual completo de geofences

---

## 🛠️ DETALHAMENTO TÉCNICO

### **1. Simulador de Hardware**

#### Estrutura de Dados
```typescript
interface SimulatorState {
  deviceId: string;
  isRunning: boolean;
  currentPosition: { lat: number; lng: number };
  batteryLevel: number;
  route: Array<{ lat: number; lng: number }>;
  speed: number; // km/h
  updateInterval: number; // segundos
}
```

#### Lógica de Simulação
```typescript
// Gerar rota realista
function generateRoute(start: LatLng, end: LatLng): LatLng[] {
  // Usar Google Directions API ou gerar pontos intermediários
  // Simular caminhada humana com variações
}

// Atualizar posição
function updatePosition() {
  // Mover para próximo ponto da rota
  // Decrementar bateria gradualmente
  // Enviar para API a cada X segundos
}
```

#### Interface do Simulador
```
┌─────────────────────────────────────┐
│ 🎮 Simulador de Dispositivo         │
├─────────────────────────────────────┤
│ Dispositivo: [Dropdown]             │
│ Cenário: [Dropdown]                 │
│                                     │
│ Status: ⚫ Parado                   │
│ Bateria: 87%                        │
│ Localização: -23.550, -46.633      │
│                                     │
│ [▶️ Iniciar] [⏸️ Pausar] [⏹️ Parar] │
│                                     │
│ [Mapa mostrando rota]               │
└─────────────────────────────────────┘
```

---

### **2. Interface do Chat**

#### Componente Principal
```typescript
// src/components/chat/ChatWidget.tsx
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      {/* Botão Flutuante */}
      <button 
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full 
                   bg-primary shadow-lg hover:shadow-xl"
        onClick={() => setIsOpen(true)}
      >
        💬
      </button>

      {/* Modal do Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] 
                        bg-card rounded-2xl shadow-2xl">
          <ChatHeader onClose={() => setIsOpen(false)} />
          <ChatHistory messages={messages} />
          <ChatInput 
            value={input}
            onChange={setInput}
            onSend={handleSend}
            isLoading={isLoading}
          />
        </div>
      )}
    </>
  );
}
```

#### Mensagens de Boas-Vindas
```typescript
const WELCOME_MESSAGES = [
  "Olá! Sou o assistente do Alzheimer Care. Como posso ajudar?",
  "Algumas coisas que posso fazer:",
  "• Consultar a localização atual",
  "• Criar zonas seguras",
  "• Explicar como usar o sistema",
  "• Ver histórico de alertas"
];
```

---

### **3. Base de Conhecimento**

#### Estrutura
```typescript
// src/lib/ai/knowledge-base.ts
export const SYSTEM_KNOWLEDGE = {
  about: `
    O Alzheimer Care é um sistema de rastreamento inteligente...
  `,
  
  howItWorks: `
    O sistema funciona através de um dispositivo GPS que...
  `,
  
  geofences: `
    Zonas seguras (geofences) são áreas circulares que você define...
  `,
  
  alerts: `
    Você receberá alertas por email quando...
  `,
  
  faq: [
    {
      question: "Como criar uma zona segura?",
      answer: "..."
    },
    // ...
  ]
};
```

#### Prompt Aprimorado
```typescript
const ENHANCED_SYSTEM_PROMPT = `
Você é o assistente virtual do Alzheimer Care, um sistema de rastreamento 
para pessoas com Alzheimer.

CONHECIMENTO DO SISTEMA:
${SYSTEM_KNOWLEDGE.about}

CAPACIDADES:
- Consultar localização em tempo real
- Criar e gerenciar zonas seguras
- Ver histórico de movimentação
- Configurar alertas
- Explicar funcionalidades

FUNÇÕES DISPONÍVEIS:
- getCurrentLocation(deviceId)
- createGeofence(name, lat, lng, radius)
- getAlertHistory(deviceId)
- getLocationHistory(deviceId)

ESTILO DE COMUNICAÇÃO:
- Empático e acolhedor
- Linguagem simples e clara
- Proativo em oferecer ajuda
- Paciente com usuários menos experientes

Quando o usuário pedir para criar uma zona segura, use a função createGeofence.
Quando perguntar "onde está", use getCurrentLocation.
`;
```

---

### **4. Function Calling**

#### Definição de Funções
```typescript
// src/lib/ai/functions.ts
export const AVAILABLE_FUNCTIONS = [
  {
    name: 'getCurrentLocation',
    description: 'Obtém a localização atual de um dispositivo',
    parameters: {
      type: 'object',
      properties: {
        deviceId: {
          type: 'string',
          description: 'ID do dispositivo'
        }
      },
      required: ['deviceId']
    }
  },
  {
    name: 'createGeofence',
    description: 'Cria uma nova zona segura',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nome da zona' },
        latitude: { type: 'number', description: 'Latitude do centro' },
        longitude: { type: 'number', description: 'Longitude do centro' },
        radius: { type: 'number', description: 'Raio em metros' }
      },
      required: ['name', 'latitude', 'longitude', 'radius']
    }
  }
  // ... outras funções
];
```

#### Executor
```typescript
// src/lib/ai/function-executor.ts
export async function executeFunction(
  functionName: string,
  args: Record<string, any>,
  userId: string
) {
  switch (functionName) {
    case 'getCurrentLocation':
      return await getCurrentLocation(args.deviceId, userId);
    
    case 'createGeofence':
      return await createGeofence(
        args.name,
        args.latitude,
        args.longitude,
        args.radius,
        userId
      );
    
    // ... outros casos
  }
}
```

---

### **5. Editor de Geofences**

#### Interface Visual
```typescript
// src/components/geofences/GeofenceEditor.tsx
export function GeofenceEditor({ deviceId }: Props) {
  const [center, setCenter] = useState<LatLng | null>(null);
  const [radius, setRadius] = useState(50);
  const [name, setName] = useState('');

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Mapa */}
      <div>
        <GoogleMap
          onClick={(e) => setCenter(e.latLng)}
          center={center}
        >
          {center && (
            <Circle
              center={center}
              radius={radius}
              fillColor="#10b981"
              fillOpacity={0.2}
            />
          )}
        </GoogleMap>
      </div>

      {/* Formulário */}
      <div>
        <Input
          label="Nome da Zona"
          value={name}
          onChange={setName}
        />
        
        <Slider
          label="Raio (metros)"
          min={10}
          max={500}
          value={radius}
          onChange={setRadius}
        />

        {center && (
          <div className="text-sm text-muted-foreground">
            📍 {reverseGeocode(center)}
          </div>
        )}

        <Button onClick={handleSave}>
          Criar Zona Segura
        </Button>
      </div>
    </div>
  );
}
```

---

## 📊 MÉTRICAS DE SUCESSO

### Simulador
- [ ] Consegue simular rotas realistas
- [ ] Envia dados para API corretamente
- [ ] Permite testar todos os cenários
- [ ] Interface intuitiva

### Assistente Virtual
- [ ] Responde em < 3 segundos
- [ ] Taxa de compreensão > 80%
- [ ] Executa ações corretamente
- [ ] Interface responsiva e acessível

### Editor de Geofences
- [ ] Criação de zona em < 1 minuto
- [ ] Preview visual funcional
- [ ] Salvamento sem erros
- [ ] Usável em mobile

---

## 🎯 PRIORIZAÇÃO

### Semana 1 (CRÍTICA)
**Simulador** - Sem isso não dá para testar nada

### Semana 2 (CRÍTICA)
**Interface do Chat** - É o diferencial do TCC

### Semana 3 (ALTA)
**Base de Conhecimento** - Assistente precisa conhecer o sistema

### Semana 4 (ALTA)
**Function Calling** - Demonstra capacidade de ação

### Semana 5 (MÉDIA)
**Editor Visual** - Melhora UX mas não é crítico

---

## 📝 CHECKLIST DE CONCLUSÃO

### Antes de Considerar Pronto:
- [ ] Simulador funciona e gera dados realistas
- [ ] Chat acessível em todo o dashboard
- [ ] Assistente responde sobre o sistema
- [ ] Assistente executa pelo menos 3 ações
- [ ] Editor de geofences funcional
- [ ] Testes com pelo menos 3 usuários
- [ ] Documentação atualizada
- [ ] Screenshots/vídeos para apresentação

### Documentação para TCC:
- [ ] Arquitetura do sistema
- [ ] Fluxogramas de interação
- [ ] Exemplos de diálogos
- [ ] Resultados de testes
- [ ] Métricas coletadas

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

1. **Agora:** Criar estrutura do simulador
2. **Depois:** Implementar interface do chat
3. **Em seguida:** Expandir conhecimento do assistente
4. **Por fim:** Function calling e editor visual

**Quer que eu comece implementando o simulador de hardware?**
