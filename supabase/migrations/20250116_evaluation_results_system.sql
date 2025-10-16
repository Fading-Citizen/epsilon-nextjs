-- Migration: Sistema completo de resultados de evaluaciones y estadísticas
-- Fecha: 2025-01-16
-- Descripción: Tablas para almacenar resultados de quizzes, cursos y generar estadísticas detalladas

-- ============================================================
-- TABLA: evaluation_results
-- Almacena todos los resultados de evaluaciones (quizzes y exámenes de cursos)
-- ============================================================
CREATE TABLE IF NOT EXISTS evaluation_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relaciones
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluation_id VARCHAR(100) NOT NULL,
  course_id VARCHAR(100),
  group_id UUID REFERENCES grupos(id) ON DELETE SET NULL,
  
  -- Metadata de la evaluación
  evaluation_type VARCHAR(50) NOT NULL CHECK (evaluation_type IN ('quiz', 'exam', 'practice', 'final')),
  evaluation_name VARCHAR(255) NOT NULL,
  servicio VARCHAR(100) NOT NULL, -- ICFES, Saber Pro, Admisiones, Corporativo, Cursos Especializados
  
  -- Información institucional
  institucion VARCHAR(255), -- Colegio o institución del estudiante
  
  -- Resultados
  total_preguntas INTEGER NOT NULL CHECK (total_preguntas > 0),
  respuestas_correctas INTEGER NOT NULL DEFAULT 0 CHECK (respuestas_correctas >= 0),
  respuestas_incorrectas INTEGER NOT NULL DEFAULT 0 CHECK (respuestas_incorrectas >= 0),
  respuestas_vacias INTEGER NOT NULL DEFAULT 0 CHECK (respuestas_vacias >= 0),
  
  -- Puntajes
  puntaje_obtenido DECIMAL(10,2) NOT NULL,
  puntaje_total DECIMAL(10,2) NOT NULL,
  porcentaje DECIMAL(5,2) NOT NULL CHECK (porcentaje >= 0 AND porcentaje <= 100),
  
  -- Tiempo
  tiempo_inicio TIMESTAMP NOT NULL,
  tiempo_fin TIMESTAMP NOT NULL,
  duracion_minutos INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (tiempo_fin - tiempo_inicio)) / 60
  ) STORED,
  
  -- Datos detallados (JSON)
  preguntas_detalle JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Estructura: [{ pregunta_id, pregunta_texto, respuesta_correcta, respuesta_usuario, es_correcta, tiempo_respuesta, materia, dificultad }]
  
  analisis_por_materia JSONB DEFAULT '{}'::jsonb,
  -- Estructura: { "Matemáticas": { correctas: 10, incorrectas: 2, vacias: 1 }, ... }
  
  analisis_por_dificultad JSONB DEFAULT '{}'::jsonb,
  -- Estructura: { "facil": { correctas: 15, incorrectas: 1 }, "media": { correctas: 8, incorrectas: 4 }, ... }
  
  -- Metadata adicional
  intentos INTEGER DEFAULT 1,
  aprobado BOOLEAN GENERATED ALWAYS AS (porcentaje >= 60) STORED,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_evaluation_results_student ON evaluation_results(student_id);
CREATE INDEX idx_evaluation_results_course ON evaluation_results(course_id);
CREATE INDEX idx_evaluation_results_group ON evaluation_results(group_id);
CREATE INDEX idx_evaluation_results_servicio ON evaluation_results(servicio);
CREATE INDEX idx_evaluation_results_institucion ON evaluation_results(institucion);
CREATE INDEX idx_evaluation_results_type ON evaluation_results(evaluation_type);
CREATE INDEX idx_evaluation_results_fecha ON evaluation_results(created_at DESC);
CREATE INDEX idx_evaluation_results_aprobado ON evaluation_results(aprobado);

-- Índice compuesto para reportes institucionales
CREATE INDEX idx_evaluation_results_institucion_servicio ON evaluation_results(institucion, servicio, created_at DESC);

