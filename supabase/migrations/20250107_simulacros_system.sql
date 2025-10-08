-- ============================================================================
-- EPSILON ACADEMY - Sistema de SIMULACROS (Exámenes de Práctica Independientes)
-- Migración: Simulacros independientes de cursos con suscripciones
-- Diferencia con Quizzes: Simulacros son exámenes de práctica standalone
-- Quizzes están vinculados a cursos específicos
-- ============================================================================

-- ============================================================================
-- TABLA: subscriptions (Suscripciones de usuarios)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'basic', 'premium', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Límites del plan
  max_simulacros_per_month INTEGER DEFAULT 5, -- Free: 5, Basic: 20, Premium: ilimitado
  max_courses INTEGER DEFAULT 3,
  can_access_premium_content BOOLEAN DEFAULT false,
  
  UNIQUE(user_id)
);

-- ============================================================================
-- TABLA: simulacros (Exámenes de práctica INDEPENDIENTES de cursos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.simulacros (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
  -- NO tiene course_id - los simulacros son independientes
  
  -- Información básica
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  
  -- Tipo y categoría
  category TEXT, -- matemáticas, física, programación, etc.
  subject TEXT, -- álgebra, cálculo, química orgánica, etc.
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'expert')),
  
  -- Configuración de acceso
  is_sample BOOLEAN DEFAULT false, -- True = disponible para usuarios free
  is_published BOOLEAN DEFAULT false,
  requires_subscription TEXT DEFAULT 'free' CHECK (requires_subscription IN ('free', 'basic', 'premium', 'enterprise')),
  
  -- Configuración del examen
  time_limit_minutes INTEGER DEFAULT 60, -- Tiempo límite en minutos
  max_attempts INTEGER DEFAULT 3, -- Intentos permitidos
  passing_score INTEGER DEFAULT 70, -- Puntaje mínimo para aprobar
  
  -- Opciones de configuración
  shuffle_questions BOOLEAN DEFAULT false,
  shuffle_options BOOLEAN DEFAULT true,
  show_correct_answers BOOLEAN DEFAULT true, -- Mostrar respuestas después
  show_explanations BOOLEAN DEFAULT true, -- Mostrar explicaciones
  allow_review BOOLEAN DEFAULT true, -- Permitir revisar después
  show_results_immediately BOOLEAN DEFAULT true, -- Mostrar resultados al terminar
  
  -- Fechas de disponibilidad
  available_from TIMESTAMP WITH TIME ZONE,
  available_until TIMESTAMP WITH TIME ZONE,
  
  -- Metadatos
  total_questions INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  estimated_duration_minutes INTEGER,
  
  -- Estadísticas
  total_attempts INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  pass_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Imagen de portada
  thumbnail_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- TABLA: simulacro_questions (Preguntas de simulacros)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.simulacro_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  simulacro_id UUID REFERENCES public.simulacros(id) ON DELETE CASCADE NOT NULL,
  
  -- Contenido de la pregunta
  question_text TEXT NOT NULL,
  question_image_url TEXT, -- ⭐ IMAGEN DEL ENUNCIADO
  
  -- Tipo de pregunta
  question_type TEXT NOT NULL CHECK (question_type IN (
    'multiple-choice',      -- Opción múltiple (una respuesta)
    'multiple-select',      -- Selección múltiple (varias respuestas)
    'true-false',          -- Verdadero/Falso
    'short-answer',        -- Respuesta corta
    'essay',               -- Ensayo/Desarrollo
    'matching',            -- Emparejar
    'fill-blank'           -- Completar espacios
  )),
  
  -- Configuración
  order_index INTEGER NOT NULL, -- Orden de la pregunta
  points INTEGER DEFAULT 1, -- Puntos que vale
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  
  -- Explicación
  explanation_text TEXT, -- Explicación de la respuesta correcta
  explanation_image_url TEXT, -- Imagen de la explicación
  
  -- Metadatos
  tags TEXT[], -- Tags para categorización
  estimated_time_seconds INTEGER, -- Tiempo estimado para responder
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  UNIQUE(simulacro_id, order_index)
);

