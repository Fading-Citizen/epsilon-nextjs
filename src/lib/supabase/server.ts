import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  // En modo skip, usar valores dummy
  const skipMode = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
    (skipMode ? 'https://dummy.supabase.co' : '');
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    (skipMode ? 'dummy-key-for-skip-mode-server' : '');

  if (!supabaseUrl || !supabaseKey) {
    if (skipMode) {
      console.log('🚀 Skip Mode: Server client usando valores dummy');
    } else {
      throw new Error('Supabase URL and Key are required when not in skip mode');
    }
  }

  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
