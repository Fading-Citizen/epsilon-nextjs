import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard_main'
import { User } from '@supabase/supabase-js'

export default async function AdminPage() {
  // En modo skip, usar usuario mock
  const skipMode = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
  
  let user: User | null = null;
  
  if (!skipMode) {
    const supabase = await createClient()
    const { data: { user: dbUser } } = await supabase.auth.getUser()

    if (!dbUser) {
      redirect('/login')
    }
    user = dbUser;
  } else {
    console.log('🚀 Skip Mode: Admin page - usando usuario mock');
    // Usuario mock para modo skip
    user = {
      id: 'skip-admin-mock',
      email: 'admin@skip.local',
      user_metadata: {
        name: 'Admin Demo'
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    } as User;
  }

  return <AdminDashboard user={user} />
}