-- ============================================================================
-- TABLA: question_options (Opciones de respuesta)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.question_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id UUID REFERENCES public.simulacro_questions(id) ON DELETE CASCADE NOT NULL,
  
  -- Contenido de la opción
  option_text TEXT NOT NULL,
  option_image_url TEXT, -- ⭐ IMAGEN DE LA OPCIÓN
  
  -- Configuración
  option_index INTEGER NOT NULL, -- A, B, C, D (0, 1, 2, 3)
  is_correct BOOLEAN DEFAULT false,
  
  -- Feedback específico por opción
  feedback_text TEXT, -- Explicación si eligen esta opción
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  UNIQUE(question_id, option_index)
);

-- ============================================================================
-- TABLA: simulacro_attempts (Intentos de simulacros)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.simulacro_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  simulacro_id UUID REFERENCES public.simulacros(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  
  -- Estado del intento
  status TEXT DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'abandoned', 'expired')),
  attempt_number INTEGER NOT NULL, -- 1, 2, 3...
  
  -- Tiempos
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER, -- Tiempo real usado
  
  -- Resultados
  total_questions INTEGER,
  answered_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  score DECIMAL(5,2), -- Puntaje obtenido
  percentage DECIMAL(5,2), -- Porcentaje
  passed BOOLEAN, -- Aprobó o no
  
  -- Metadatos
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  UNIQUE(simulacro_id, student_id, attempt_number)
);

-- ============================================================================
-- TABLA: student_answers (Respuestas de estudiantes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.student_answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attempt_id UUID REFERENCES public.simulacro_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.simulacro_questions(id) ON DELETE CASCADE NOT NULL,
  
  -- Respuesta del estudiante
  selected_option_ids UUID[], -- IDs de opciones seleccionadas (puede ser múltiple)
  text_answer TEXT, -- Para preguntas de texto
  
  -- Evaluación
  is_correct BOOLEAN,
  points_earned DECIMAL(5,2),
  
  -- Tiempos
  time_spent_seconds INTEGER, -- Tiempo en esta pregunta
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Flags
  is_marked_for_review BOOLEAN DEFAULT false, -- Estudiante la marcó para revisar
  
  UNIQUE(attempt_id, question_id)
);

-- ============================================================================
-- ÍNDICES para optimización
-- ============================================================================

-- Subscriptions
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_plan_type ON public.subscriptions(plan_type);

-- Simulacros
CREATE INDEX idx_simulacros_teacher_id ON public.simulacros(teacher_id);
CREATE INDEX idx_simulacros_course_id ON public.simulacros(course_id);
CREATE INDEX idx_simulacros_is_sample ON public.simulacros(is_sample);
CREATE INDEX idx_simulacros_is_published ON public.simulacros(is_published);
CREATE INDEX idx_simulacros_category ON public.simulacros(category);

-- Questions
CREATE INDEX idx_simulacro_questions_simulacro_id ON public.simulacro_questions(simulacro_id);
CREATE INDEX idx_question_options_question_id ON public.question_options(question_id);

-- Attempts
CREATE INDEX idx_simulacro_attempts_simulacro_id ON public.simulacro_attempts(simulacro_id);
CREATE INDEX idx_simulacro_attempts_student_id ON public.simulacro_attempts(student_id);
CREATE INDEX idx_simulacro_attempts_status ON public.simulacro_attempts(status);

-- Answers
CREATE INDEX idx_student_answers_attempt_id ON public.student_answers(attempt_id);
CREATE INDEX idx_student_answers_question_id ON public.student_answers(question_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulacros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulacro_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulacro_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Simulacros policies
CREATE POLICY "Everyone can view published sample simulacros"
  ON simulacros FOR SELECT
  USING (is_published = true AND is_sample = true);

CREATE POLICY "Teachers can view own simulacros"
  ON simulacros FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can create simulacros"
  ON simulacros FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update own simulacros"
  ON simulacros FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own simulacros"
  ON simulacros FOR DELETE
  USING (teacher_id = auth.uid());

-- Students can view published simulacros based on subscription
CREATE POLICY "Students can view available simulacros"
  ON simulacros FOR SELECT
  USING (
    is_published = true AND
    (
      is_sample = true OR
      EXISTS (
        SELECT 1 FROM subscriptions s
        WHERE s.user_id = auth.uid()
        AND s.status = 'active'
        AND (
          (requires_subscription = 'free') OR
          (requires_subscription = 'basic' AND s.plan_type IN ('basic', 'premium', 'enterprise')) OR
          (requires_subscription = 'premium' AND s.plan_type IN ('premium', 'enterprise')) OR
          (requires_subscription = 'enterprise' AND s.plan_type = 'enterprise')
        )
      )
    )
  );

-- Questions policies
CREATE POLICY "Teachers can manage own simulacro questions"
  ON simulacro_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM simulacros
      WHERE simulacros.id = simulacro_questions.simulacro_id
      AND simulacros.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view questions of accessible simulacros"
  ON simulacro_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM simulacros
      WHERE simulacros.id = simulacro_questions.simulacro_id
      AND simulacros.is_published = true
    )
  );

