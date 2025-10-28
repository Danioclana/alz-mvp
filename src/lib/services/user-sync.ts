import { createClient } from '@/lib/supabase/server';
import { currentUser } from '@clerk/nextjs/server';

/**
 * Busca ou cria um usuário no Supabase baseado no Clerk ID
 * Isso garante que o usuário existe no Supabase mesmo sem webhook configurado
 */
export async function ensureUserExists(): Promise<number | null> {
  try {
    // Buscar dados do usuário do Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return null;
    }

    const supabase = await createClient({ useServiceRole: true });

    // Tentar buscar usuário existente
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUser.id)
      .single();

    // Se usuário já existe, retornar ID
    if (existingUser) {
      return existingUser.id;
    }

    // Se não existe, criar novo usuário
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      console.error('User has no email address');
      return null;
    }

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        clerk_id: clerkUser.id,
        email: email,
        first_name: clerkUser.firstName || null,
        last_name: clerkUser.lastName || null,
        image_url: clerkUser.imageUrl || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating user in Supabase:', error);
      return null;
    }

    console.log('✅ User created automatically in Supabase:', clerkUser.id);
    return newUser.id;
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    return null;
  }
}
