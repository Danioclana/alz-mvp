import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/webhooks/clerk
 *
 * Webhook para sincronizar usuários do Clerk com Supabase
 *
 * Eventos:
 * - user.created: Cria usuário no Supabase
 * - user.updated: Atualiza usuário no Supabase
 * - user.deleted: Remove usuário do Supabase
 */
export async function POST(request: NextRequest) {
  // Obter headers do webhook
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // Se não houver headers, retornar erro
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Obter body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Criar instância do webhook do Svix
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: any;

  // Verificar webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Obter dados do evento
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook received: ${eventType}`, { id });

  // Conectar ao Supabase com service role
  const supabase = await createClient({ useServiceRole: true });

  try {
    // Processar evento
    switch (eventType) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;

        await supabase.from('users').insert({
          clerk_id: id,
          email: email_addresses[0].email_address,
          first_name: first_name || null,
          last_name: last_name || null,
          image_url: image_url || null,
        });

        console.log('User created in database:', id);
        break;
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;

        await supabase
          .from('users')
          .update({
            email: email_addresses[0].email_address,
            first_name: first_name || null,
            last_name: last_name || null,
            image_url: image_url || null,
          })
          .eq('clerk_id', id);

        console.log('User updated in database:', id);
        break;
      }

      case 'user.deleted': {
        const { id } = evt.data;

        await supabase.from('users').delete().eq('clerk_id', id);

        console.log('User deleted from database:', id);
        break;
      }

      default:
        console.log('Unhandled webhook event:', eventType);
    }

    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
