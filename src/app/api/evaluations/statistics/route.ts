import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

interface EvaluationResult {
  student_id: string;
  total_preguntas: number;
  respuestas_correctas: number;
  respuestas_incorrectas: number;
  respuestas_vacias: number;
  porcentaje: number;
  aprobado: boolean;
  tiempo_inicio: string;
  tiempo_fin: string;
  servicio: string;
  institucion?: string;
}

/**
 * GET /api/evaluations/statistics
 * Obtiene estadísticas agregadas de evaluaciones
 * Query params:
 * - dimension: 'student' | 'group' | 'institution' | 'service' | 'course' | 'global'
 * - dimension_id: ID de la entidad (requerido excepto para 'global')
 * - fecha_inicio: Fecha de inicio para filtro de rango
 * - fecha_fin: Fecha de fin para filtro de rango
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

    // Obtener parámetros
    const { searchParams } = new URL(request.url);
    const dimension = searchParams.get('dimension') || 'global';
    const dimensionId = searchParams.get('dimension_id');
    const fechaInicio = searchParams.get('fecha_inicio');
    const fechaFin = searchParams.get('fecha_fin');

    // Verificar si es admin
    const { data: profile } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.rol === 'admin' || profile?.rol === 'teacher';

    let statistics;

    switch (dimension) {
      case 'student':
        if (!dimensionId && !isAdmin) {
          // Si no es admin, solo puede ver sus propias estadísticas
          statistics = await getStudentStatistics(supabase, user.id, fechaInicio, fechaFin);
        } else if (dimensionId && isAdmin) {
          statistics = await getStudentStatistics(supabase, dimensionId, fechaInicio, fechaFin);
        } else {
          return NextResponse.json(
            { error: 'No autorizado' },
            { status: 403 }
          );
        }
        break;

      case 'group':
        if (!isAdmin) {
          return NextResponse.json(
            { error: 'Solo administradores pueden ver estadísticas de grupos' },
            { status: 403 }
          );
        }
        if (!dimensionId) {
          return NextResponse.json(
            { error: 'dimension_id requerido para estadísticas de grupo' },
            { status: 400 }
          );
        }
        statistics = await getGroupStatistics(supabase, dimensionId, fechaInicio, fechaFin);
        break;

      case 'institution':
        if (!isAdmin) {
          return NextResponse.json(
            { error: 'Solo administradores pueden ver estadísticas institucionales' },
            { status: 403 }
          );
        }
        if (!dimensionId) {
          return NextResponse.json(
            { error: 'dimension_id requerido para estadísticas institucionales' },
            { status: 400 }
          );
        }
        statistics = await getInstitutionStatistics(supabase, dimensionId, fechaInicio, fechaFin);
        break;

      case 'service':
        if (!isAdmin) {
          return NextResponse.json(
            { error: 'Solo administradores pueden ver estadísticas por servicio' },
            { status: 403 }
          );
        }
        if (!dimensionId) {
          return NextResponse.json(
            { error: 'dimension_id requerido para estadísticas por servicio' },
            { status: 400 }
          );
        }
        statistics = await getServiceStatistics(supabase, dimensionId, fechaInicio, fechaFin);
        break;

      case 'course':
        if (!isAdmin) {
          return NextResponse.json(
            { error: 'Solo administradores pueden ver estadísticas por curso' },
            { status: 403 }
          );
        }
        if (!dimensionId) {
          return NextResponse.json(
            { error: 'dimension_id requerido para estadísticas por curso' },
            { status: 400 }
          );
        }
        statistics = await getCourseStatistics(supabase, dimensionId, fechaInicio, fechaFin);
        break;

      case 'global':
        if (!isAdmin) {
          return NextResponse.json(
            { error: 'Solo administradores pueden ver estadísticas globales' },
            { status: 403 }
          );
        }
        statistics = await getGlobalStatistics(supabase, fechaInicio, fechaFin);
        break;

      default:
        return NextResponse.json(
          { error: 'Dimensión no válida' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      dimension,
      dimension_id: dimensionId,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      statistics
    });

  } catch (error) {
    console.error('Error en GET /api/evaluations/statistics:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Funciones auxiliares para obtener estadísticas

async function getStudentStatistics(
  supabase: SupabaseClient,
  studentId: string,
  fechaInicio?: string | null,
  fechaFin?: string | null
) {
  let query = supabase
    .from('evaluation_results')
    .select('*')
    .eq('student_id', studentId);

  if (fechaInicio) query = query.gte('created_at', fechaInicio);
  if (fechaFin) query = query.lte('created_at', fechaFin);

  const { data, error } = await query;

  if (error) throw error;

  return calculateStatistics(data);
}

async function getGroupStatistics(
  supabase: SupabaseClient,
  groupId: string,
  fechaInicio?: string | null,
  fechaFin?: string | null
) {
  let query = supabase
    .from('evaluation_results')
    .select('*')
    .eq('group_id', groupId);

  if (fechaInicio) query = query.gte('created_at', fechaInicio);
  if (fechaFin) query = query.lte('created_at', fechaFin);

  const { data, error } = await query;

  if (error) throw error;

  const stats = calculateStatistics(data as EvaluationResult[]);
  
  // Agregar estudiantes únicos
  const uniqueStudents = new Set((data as EvaluationResult[]).map((r) => r.student_id));
  (stats as Record<string, unknown>).total_estudiantes = uniqueStudents.size;

  return stats;
}

async function getInstitutionStatistics(
  supabase: SupabaseClient,
  institucion: string,
  fechaInicio?: string | null,
  fechaFin?: string | null
) {
  let query = supabase
    .from('evaluation_results')
    .select('*')
    .eq('institucion', institucion);

  if (fechaInicio) query = query.gte('created_at', fechaInicio);
  if (fechaFin) query = query.lte('created_at', fechaFin);

  const { data, error } = await query;

  if (error) throw error;

  const stats = calculateStatistics(data as EvaluationResult[]);
  
  // Agregar estudiantes únicos y distribución por servicio
  const uniqueStudents = new Set((data as EvaluationResult[]).map((r) => r.student_id));
  (stats as Record<string, unknown>).total_estudiantes = uniqueStudents.size;

  const servicioDistribution: Record<string, { total: number; promedio: string; suma?: number }> = {};
  (data as EvaluationResult[]).forEach((r) => {
    if (!servicioDistribution[r.servicio]) {
      servicioDistribution[r.servicio] = {
        total: 0,
        promedio: '0',
        suma: 0
      };
    }
    servicioDistribution[r.servicio].total++;
    servicioDistribution[r.servicio].suma = (servicioDistribution[r.servicio].suma || 0) + r.porcentaje;
  });

  Object.keys(servicioDistribution).forEach(servicio => {
    servicioDistribution[servicio].promedio = 
      ((servicioDistribution[servicio].suma || 0) / servicioDistribution[servicio].total).toFixed(2);
    delete servicioDistribution[servicio].suma;
  });

  (stats as Record<string, unknown>).distribucion_servicios = servicioDistribution;

  return stats;
}

async function getServiceStatistics(
  supabase: SupabaseClient,
  servicio: string,
  fechaInicio?: string | null,
  fechaFin?: string | null
) {
  let query = supabase
    .from('evaluation_results')
    .select('*')
    .eq('servicio', servicio);

  if (fechaInicio) query = query.gte('created_at', fechaInicio);
  if (fechaFin) query = query.lte('created_at', fechaFin);

  const { data, error } = await query;

  if (error) throw error;

  const stats = calculateStatistics(data as EvaluationResult[]);
  
  // Agregar estudiantes únicos y top instituciones
  const uniqueStudents = new Set((data as EvaluationResult[]).map((r) => r.student_id));
  (stats as Record<string, unknown>).total_estudiantes = uniqueStudents.size;

  const instituciones: Record<string, { total: number; suma: number }> = {};
  (data as EvaluationResult[]).forEach((r) => {
    if (!r.institucion) return;
    
    if (!instituciones[r.institucion]) {
      instituciones[r.institucion] = {
        total: 0,
        suma: 0
      };
    }
    instituciones[r.institucion].total++;
    instituciones[r.institucion].suma += r.porcentaje;
  });

  (stats as Record<string, unknown>).top_instituciones = Object.entries(instituciones)
    .map(([nombre, instData]) => ({
      institucion: nombre,
      total_evaluaciones: instData.total,
      promedio: (instData.suma / instData.total).toFixed(2)
    }))
    .sort((a, b) => parseFloat(b.promedio) - parseFloat(a.promedio))
    .slice(0, 5);

  return stats;
}

async function getCourseStatistics(
  supabase: SupabaseClient,
  courseId: string,
  fechaInicio?: string | null,
  fechaFin?: string | null
) {
  let query = supabase
    .from('evaluation_results')
    .select('*')
    .eq('course_id', courseId);

  if (fechaInicio) query = query.gte('created_at', fechaInicio);
  if (fechaFin) query = query.lte('created_at', fechaFin);

  const { data, error } = await query;

  if (error) throw error;

  const stats = calculateStatistics(data as EvaluationResult[]);
  
  const uniqueStudents = new Set((data as EvaluationResult[]).map((r) => r.student_id));
  (stats as Record<string, unknown>).total_estudiantes = uniqueStudents.size;

  return stats;
}

async function getGlobalStatistics(
  supabase: SupabaseClient,
  fechaInicio?: string | null,
  fechaFin?: string | null
) {
  let query = supabase
    .from('evaluation_results')
    .select('*');

  if (fechaInicio) query = query.gte('created_at', fechaInicio);
  if (fechaFin) query = query.lte('created_at', fechaFin);

  const { data, error } = await query;

  if (error) throw error;

  const stats = calculateStatistics(data as EvaluationResult[]);
  
  const uniqueStudents = new Set((data as EvaluationResult[]).map((r) => r.student_id));
  (stats as Record<string, unknown>).total_estudiantes = uniqueStudents.size;

  // Distribución por servicio
  const servicios: Record<string, {
    total: number;
    suma: number;
    correctas: number;
    incorrectas: number;
    vacias: number;
    estudiantes: Set<string>;
  }> = {};
  (data as EvaluationResult[]).forEach((r) => {
    if (!servicios[r.servicio]) {
      servicios[r.servicio] = {
        total: 0,
        suma: 0,
        correctas: 0,
        incorrectas: 0,
        vacias: 0,
        estudiantes: new Set()
      };
    }
    servicios[r.servicio].total++;
    servicios[r.servicio].suma += r.porcentaje;
    servicios[r.servicio].correctas += r.respuestas_correctas;
    servicios[r.servicio].incorrectas += r.respuestas_incorrectas;
    servicios[r.servicio].vacias += r.respuestas_vacias;
    servicios[r.servicio].estudiantes.add(r.student_id);
  });

  (stats as Record<string, unknown>).por_servicio = Object.entries(servicios).map(([nombre, servData]) => ({
    servicio: nombre,
    evaluaciones: servData.total,
    estudiantes: servData.estudiantes.size,
    promedio: (servData.suma / servData.total).toFixed(2),
    correctas: servData.correctas,
    incorrectas: servData.incorrectas,
    vacias: servData.vacias
  }));

  return stats;
}

function calculateStatistics(data: EvaluationResult[]) {
  if (!data || data.length === 0) {
    return {
      total_evaluaciones: 0,
      total_preguntas: 0,
      total_correctas: 0,
      total_incorrectas: 0,
      total_vacias: 0,
      promedio_porcentaje: 0,
      promedio_tiempo: 0,
      tasa_aprobacion: 0,
      mejor_puntaje: 0,
      peor_puntaje: 0,
      evaluaciones_aprobadas: 0,
      evaluaciones_reprobadas: 0
    };
  }

  const totalEvaluaciones = data.length;
  const totalPreguntas = data.reduce((sum, r) => sum + r.total_preguntas, 0);
  const totalCorrectas = data.reduce((sum, r) => sum + r.respuestas_correctas, 0);
  const totalIncorrectas = data.reduce((sum, r) => sum + r.respuestas_incorrectas, 0);
  const totalVacias = data.reduce((sum, r) => sum + r.respuestas_vacias, 0);
  const promedioPortcentaje = data.reduce((sum, r) => sum + r.porcentaje, 0) / totalEvaluaciones;
  const aprobadas = data.filter(r => r.aprobado).length;
  const reprobadas = totalEvaluaciones - aprobadas;
  const tasaAprobacion = (aprobadas / totalEvaluaciones) * 100;
  const puntajes = data.map(r => r.porcentaje);
  const mejorPuntaje = Math.max(...puntajes);
  const peorPuntaje = Math.min(...puntajes);

  // Calcular tiempo promedio en minutos
  const tiempos = data.map(r => {
    const inicio = new Date(r.tiempo_inicio);
    const fin = new Date(r.tiempo_fin);
    return (fin.getTime() - inicio.getTime()) / (1000 * 60);
  });
  const promedioTiempo = tiempos.reduce((sum, t) => sum + t, 0) / tiempos.length;

  return {
    total_evaluaciones: totalEvaluaciones,
    total_preguntas: totalPreguntas,
    total_correctas: totalCorrectas,
    total_incorrectas: totalIncorrectas,
    total_vacias: totalVacias,
    promedio_porcentaje: parseFloat(promedioPortcentaje.toFixed(2)),
    promedio_tiempo: parseFloat(promedioTiempo.toFixed(2)),
    tasa_aprobacion: parseFloat(tasaAprobacion.toFixed(2)),
    mejor_puntaje: parseFloat(mejorPuntaje.toFixed(2)),
    peor_puntaje: parseFloat(peorPuntaje.toFixed(2)),
    evaluaciones_aprobadas: aprobadas,
    evaluaciones_reprobadas: reprobadas
  };
}
