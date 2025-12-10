import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_KNOWLEDGE } from '@/lib/ai/knowledge-base';
import { getFunctionDeclarations } from '@/lib/ai/functions';
import { executeFunction } from '@/lib/ai/function-executor';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-pro';

const SYSTEM_PROMPT = `Você é o assistente virtual do Alzheimer Care, um sistema inteligente de rastreamento 
para pessoas com Doença de Alzheimer. Seu papel é ajudar cuidadores e familiares a usar o sistema 
e fornecer suporte emocional.

CONHECIMENTO DO SISTEMA:

${SYSTEM_KNOWLEDGE.about}

COMO O SISTEMA FUNCIONA:
${SYSTEM_KNOWLEDGE.howItWorks}

ZONAS SEGURAS:
${SYSTEM_KNOWLEDGE.geofences}

SISTEMA DE ALERTAS:
${SYSTEM_KNOWLEDGE.alerts}

DISPOSITIVO:
${SYSTEM_KNOWLEDGE.device}

PRIVACIDADE E SEGURANÇA:
${SYSTEM_KNOWLEDGE.privacy}

TROUBLESHOOTING:
${SYSTEM_KNOWLEDGE.troubleshooting}

DICAS PARA CUIDADORES:
${SYSTEM_KNOWLEDGE.caregiverTips}

ESTILO DE COMUNICAÇÃO:
- Seja empático, acolhedor e paciente
- Use linguagem simples e clara (evite jargões técnicos)
- Seja proativo em oferecer ajuda adicional
- Demonstre compreensão das dificuldades dos cuidadores
- Forneça exemplos práticos quando possível
- Se não souber algo, seja honesto e sugira alternativas

CAPACIDADES (FUNÇÕES DISPONÍVEIS):
Você pode executar as seguintes ações no sistema:
- getCurrentLocation: Consultar localização atual de um dispositivo
- getDeviceStatus: Ver status completo (bateria, online/offline)
- listGeofences: Listar zonas seguras configuradas
- createGeofence: Criar nova zona segura
- getAlertHistory: Ver histórico de alertas
- getLocationHistory: Ver histórico de movimentação
- listDevices: Listar todos os dispositivos do usuário
- geocodeAddress: Converter endereço em coordenadas
- analyzeGeofenceSuggestions: Analisar histórico e sugerir melhorias nas zonas seguras
- registerDevice: Cadastrar novo dispositivo
- updateAlertConfig: Configurar alertas (emails, telefones, frequência)
- updatePatientInfo: Atualizar nome do paciente ou dispositivo

IMPORTANTE SOBRE FUNÇÕES:
- Quando o usuário perguntar "onde está", use getCurrentLocation
- Quando pedir para criar zona segura, primeiro use geocodeAddress se ele der um endereço, depois createGeofence
- Sempre confirme com o usuário antes de criar uma zona
- Se o usuário tiver múltiplos dispositivos, use listDevices primeiro para escolher qual usar

Quando o usuário pedir ajuda para criar uma zona segura, explique o processo passo a passo.
Quando perguntar sobre alertas, explique como funcionam e como configurar.
Se houver um problema, use o guia de troubleshooting para ajudar.

Lembre-se: você está ajudando pessoas em uma situação delicada. Seja sempre gentil e compreensivo.`;

export async function chatWithGemini(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'model'; text: string }> = []
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Construir histórico da conversa
    const history = conversationHistory.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    // Iniciar chat com histórico
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'Entendido. Estou aqui para ajudar. Como posso auxiliá-lo?' }],
        },
        ...history,
      ],
    });

    // Enviar mensagem do usuário
    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate response from AI');
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

/**
 * Processa chat com suporte a function calling
 */
export async function processChat(
  messages: ChatMessage[],
  userId: string
): Promise<string> {
  try {
    // Converter formato de mensagens para o formato do Gemini
    const history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = messages
      .slice(0, -1)
      .map((msg) => ({
        role: (msg.role === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: [{ text: msg.content }],
      }));

    // Última mensagem é a pergunta atual
    const currentMessage = messages[messages.length - 1];

    if (currentMessage.role !== 'user') {
      throw new Error('Last message must be from user');
    }

    // Configurar modelo com function calling
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      tools: [
        {
          functionDeclarations: getFunctionDeclarations() as any,
        },
      ],
    });

    // Iniciar chat
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'Entendido. Estou aqui para ajudar com todas as funcionalidades do sistema.' }],
        },
        ...history,
      ],
    });

    // Enviar mensagem
    let result = await chat.sendMessage(currentMessage.content);
    let response = result.response;

    // Verificar se há function calls
    const functionCalls = response.functionCalls();

    if (functionCalls && functionCalls.length > 0) {
      // Executar todas as funções chamadas
      const functionResponses = await Promise.all(
        functionCalls.map(async (call) => {
          console.log(`Executing function: ${call.name}`, call.args);
          const result = await executeFunction(call.name, call.args, userId);
          return {
            functionResponse: {
              name: call.name,
              response: result,
            },
          };
        })
      );

      // Enviar resultados de volta para o Gemini
      result = await chat.sendMessage(functionResponses);
      response = result.response;
    }

    return response.text();
  } catch (error) {
    console.error('Error in processChat:', error);
    throw new Error('Failed to process chat');
  }
}

/**
 * Versão sem function calling (fallback)
 */
export async function processChatSimple(
  messages: ChatMessage[]
): Promise<string> {
  const history: Array<{ role: 'user' | 'model'; text: string }> = messages
    .slice(0, -1)
    .map((msg) => ({
      role: (msg.role === 'user' ? 'user' : 'model') as 'user' | 'model',
      text: msg.content,
    }));

  const currentMessage = messages[messages.length - 1];

  if (currentMessage.role !== 'user') {
    throw new Error('Last message must be from user');
  }

  return await chatWithGemini(currentMessage.content, history);
}
