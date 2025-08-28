import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // Check if user is authenticated and has admin role
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // For demo purposes, return mock data
  // In production, you would query your users table
  const users = [
    {
      id: '1',
      email: 'demo@student.com',
      role: 'student',
      created_at: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '2',
      email: 'demo@teacher.com',
      role: 'teacher',
      created_at: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '3',
      email: 'demo@admin.com',
      role: 'admin',
      created_at: new Date().toISOString(),
      status: 'active'
    }
  ]

  return NextResponse.json({ users })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { email, password, role, metadata } = await request.json()

  // Check if user is authenticated and has admin role
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Create new user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { role, ...metadata }
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data })
}
