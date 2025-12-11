import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { processChat } from '@/lib/services/gemini';
import { z } from 'zod';

const ChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1),
      timestamp: z.string(),
    })
  ).min(1),
});

/**
 * POST /api/chat
 * Chat com IA (Gemini)
 *
 * Body:
 * {
 *   messages: [
 *     { role: 'user' | 'assistant', content: string, timestamp: string }
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Autenticação
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validar body
    const body = await request.json();
    const validation = ChatRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { messages } = validation.data;

    // Processar chat com function calling
    const response = await processChat(messages, userId);

    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in POST /api/chat:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
