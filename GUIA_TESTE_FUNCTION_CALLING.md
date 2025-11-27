# Guia Rápido - Testando Function Calling

Este guia mostra como testar rapidamente as funcionalidades de function calling do assistente IA.

---

## 🚀 Como Testar

### Pré-requisitos
1. ✅ Sistema rodando (`npm run dev`)
2. ✅ Usuário autenticado
3. ✅ Pelo menos 1 dispositivo cadastrado

---

## 📱 Testes Rápidos

### 1. Consultar Localização

**Perguntas para testar**:
```
"Onde está o dispositivo agora?"
"Qual a localização atual?"
"Onde está minha mãe?"
"Me mostra onde ela está"
```

**O que deve acontecer**:
- ✅ Assistente executa `getCurrentLocation()`
- ✅ Retorna endereço aproximado
- ✅ Mostra bateria e última atualização
- ✅ Inclui link para Google Maps

**Exemplo de resposta**:
```
Sua mãe está atualmente em Rua das Flores, 123 - São Paulo, SP.

📍 Localização: -23.550520, -46.633308
🔋 Bateria: 87%
⏰ Última atualização: 2 minutos atrás
✅ Dentro da zona segura "Casa"

Ver no mapa: https://www.google.com/maps?q=-23.550520,-46.633308
```

---

### 2. Verificar Status do Dispositivo

**Perguntas para testar**:
```
"Como está a bateria?"
"Qual o status do dispositivo?"
"O dispositivo está online?"
"Me mostra informações do rastreador"
```

**O que deve acontecer**:
- ✅ Assistente executa `getDeviceStatus()`
- ✅ Retorna bateria, status online/offline
- ✅ Mostra última comunicação

**Exemplo de resposta**:
```
Status do dispositivo "Rastreador da Mãe":

🔋 Bateria: 87% (boa)
🟢 Status: Online
⏰ Última comunicação: 3 minutos atrás
📅 Cadastrado em: 15/10/2025

Tudo funcionando normalmente! 👍
```

---

### 3. Listar Zonas Seguras

**Perguntas para testar**:
```
"Quais zonas seguras eu tenho?"
"Lista minhas geofences"
"Quais áreas estão configuradas?"
"Me mostra as zonas"
```

**O que deve acontecer**:
- ✅ Assistente executa `listGeofences()`
- ✅ Lista todas as zonas ativas
- ✅ Mostra nome, raio e localização

**Exemplo de resposta**:
```
Você tem 3 zonas seguras configuradas:

1. 🏠 Casa
   📏 Raio: 100 metros
   📍 Rua das Flores, 123

2. 🌳 Parque Ibirapuera
   📏 Raio: 200 metros
   📍 Av. Pedro Álvares Cabral

3. 🏪 Mercado
   📏 Raio: 150 metros
   📍 Rua do Comércio, 456
```

---

### 4. Criar Zona Segura (Fluxo Completo)

**Conversa para testar**:
```
Você: "Preciso criar uma zona segura"

Assistente: "Claro! Qual é o endereço do local?"

Você: "Rua das Palmeiras 456, São Paulo"

Assistente: [executa geocodeAddress()]
"Encontrei o endereço: Rua das Palmeiras, 456 - Jardim Paulista, São Paulo - SP
Qual raio você gostaria para esta zona? (Recomendo 50-100 metros para residências)"

Você: "100 metros"

Assistente: [executa createGeofence()]
"✅ Zona segura criada com sucesso!

📍 Nome: Rua das Palmeiras
📏 Raio: 100 metros
📅 Criada em: 26/11/2025

Agora você receberá alertas por email caso sua mãe saia desta área."
```

---

### 5. Ver Histórico de Alertas

**Perguntas para testar**:
```
"Quais alertas recebi?"
"Me mostra os alertas recentes"
"Histórico de alertas dos últimos 7 dias"
"Teve algum alerta hoje?"
```

**O que deve acontecer**:
- ✅ Assistente executa `getAlertHistory()`
- ✅ Lista alertas com tipo, data e mensagem

**Exemplo de resposta**:
```
Histórico de alertas dos últimos 7 dias:

**3 alertas encontrados:**

1. 🚨 Saída de Zona Segura
   📅 25/11/2025 às 14:30
   📍 Saiu da zona "Casa"

2. 🔋 Bateria Baixa
   📅 24/11/2025 às 09:15
   ⚠️ Bateria em 18%

3. 🚨 Saída de Zona Segura
   📅 23/11/2025 às 16:45
   📍 Saiu da zona "Parque"
```

---

### 6. Ver Histórico de Movimentação

**Perguntas para testar**:
```
"Onde ela esteve hoje?"
"Me mostra o histórico de movimento"
"Trajeto das últimas 24 horas"
"Por onde ela passou?"
```

**O que deve acontecer**:
- ✅ Assistente executa `getLocationHistory()`
- ✅ Resume movimentação do dia
- ✅ Agrupa por locais

**Exemplo de resposta**:
```
Histórico de movimentação das últimas 24 horas:

**15 localizações registradas**

**Resumo do dia:**
- 🏠 Casa: 08:00 - 14:00 (6 horas)
- 🚶 Em movimento: 14:00 - 14:30
- 🌳 Parque Ibirapuera: 14:30 - 16:00 (1h30)
- 🚶 Em movimento: 16:00 - 16:20
- 🏠 Casa: 16:20 - agora

Tudo dentro da rotina normal! ✅
```

