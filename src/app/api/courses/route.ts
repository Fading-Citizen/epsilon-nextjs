import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // For demo purposes, return mock data
  // In production, you would query your courses table
  const courses = [
    {
      id: '1',
      title: 'Matemáticas Avanzadas',
      description: 'Curso completo de álgebra lineal y cálculo diferencial',
      instructor_id: '2',
      instructor_name: 'Prof. García',
      students_count: 45,
      created_at: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '2',
      title: 'Programación en Python',
      description: 'Fundamentos de programación y estructuras de datos',
      instructor_id: '2',
      instructor_name: 'Prof. López',
      students_count: 38,
      created_at: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '3',
      title: 'Historia Universal',
      description: 'De la antigüedad al mundo moderno',
      instructor_id: '2',
      instructor_name: 'Prof. Martínez',
      students_count: 52,
      created_at: new Date().toISOString(),
      status: 'active'
    }
  ]

  return NextResponse.json({ courses })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { title, description, instructor_id } = await request.json()

  // Check if user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // For demo purposes, return mock data
  // In production, you would insert into your courses table
  const newCourse = {
    id: Date.now().toString(),
    title,
    description,
    instructor_id,
    students_count: 0,
    created_at: new Date().toISOString(),
    status: 'active'
  }

  return NextResponse.json({ course: newCourse })
}
