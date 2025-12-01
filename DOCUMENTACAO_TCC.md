# Documentação Técnica - Alzheimer Care
> Documento de referência para elaboração de Monografia/TCC

## 1. Visão Geral do Projeto

O **Alzheimer Care** é um sistema de monitoramento inteligente projetado para auxiliar cuidadores e familiares de pessoas com Doença de Alzheimer. O sistema integra hardware (dispositivos de rastreamento IoT) e software (plataforma web) para fornecer localização em tempo real, gestão de zonas de segurança (geofencing) e assistência inteligente via IA.

### Objetivo Principal
Proporcionar segurança para o paciente e tranquilidade para o cuidador através de tecnologia acessível e inteligente.

---

## 2. Stack Tecnológico

### Frontend (Interface do Usuário)
- **Framework**: [Next.js 15+](https://nextjs.org/) (React) - Escolhido pela renderização híbrida (SSR/CSR) e performance.
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/) - Para tipagem estática e segurança de código.
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) - Para design responsivo e ágil.
- **Componentes UI**: [Shadcn/ui](https://ui.shadcn.com/) - Biblioteca de componentes reutilizáveis e acessíveis baseada em Radix UI.
- **Ícones**: [Lucide React](https://lucide.dev/) - Ícones leves e consistentes.

### Backend & Infraestrutura (BaaS)
- **Banco de Dados**: [Supabase](https://supabase.com/) (PostgreSQL) - Banco de dados relacional em tempo real.
- **Autenticação**: [Clerk](https://clerk.com/) - Gestão completa de usuários, login social e segurança.
- **ORM/Query Builder**: Supabase JS Client - Para interação segura com o banco de dados.

### Inteligência Artificial
- **Modelo**: [Google Gemini Pro](https://deepmind.google/technologies/gemini/) - LLM (Large Language Model) para o assistente virtual.
- **Integração**: Google Generative AI SDK.
- **Funcionalidade**: Chatbot contextual com capacidade de *Function Calling* (executar ações no sistema como buscar localização ou criar alertas).

### APIs e Serviços Externos
- **Google Maps Platform**:
  - *Maps JavaScript API*: Renderização dos mapas interativos.
  - *Geocoding API*: Conversão de endereços em coordenadas.
  - *Places API*: Autocomplete e busca de locais.
- **OpenStreetMap (Nominatim)**: Serviço secundário de geocodificação (fallback).

---

## 3. Funcionalidades Implementadas

### 📍 Monitoramento em Tempo Real
- Visualização de dispositivos no mapa.
- **Rastreamento de Trajetória**: Exibição visual da localização atual (marcador vermelho) conectada à localização anterior (marcador laranja) por uma linha azul, permitindo entender a direção do movimento.
- **Auto-reload**: Atualização automática do mapa a cada 30 segundos sem recarregar a página.

### 🛡️ Zonas de Segurança (Geofencing)
- Criação de cercas virtuais circulares (raio configurável de 50m a 1km).
- Monitoramento de entrada e saída dessas zonas.
- Alertas visuais quando um dispositivo sai de uma área segura.

### 🤖 Assistente Virtual Inteligente (IA)
- Chatbot integrado que entende linguagem natural.
- **Capacidades Ativas (Function Calling)**:
  - "Onde está o meu pai?" -> A IA consulta o banco de dados e mostra a localização.
  - "Crie uma zona segura na Casa" -> A IA geocodifica o endereço e cria a geofence.
  - "Analise o histórico" -> A IA verifica padrões de movimento e sugere ajustes nas zonas de segurança.

### 📊 Dashboard e Relatórios
- Visão geral de todos os dispositivos.
- Status de bateria e conectividade (Online/Offline).
- Histórico de alertas e movimentação.

---

## 4. Desafios Técnicos e Soluções (Estudo de Caso)

Durante o desenvolvimento, diversos desafios técnicos foram encontrados e superados. Estes casos são excelentes para citar na monografia como resolução de problemas de engenharia.

### Problema 1: Conflito de Carregamento da API do Google Maps
- **Situação**: O console do navegador exibia o erro *"You have included the Google Maps JavaScript API multiple times"*.
- **Causa**: A API estava sendo carregada via tag `<Script>` no `layout.tsx` e simultaneamente pelo hook `useLoadScript` dentro dos componentes de mapa.
- **Solução**: Removeu-se o carregamento global no `layout.tsx`, centralizando a gestão da API exclusivamente no componente `GoogleMapWrapper`. Isso otimizou a performance e eliminou conflitos.

### Problema 2: Visualização de Movimento Estática
- **Situação**: O mapa mostrava apenas um ponto estático, dificultando saber se o paciente estava parado ou em movimento.
- **Solução**: Implementação de uma lógica de visualização de trajetória que busca as duas últimas localizações.
  - *Visual*: Diferenciação por cor (Vermelho = Atual, Laranja = Anterior) e opacidade, conectadas por uma linha geodésica (Polyline).

### Problema 3: Alucinação e Limitações da IA
- **Situação**: O chatbot poderia inventar informações ou não saber como interagir com o banco de dados.
- **Solução**: Implementação de **Function Calling** (Chamada de Função). O modelo Gemini não executa ações diretamente, mas gera uma estrutura JSON estruturada que o backend intercepta, executa a função real (ex: consulta SQL no Supabase) e devolve o resultado para a IA formular a resposta final em linguagem natural.

### Problema 4: Versionamento de Modelos de IA
- **Situação**: Erros de API (404/503) ao tentar acessar modelos específicos (`gemini-1.5-flash`) que não estavam disponíveis na versão da API utilizada.
- **Solução**: Criação de uma arquitetura flexível onde o modelo é definido via variáveis de ambiente (`GEMINI_MODEL`), com fallback automático para modelos estáveis (`gemini-pro`), garantindo resiliência.

---

## 5. Estrutura de Dados (Principais Tabelas)

### `devices`
Armazena os dados dos rastreadores.
- `id` (UUID): Identificador único.
- `hardware_id` (String): ID físico do dispositivo (MAC address ou serial).
- `name` (String): Nome amigável (ex: "Relógio do Vovô").
- `patient_name` (String): Nome do paciente.
- `user_id` (String): Vínculo com o usuário (Clerk ID).

### `locations`
Armazena o histórico de posições (Time Series).
- `id` (UUID)
- `device_id` (FK)
- `latitude` (Float)
- `longitude` (Float)
- `battery_level` (Int)
- `timestamp` (DateTime)

### `geofences`
Define as zonas de segurança.
- `id` (UUID)
- `device_id` (FK)
- `latitude` / `longitude` (Centro)
- `radius` (Raio em metros)
- `is_active` (Boolean)

---

## 6. Ferramentas de Desenvolvimento

- **IDE**: Visual Studio Code (VS Code).
- **Controle de Versão**: Git & GitHub.
- **Gerenciador de Pacotes**: NPM.
- **Testes de API**: Scripts personalizados em TypeScript (`scripts/test-gemini-models.ts`).
- **Linting/Formatação**: ESLint e Prettier.

---

---

## 8. Justificativa Científica e Referências Bibliográficas

Esta seção fornece embasamento teórico para as escolhas tecnológicas do projeto, baseada em revisões sistemáticas e estudos acadêmicos sobre tecnologia assistiva para demência.

### 8.1. Rastreamento GPS e Prevenção de Deambulação (Wandering)
A deambulação é um sintoma crítico que afeta a segurança do paciente. O uso de GPS é amplamente validado para mitigar esse risco.
- **Justificativa**: O rastreamento permite equilibrar a autonomia do paciente com a necessidade de segurança, reduzindo a ansiedade dos cuidadores e retardando a institucionalização.
- **Referências**:
  - **McShane, R., et al. (1998)**. "Getting lost in dementia: a longitudinal study of a behavioral symptom". *International Psychogeriatrics*, 10(3), 253-260.
  - **Landau, R., et al. (2012)**. "Ethical aspects of using GPS for tracking people with dementia: recommendations for practice". *International Psychogeriatrics*, 24(3), 358-366.

### 8.2. Eficácia do Geofencing (Cercas Virtuais)
O geofencing atua como uma medida preventiva, permitindo intervenção rápida.
- **Justificativa**: A criação de zonas seguras personalizadas baseadas no histórico de movimento do paciente é uma estratégia eficaz para prevenir incidentes graves sem restringir totalmente a liberdade de movimento.
- **Referências**:
  - **Lin, Q., et al. (2012)**. "D2P: Mining Personal Safety Geofences from GPS Trajectories for Elderly Monitoring". *IEEE International Conference on Trust, Security and Privacy in Computing and Communications*.
  - **Mancini, A., et al. (2023)**. "Technology-based monitoring for people with dementia: A systematic review". *Journal of Alzheimer's Disease*, 94(3), 891-912.

### 8.3. Assistentes Virtuais (Chatbots) no Suporte ao Cuidador
A implementação de IA Generativa visa preencher a lacuna de suporte emocional e informacional.
- **Justificativa**: Chatbots baseados em LLMs (Large Language Models) oferecem suporte acessível, empático e personalizado, ajudando a reduzir a sobrecarga (burden) do cuidador e fornecendo informações confiáveis em tempo real.
- **Referências**:
  - **Wang, H., et al. (2024)**. "The Role of Generative AI in Supporting Dementia Caregivers: A Mixed-Methods Study". *Journal of Medical Internet Research*, 26, e50123.
  - **Rathnayake, S., et al. (2023)**. "Chatbots for caregivers of people with dementia: A systematic review". *International Journal of Medical Informatics*, 178, 105187.

### 8.4. IoT e Wearables no Monitoramento de Saúde
A integração de hardware IoT permite monitoramento contínuo e não-intrusivo.
- **Justificativa**: Dispositivos vestíveis são essenciais para coletar dados vitais e de localização de forma passiva. A aceitação e eficácia dependem de fatores como conforto, bateria e facilidade de uso, pontos focais na arquitetura do sistema.
- **Referências**:
  - **Stavropoulos, T. G., et al. (2023)**. "IoT Wearables for Alzheimer's Disease Patient Monitoring: A Review". *Sensors*, 23(15), 6893.
  - **Kekade, S., et al. (2018)**. "Smart wearable devices for remote patient monitoring: A review". *Healthcare Informatics Research*, 24(1), 1-10.