-- ============================================================
-- TABLA: student_institutions
-- Relación estudiantes con instituciones/colegios
-- ============================================================
CREATE TABLE IF NOT EXISTS student_institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institucion_nombre VARCHAR(255) NOT NULL,
  institucion_tipo VARCHAR(100) CHECK (institucion_tipo IN ('colegio', 'universidad', 'instituto', 'empresa', 'otro')),
  ciudad VARCHAR(100),
  pais VARCHAR(100) DEFAULT 'Colombia',
  codigo_institucion VARCHAR(50),
  fecha_inicio DATE,
  fecha_fin DATE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(student_id, institucion_nombre, activo)
);

CREATE INDEX idx_student_institutions_student ON student_institutions(student_id);
CREATE INDEX idx_student_institutions_nombre ON student_institutions(institucion_nombre);
CREATE INDEX idx_student_institutions_activo ON student_institutions(activo);

-- ============================================================
-- TABLA: evaluation_statistics_cache
-- Cache de estadísticas pre-calculadas para reportes rápidos
-- ============================================================
CREATE TABLE IF NOT EXISTS evaluation_statistics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Dimensiones del reporte
  dimension_type VARCHAR(50) NOT NULL CHECK (dimension_type IN ('student', 'group', 'institution', 'service', 'course', 'global')),
  dimension_id VARCHAR(255) NOT NULL, -- ID del estudiante, grupo, institución, servicio, etc.
  
  -- Período
  periodo_inicio DATE NOT NULL,
  periodo_fin DATE NOT NULL,
  
  -- Estadísticas agregadas
  total_evaluaciones INTEGER DEFAULT 0,
  total_preguntas INTEGER DEFAULT 0,
  total_correctas INTEGER DEFAULT 0,
  total_incorrectas INTEGER DEFAULT 0,
  total_vacias INTEGER DEFAULT 0,
  
  promedio_porcentaje DECIMAL(5,2),
  promedio_tiempo_minutos DECIMAL(10,2),
  
  tasa_aprobacion DECIMAL(5,2), -- Porcentaje de evaluaciones aprobadas
  
  mejor_puntaje DECIMAL(5,2),
  peor_puntaje DECIMAL(5,2),
  
  -- Distribución por tipo
  distribucion_por_tipo JSONB DEFAULT '{}'::jsonb,
  -- { "quiz": { total: 10, aprobados: 8 }, "exam": { total: 5, aprobados: 4 } }
  
  -- Top materias
  top_materias JSONB DEFAULT '[]'::jsonb,
  -- [{ materia: "Matemáticas", correctas: 45, incorrectas: 10, porcentaje: 81.8 }, ...]
  
  -- Análisis de dificultad
  rendimiento_dificultad JSONB DEFAULT '{}'::jsonb,
  -- { "facil": 92.5, "media": 75.3, "dificil": 58.2 }
  
  -- Metadata
  ultima_actualizacion TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_statistics_cache_dimension ON evaluation_statistics_cache(dimension_type, dimension_id);
CREATE INDEX idx_statistics_cache_periodo ON evaluation_statistics_cache(periodo_inicio, periodo_fin);

