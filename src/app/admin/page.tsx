import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard_main'

export default async function AdminPage() {
  // En modo skip, usar usuario mock
  const skipMode = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
  
  let user = null;
  
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
      }
    } as any;
  }

  return <AdminDashboard user={user} />
}
