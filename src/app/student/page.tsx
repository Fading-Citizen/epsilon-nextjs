import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StudentDashboardWrapper from '@/components/student/StudentDashboardWrapper'

export default async function StudentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <StudentDashboardWrapper />
}