---

### 7. Listar Dispositivos

**Perguntas para testar**:
```
"Quantos dispositivos eu tenho?"
"Lista meus dispositivos"
"Quais rastreadores estão cadastrados?"
"Me mostra os dispositivos"
```

**O que deve acontecer**:
- ✅ Assistente executa `listDevices()`
- ✅ Lista todos os dispositivos do usuário

**Exemplo de resposta**:
```
Você tem 2 dispositivos cadastrados:

1. 📱 Rastreador da Mãe
   🆔 ID: ESP32-001
   📅 Cadastrado: 15/10/2025
   🟢 Online

2. 📱 Rastreador do Pai
   🆔 ID: ESP32-002
   📅 Cadastrado: 20/10/2025
   🔴 Offline (última vez: 2 horas atrás)
```

---

### 8. Geocoding de Endereço

**Perguntas para testar**:
```
"Qual a coordenada da Av. Paulista 1000?"
"Me dá a latitude e longitude de Rua X, 123"
"Converte esse endereço em coordenadas: [endereço]"
```

**O que deve acontecer**:
- ✅ Assistente executa `geocodeAddress()`
- ✅ Retorna coordenadas do endereço

**Exemplo de resposta**:
```
Endereço encontrado:

📍 Avenida Paulista, 1000 - Bela Vista, São Paulo - SP

Coordenadas:
Latitude: -23.561414
Longitude: -46.656147

Você gostaria de criar uma zona segura neste local?
```

---

## 🧪 Testes de Edge Cases

### Múltiplos Dispositivos

**Teste**:
```
Você: "Onde está o dispositivo?"

Assistente: [executa listDevices() primeiro]
"Você tem 2 dispositivos. Qual você gostaria de verificar?
1. Rastreador da Mãe
2. Rastreador do Pai"

Você: "O da mãe"

Assistente: [executa getCurrentLocation()]
"Sua mãe está em..."
```

---

### Endereço Não Encontrado

**Teste**:
```
Você: "Cria zona em XYZ123ABC"

Assistente: [executa geocodeAddress()]
"Desculpe, não consegui encontrar esse endereço. 
Você pode tentar:
- Fornecer o endereço completo (rua, número, cidade)
- Usar o editor visual no aplicativo
- Me dar outro endereço"
```

---

### Sem Dados Disponíveis

**Teste**:
```
Você: "Quais alertas recebi?"

Assistente: [executa getAlertHistory()]
"Você não tem alertas registrados nos últimos 7 dias. 
Isso é ótimo! Significa que tudo está dentro do normal. ✅"
```

---

## 🐛 Troubleshooting

### Assistente não executa função

**Possíveis causas**:
1. Pergunta muito ambígua
2. Gemini não identificou a intenção
3. Erro na API

**Solução**:
- Seja mais específico na pergunta
- Use palavras-chave ("localização", "criar zona", "alertas")
- Verifique console do navegador para erros

---

### Erro de permissão

**Sintoma**: "Dispositivo não encontrado"

**Causa**: Tentando acessar dispositivo de outro usuário

**Solução**: Verificar se está logado com usuário correto

---

### Resposta muito lenta (> 5s)

**Causa**: Gemini API + execução de função

**Normal**: 3-4 segundos é esperado

**Anormal**: > 6 segundos pode indicar problema

---

## 📊 Checklist de Testes

### Testes Básicos
- [ ] Consultar localização
- [ ] Verificar status
- [ ] Listar zonas
- [ ] Listar dispositivos

### Testes Avançados
- [ ] Criar zona via chat (fluxo completo)
- [ ] Ver histórico de alertas
- [ ] Ver histórico de movimento
- [ ] Geocoding de endereço

### Testes de Edge Cases
- [ ] Múltiplos dispositivos
- [ ] Endereço não encontrado
- [ ] Sem dados disponíveis
- [ ] Perguntas ambíguas

### Testes de UX
- [ ] Respostas são claras?
- [ ] Tempo de resposta aceitável?
- [ ] Assistente é empático?
- [ ] Erros são bem tratados?

---

## 🎯 Critérios de Sucesso

### Function Calling está funcionando se:
- ✅ Assistente identifica intenção corretamente
- ✅ Função é executada com parâmetros corretos
- ✅ Dados reais são retornados
- ✅ Resposta é formatada de forma humanizada
- ✅ Tempo de resposta < 5 segundos
- ✅ Erros são tratados graciosamente

---

## 📝 Registro de Testes

Use esta tabela para registrar seus testes:

| Função | Pergunta | Executou? | Resposta OK? | Tempo | Observações |
|--------|----------|-----------|--------------|-------|-------------|
| getCurrentLocation | "Onde está?" | ✅ | ✅ | 3.2s | Perfeito |
| getDeviceStatus | "Bateria?" | ✅ | ✅ | 2.8s | OK |
| listGeofences | "Zonas?" | ✅ | ✅ | 3.1s | OK |
| createGeofence | "Cria zona" | ✅ | ✅ | 4.5s | Fluxo completo OK |
| ... | ... | ... | ... | ... | ... |

---

**Última Atualização**: 26 de Novembro de 2025