-- Options policies (same as questions)
CREATE POLICY "Teachers can manage options of own questions"
  ON question_options FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM simulacro_questions sq
      JOIN simulacros s ON s.id = sq.simulacro_id
      WHERE sq.id = question_options.question_id
      AND s.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view options of accessible questions"
  ON question_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM simulacro_questions sq
      JOIN simulacros s ON s.id = sq.simulacro_id
      WHERE sq.id = question_options.question_id
      AND s.is_published = true
    )
  );

-- Attempts policies
CREATE POLICY "Students can view own attempts"
  ON simulacro_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = simulacro_attempts.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can create own attempts"
  ON simulacro_attempts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update own attempts"
  ON simulacro_attempts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = simulacro_attempts.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view attempts of own simulacros"
  ON simulacro_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM simulacros
      WHERE simulacros.id = simulacro_attempts.simulacro_id
      AND simulacros.teacher_id = auth.uid()
    )
  );

-- Answers policies
CREATE POLICY "Students can manage own answers"
  ON student_answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM simulacro_attempts sa
      JOIN students s ON s.id = sa.student_id
      WHERE sa.id = student_answers.attempt_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view answers of own simulacros"
  ON student_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM simulacro_attempts sa
      JOIN simulacros sim ON sim.id = sa.simulacro_id
      WHERE sa.id = student_answers.attempt_id
      AND sim.teacher_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_simulacros_updated_at
  BEFORE UPDATE ON simulacros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_simulacro_questions_updated_at
  BEFORE UPDATE ON simulacro_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_simulacro_attempts_updated_at
  BEFORE UPDATE ON simulacro_attempts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear suscripción free automáticamente
CREATE OR REPLACE FUNCTION create_free_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_type, status, max_simulacros_per_month, max_courses, can_access_premium_content)
  VALUES (NEW.id, 'free', 'active', 5, 3, false)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear suscripción free al crear usuario
CREATE TRIGGER on_user_created_create_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_free_subscription();

-- Función para actualizar estadísticas del simulacro
CREATE OR REPLACE FUNCTION update_simulacro_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE simulacros
  SET 
    total_attempts = (
      SELECT COUNT(*) FROM simulacro_attempts 
      WHERE simulacro_id = NEW.simulacro_id AND status = 'completed'
    ),
    average_score = (
      SELECT AVG(score) FROM simulacro_attempts 
      WHERE simulacro_id = NEW.simulacro_id AND status = 'completed'
    ),
    pass_rate = (
      SELECT 
        CASE 
          WHEN COUNT(*) = 0 THEN 0
          ELSE (COUNT(*) FILTER (WHERE passed = true)::DECIMAL / COUNT(*)) * 100
        END
      FROM simulacro_attempts 
      WHERE simulacro_id = NEW.simulacro_id AND status = 'completed'
    )
  WHERE id = NEW.simulacro_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar stats cuando se completa un intento
CREATE TRIGGER on_attempt_completed_update_stats
  AFTER INSERT OR UPDATE ON simulacro_attempts
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_simulacro_stats();

-- ============================================================================
-- DATOS DE EJEMPLO - Planes de suscripción
-- ============================================================================

COMMENT ON TABLE subscriptions IS 'Suscripciones de usuarios con diferentes planes';
COMMENT ON TABLE simulacros IS 'Exámenes de práctica (simulacros) con soporte para imágenes';
COMMENT ON TABLE simulacro_questions IS 'Preguntas de simulacros con imágenes en enunciado';
COMMENT ON TABLE question_options IS 'Opciones de respuesta con imágenes';
COMMENT ON TABLE simulacro_attempts IS 'Intentos de estudiantes en simulacros';
COMMENT ON TABLE student_answers IS 'Respuestas de estudiantes por pregunta';

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================
