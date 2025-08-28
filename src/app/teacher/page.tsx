import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TeacherDashboard from '@/components/teacher/TeacherDashboard_main'

export default async function TeacherPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <TeacherDashboard user={user} />
}
