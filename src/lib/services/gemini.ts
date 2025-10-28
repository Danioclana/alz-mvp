import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `Você é um assistente especializado em ajudar familiares e cuidadores de pessoas com Alzheimer.
Seu objetivo é fornecer informações úteis, conselhos práticos e suporte emocional.

Você tem conhecimento sobre:
- Cuidados com pessoas com Alzheimer
- Como lidar com situações de desorientação
- Dicas de segurança e monitoramento
- Apoio emocional para familiares
- Recursos e estratégias de cuidado

Seja sempre empático, claro e objetivo em suas respostas. Use uma linguagem acessível.`;

export async function chatWithGemini(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'model'; text: string }> = []
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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

export async function processChat(
  messages: ChatMessage[]
): Promise<string> {
  // Converter formato de mensagens para o formato do Gemini
  const history: Array<{ role: 'user' | 'model'; text: string }> = messages
    .slice(0, -1)
    .map((msg) => ({
      role: (msg.role === 'user' ? 'user' : 'model') as 'user' | 'model',
      text: msg.content,
    }));

  // Última mensagem é a pergunta atual
  const currentMessage = messages[messages.length - 1];

  if (currentMessage.role !== 'user') {
    throw new Error('Last message must be from user');
  }

  return await chatWithGemini(currentMessage.content, history);
}