-- ============================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para evaluation_results
CREATE TRIGGER update_evaluation_results_updated_at
  BEFORE UPDATE ON evaluation_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FUNCIÓN: Calcular estadísticas por estudiante
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_student_statistics(
  p_student_id UUID,
  p_fecha_inicio DATE DEFAULT NULL,
  p_fecha_fin DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_evaluaciones', COUNT(*),
    'total_preguntas', SUM(total_preguntas),
    'total_correctas', SUM(respuestas_correctas),
    'total_incorrectas', SUM(respuestas_incorrectas),
    'total_vacias', SUM(respuestas_vacias),
    'promedio_porcentaje', ROUND(AVG(porcentaje), 2),
    'promedio_tiempo', ROUND(AVG(duracion_minutos), 2),
    'tasa_aprobacion', ROUND(
      (COUNT(*) FILTER (WHERE aprobado = TRUE)::DECIMAL / NULLIF(COUNT(*), 0) * 100), 2
    ),
    'mejor_puntaje', MAX(porcentaje),
    'peor_puntaje', MIN(porcentaje),
    'evaluaciones_aprobadas', COUNT(*) FILTER (WHERE aprobado = TRUE),
    'evaluaciones_reprobadas', COUNT(*) FILTER (WHERE aprobado = FALSE)
  )
  INTO v_stats
  FROM evaluation_results
  WHERE student_id = p_student_id
    AND (p_fecha_inicio IS NULL OR created_at::date >= p_fecha_inicio)
    AND (p_fecha_fin IS NULL OR created_at::date <= p_fecha_fin);
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCIÓN: Calcular estadísticas por grupo
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_group_statistics(
  p_group_id UUID,
  p_fecha_inicio DATE DEFAULT NULL,
  p_fecha_fin DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_evaluaciones', COUNT(*),
    'total_estudiantes', COUNT(DISTINCT student_id),
    'total_preguntas', SUM(total_preguntas),
    'total_correctas', SUM(respuestas_correctas),
    'total_incorrectas', SUM(respuestas_incorrectas),
    'total_vacias', SUM(respuestas_vacias),
    'promedio_porcentaje', ROUND(AVG(porcentaje), 2),
    'promedio_tiempo', ROUND(AVG(duracion_minutos), 2),
    'tasa_aprobacion', ROUND(
      (COUNT(*) FILTER (WHERE aprobado = TRUE)::DECIMAL / NULLIF(COUNT(*), 0) * 100), 2
    ),
    'mejor_estudiante', (
      SELECT jsonb_build_object(
        'student_id', student_id,
        'promedio', ROUND(AVG(porcentaje), 2)
      )
      FROM evaluation_results
      WHERE group_id = p_group_id
      GROUP BY student_id
      ORDER BY AVG(porcentaje) DESC
      LIMIT 1
    )
  )
  INTO v_stats
  FROM evaluation_results
  WHERE group_id = p_group_id
    AND (p_fecha_inicio IS NULL OR created_at::date >= p_fecha_inicio)
    AND (p_fecha_fin IS NULL OR created_at::date <= p_fecha_fin);
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCIÓN: Calcular estadísticas por institución
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_institution_statistics(
  p_institucion VARCHAR,
  p_fecha_inicio DATE DEFAULT NULL,
  p_fecha_fin DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_evaluaciones', COUNT(*),
    'total_estudiantes', COUNT(DISTINCT student_id),
    'total_preguntas', SUM(total_preguntas),
    'total_correctas', SUM(respuestas_correctas),
    'total_incorrectas', SUM(respuestas_incorrectas),
    'total_vacias', SUM(respuestas_vacias),
    'promedio_porcentaje', ROUND(AVG(porcentaje), 2),
    'tasa_aprobacion', ROUND(
      (COUNT(*) FILTER (WHERE aprobado = TRUE)::DECIMAL / NULLIF(COUNT(*), 0) * 100), 2
    ),
    'distribucion_servicios', (
      SELECT jsonb_object_agg(
        servicio,
        jsonb_build_object(
          'total', COUNT(*),
          'promedio', ROUND(AVG(porcentaje), 2)
        )
      )
      FROM evaluation_results
      WHERE institucion = p_institucion
      GROUP BY servicio
    )
  )
  INTO v_stats
  FROM evaluation_results
  WHERE institucion = p_institucion
    AND (p_fecha_inicio IS NULL OR created_at::date >= p_fecha_inicio)
    AND (p_fecha_fin IS NULL OR created_at::date <= p_fecha_fin);
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCIÓN: Calcular estadísticas por servicio
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_service_statistics(
  p_servicio VARCHAR,
  p_fecha_inicio DATE DEFAULT NULL,
  p_fecha_fin DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_evaluaciones', COUNT(*),
    'total_estudiantes', COUNT(DISTINCT student_id),
    'total_preguntas', SUM(total_preguntas),
    'total_correctas', SUM(respuestas_correctas),
    'total_incorrectas', SUM(respuestas_incorrectas),
    'total_vacias', SUM(respuestas_vacias),
    'promedio_porcentaje', ROUND(AVG(porcentaje), 2),
    'tasa_aprobacion', ROUND(
      (COUNT(*) FILTER (WHERE aprobado = TRUE)::DECIMAL / NULLIF(COUNT(*), 0) * 100), 2
    ),
    'top_instituciones', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'institucion', institucion,
          'total_evaluaciones', total,
          'promedio', promedio
        )
      )
      FROM (
        SELECT 
          institucion,
          COUNT(*) as total,
          ROUND(AVG(porcentaje), 2) as promedio
        FROM evaluation_results
        WHERE servicio = p_servicio
          AND institucion IS NOT NULL
        GROUP BY institucion
        ORDER BY AVG(porcentaje) DESC
        LIMIT 5
      ) top
    )
  )
  INTO v_stats
  FROM evaluation_results
  WHERE servicio = p_servicio
    AND (p_fecha_inicio IS NULL OR created_at::date >= p_fecha_inicio)
    AND (p_fecha_fin IS NULL OR created_at::date <= p_fecha_fin);
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- VISTAS MATERIALIZADAS para reportes rápidos
-- ============================================================

