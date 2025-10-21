import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // En modo skip, usar valores dummy si no están configurados
  const skipMode = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
    (skipMode ? 'https://dummy.supabase.co' : '');
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    (skipMode ? 'dummy-key-for-skip-mode' : '');

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials not configured. Skip mode should be enabled.');
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  )
}
