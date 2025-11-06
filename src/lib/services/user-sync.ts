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
      console.error('[ensureUserExists] No Clerk user found');
      return null;
    }

    console.log('[ensureUserExists] Clerk user ID:', clerkUser.id);

    const supabase = await createClient({ useServiceRole: true });

    // Tentar buscar usuário existente
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUser.id)
      .single();

    console.log('[ensureUserExists] Fetch result:', { existingUser, fetchError });

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user from Supabase:', fetchError);
      return null;
    }

    // Se usuário já existe, retornar ID
    if (existingUser) {
      console.log('[ensureUserExists] User already exists, ID:', existingUser.id);
      return existingUser.id;
    }

    // Se não existe, criar novo usuário
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      console.error('[ensureUserExists] User has no email address');
      return null;
    }

    console.log('[ensureUserExists] Creating new user with email:', email);

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
      console.error('[ensureUserExists] Error creating user:', error);
      return null;
    }

    console.log('[ensureUserExists] ✅ User created successfully, ID:', newUser.id);
    return newUser.id;
  } catch (error) {
    console.error('Unexpected error in ensureUserExists:', error);
    return null;
  }
}
