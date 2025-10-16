import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/evaluations/results
 * Guarda el resultado de una evaluación (quiz, examen, práctica)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validar datos requeridos
    const requiredFields = [
      'evaluation_id',
      'evaluation_type',
      'evaluation_name',
      'servicio',
      'total_preguntas',
      'respuestas_correctas',
      'respuestas_incorrectas',
      'respuestas_vacias',
      'puntaje_obtenido',
      'puntaje_total',
      'porcentaje',
      'tiempo_inicio',
      'tiempo_fin',
      'preguntas_detalle'
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `Campo requerido faltante: ${field}` },
          { status: 400 }
        );
      }
    }

    // Preparar datos para inserción
    const evaluationResult = {
      student_id: user.id,
      evaluation_id: body.evaluation_id,
      course_id: body.course_id || null,
      group_id: body.group_id || null,
      evaluation_type: body.evaluation_type,
      evaluation_name: body.evaluation_name,
      servicio: body.servicio,
      institucion: body.institucion || null,
      total_preguntas: body.total_preguntas,
      respuestas_correctas: body.respuestas_correctas,
      respuestas_incorrectas: body.respuestas_incorrectas,
      respuestas_vacias: body.respuestas_vacias,
      puntaje_obtenido: body.puntaje_obtenido,
      puntaje_total: body.puntaje_total,
      porcentaje: body.porcentaje,
      tiempo_inicio: body.tiempo_inicio,
      tiempo_fin: body.tiempo_fin,
      preguntas_detalle: body.preguntas_detalle,
      analisis_por_materia: body.analisis_por_materia || {},
      analisis_por_dificultad: body.analisis_por_dificultad || {},
      intentos: body.intentos || 1
    };

    // Insertar en la base de datos
    const { data, error } = await supabase
      .from('evaluation_results')
      .insert([evaluationResult])
      .select()
      .single();

    if (error) {
      console.error('Error al guardar resultado:', error);
      return NextResponse.json(
        { error: 'Error al guardar el resultado de la evaluación', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Resultado guardado exitosamente',
      data
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error en POST /api/evaluations/results:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/evaluations/results
 * Obtiene resultados de evaluaciones con filtros opcionales
 * Query params:
 * - student_id: ID del estudiante (opcional, admins pueden ver todos)
 * - group_id: Filtrar por grupo
 * - servicio: Filtrar por servicio
 * - institucion: Filtrar por institución
 * - evaluation_type: Filtrar por tipo de evaluación
 * - fecha_inicio: Fecha de inicio para filtro de rango
 * - fecha_fin: Fecha de fin para filtro de rango
 * - limit: Número máximo de resultados (default: 50)
 * - offset: Paginación
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const groupId = searchParams.get('group_id');
    const servicio = searchParams.get('servicio');
    const institucion = searchParams.get('institucion');
    const evaluationType = searchParams.get('evaluation_type');
    const fechaInicio = searchParams.get('fecha_inicio');
    const fechaFin = searchParams.get('fecha_fin');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Verificar si es admin (para poder ver todos los resultados)
    const { data: profile } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.rol === 'admin' || profile?.rol === 'teacher';

    // Construir query
    let query = supabase
      .from('evaluation_results')
      .select('*', { count: 'exact' });

    // Si no es admin, solo puede ver sus propios resultados
    if (!isAdmin) {
      query = query.eq('student_id', user.id);
    } else if (studentId) {
      // Si es admin y especifica student_id, filtrar por ese estudiante
      query = query.eq('student_id', studentId);
    }

    // Aplicar filtros
    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    if (servicio) {
      query = query.eq('servicio', servicio);
    }

    if (institucion) {
      query = query.eq('institucion', institucion);
    }

    if (evaluationType) {
      query = query.eq('evaluation_type', evaluationType);
    }

    if (fechaInicio) {
      query = query.gte('created_at', fechaInicio);
    }

    if (fechaFin) {
      query = query.lte('created_at', fechaFin);
    }

    // Ordenar por fecha descendente
    query = query.order('created_at', { ascending: false });

    // Aplicar paginación
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error al obtener resultados:', error);
      return NextResponse.json(
        { error: 'Error al obtener los resultados', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false
      }
    });

  } catch (error: any) {
    console.error('Error en GET /api/evaluations/results:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
