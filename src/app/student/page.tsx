import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StudentDashboardWrapper from '@/components/student/StudentDashboardWrapper'

export default async function StudentPage() {
  // En modo skip, no verificar usuario
  const skipMode = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
  
  if (!skipMode) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }
  } else {
    console.log('🚀 Skip Mode: Student page - verificación de usuario omitida');
  }

  return <StudentDashboardWrapper />
}
