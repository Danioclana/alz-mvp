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

    // Tentar buscar usuário existente com retry
    let fetchAttempt = 0;
    let existingUser = null;
    let fetchError = null;

    while (fetchAttempt < 3) {
      try {
        const result = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', clerkUser.id)
          .single();

        existingUser = result.data;
        fetchError = result.error;
        break; // Success, exit retry loop
      } catch (err: unknown) {
        fetchAttempt++;
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`[ensureUserExists] Fetch attempt ${fetchAttempt} failed:`, errorMessage);

        if (fetchAttempt < 3) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 100 * fetchAttempt));
        } else {
          fetchError = err;
        }
      }
    }

    interface SupabaseError {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
      stack?: string;
    }

    console.log('[ensureUserExists] Fetch result:', {
      existingUser,
      fetchError: fetchError ? {
        message: (fetchError as SupabaseError).message || String(fetchError),
        details: (fetchError as SupabaseError).details || (fetchError as SupabaseError).stack || String(fetchError),
        hint: (fetchError as SupabaseError).hint || '',
        code: (fetchError as SupabaseError).code || ''
      } : null
    });

    if (fetchError && (fetchError as SupabaseError).code !== 'PGRST116') {
      const errorDetails = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
      console.error('Error fetching user from Supabase:', {
        message: errorDetails.message,
        details: (fetchError as SupabaseError).details || errorDetails.stack || String(fetchError),
        hint: (fetchError as SupabaseError).hint || '',
        code: (fetchError as SupabaseError).code || ''
      });
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
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Unexpected error in ensureUserExists:', {
      message: err.message,
      stack: err.stack,
      details: String(error)
    });
    return null;
  }
}
