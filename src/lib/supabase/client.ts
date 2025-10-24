import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Check if skip mode is enabled OR if credentials are missing (fallback to skip mode)
  const skipMode = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true' || 
                   !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                   !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Use dummy values if in skip mode or credentials are missing
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key-for-skip-mode';

  if (skipMode) {
    console.warn('⚠️ Supabase credentials not configured. Skip mode enabled.');
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  )
}