-- Vista: Estadísticas diarias por servicio
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_service_stats AS
SELECT 
  servicio,
  created_at::date as fecha,
  COUNT(*) as total_evaluaciones,
  COUNT(DISTINCT student_id) as estudiantes_unicos,
  SUM(respuestas_correctas) as total_correctas,
  SUM(respuestas_incorrectas) as total_incorrectas,
  SUM(respuestas_vacias) as total_vacias,
  ROUND(AVG(porcentaje), 2) as promedio_porcentaje,
  COUNT(*) FILTER (WHERE aprobado = TRUE) as total_aprobados,
  ROUND((COUNT(*) FILTER (WHERE aprobado = TRUE)::DECIMAL / COUNT(*) * 100), 2) as tasa_aprobacion
FROM evaluation_results
GROUP BY servicio, created_at::date
ORDER BY fecha DESC, servicio;

CREATE UNIQUE INDEX idx_daily_service_stats_unique ON daily_service_stats(servicio, fecha);

-- Vista: Top estudiantes globales
CREATE MATERIALIZED VIEW IF NOT EXISTS top_students_global AS
SELECT 
  student_id,
  COUNT(*) as total_evaluaciones,
  SUM(respuestas_correctas) as total_correctas,
  SUM(respuestas_incorrectas) as total_incorrectas,
  SUM(respuestas_vacias) as total_vacias,
  ROUND(AVG(porcentaje), 2) as promedio_general,
  MAX(porcentaje) as mejor_puntaje,
  COUNT(*) FILTER (WHERE aprobado = TRUE) as evaluaciones_aprobadas,
  ROUND((COUNT(*) FILTER (WHERE aprobado = TRUE)::DECIMAL / COUNT(*) * 100), 2) as tasa_aprobacion
FROM evaluation_results
GROUP BY student_id
HAVING COUNT(*) >= 3 -- Mínimo 3 evaluaciones para aparecer
ORDER BY promedio_general DESC
LIMIT 100;

CREATE UNIQUE INDEX idx_top_students_unique ON top_students_global(student_id);

-- ============================================================
-- COMENTARIOS
-- ============================================================
COMMENT ON TABLE evaluation_results IS 'Almacena todos los resultados de evaluaciones (quizzes, exámenes, prácticas)';
COMMENT ON TABLE student_institutions IS 'Relaciona estudiantes con instituciones educativas';
COMMENT ON TABLE evaluation_statistics_cache IS 'Cache de estadísticas pre-calculadas para reportes rápidos';
COMMENT ON FUNCTION calculate_student_statistics IS 'Calcula estadísticas completas de un estudiante';
COMMENT ON FUNCTION calculate_group_statistics IS 'Calcula estadísticas completas de un grupo';
COMMENT ON FUNCTION calculate_institution_statistics IS 'Calcula estadísticas completas de una institución';
COMMENT ON FUNCTION calculate_service_statistics IS 'Calcula estadísticas completas de un servicio';

-- ============================================================
-- DATOS DE EJEMPLO (Opcional - Eliminar en producción)
-- ============================================================
-- Se pueden agregar datos de ejemplo aquí si se desea
