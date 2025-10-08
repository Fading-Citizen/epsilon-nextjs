-- ============================================================================
-- SISTEMA DE QUIZZES (Evaluaciones de Cursos)
-- Fecha: 2025-01-07
-- Descripción: Sistema de quizzes vinculados a cursos con soporte para imágenes
-- Diferencia con Simulacros: Quizzes son evaluaciones de cursos específicos
-- Simulacros son exámenes de práctica independientes con temporizador
-- ============================================================================

-- ============================================================================
-- TABLA: quizzes
-- Descripción: Evaluaciones/quizzes vinculados a cursos específicos
-- ============================================================================
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    
    -- Información básica
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    
    -- Configuración
    passing_score INTEGER DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
    time_limit INTEGER, -- minutos (NULL = sin límite)
    max_attempts INTEGER DEFAULT 1, -- intentos permitidos
    shuffle_questions BOOLEAN DEFAULT false,
    shuffle_options BOOLEAN DEFAULT false,
    show_correct_answers BOOLEAN DEFAULT true, -- mostrar respuestas correctas después
    show_score_immediately BOOLEAN DEFAULT true,
    
    -- Disponibilidad
    available_from TIMESTAMP,
    available_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    
    -- Metadatos
    total_points INTEGER DEFAULT 0,
    estimated_duration INTEGER, -- minutos estimados
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    
    -- Imagen de portada
    thumbnail_url TEXT,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para quizzes
CREATE INDEX idx_quizzes_course ON quizzes(course_id);
CREATE INDEX idx_quizzes_teacher ON quizzes(teacher_id);
CREATE INDEX idx_quizzes_active ON quizzes(is_active);

-- ============================================================================
-- TABLA: quiz_questions
-- Descripción: Preguntas de los quizzes con soporte para imágenes
-- ============================================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    
    -- Contenido de la pregunta
    question_text TEXT NOT NULL,
    question_image_url TEXT, -- URL de imagen para el enunciado
    
    -- Tipo de pregunta
    question_type VARCHAR(50) NOT NULL DEFAULT 'multiple_choice',
    CHECK (question_type IN (
        'multiple_choice',  -- opción única
        'multiple_select',  -- múltiples opciones correctas
        'true_false',       -- verdadero/falso
        'short_answer',     -- respuesta corta
        'essay'             -- ensayo (texto largo)
    )),
    
    -- Configuración
    points INTEGER DEFAULT 1 CHECK (points > 0),
    order_number INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    
    -- Explicación (se muestra después de responder)
    explanation TEXT,
    explanation_image_url TEXT,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para quiz_questions
CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_order ON quiz_questions(quiz_id, order_number);

-- ============================================================================
-- TABLA: quiz_question_options
-- Descripción: Opciones de respuesta para preguntas de quiz (tipo multiple choice)
-- ============================================================================
CREATE TABLE IF NOT EXISTS quiz_question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    
    -- Contenido de la opción
    option_text TEXT NOT NULL,
    option_image_url TEXT, -- URL de imagen para la opción
    
    -- Configuración
    is_correct BOOLEAN DEFAULT false,
    order_number INTEGER NOT NULL,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para quiz_question_options
CREATE INDEX idx_quiz_options_question ON quiz_question_options(question_id);
CREATE INDEX idx_quiz_options_order ON quiz_question_options(question_id, order_number);

-- ============================================================================
-- TABLA: quiz_attempts
-- Descripción: Intentos de estudiantes en quizzes
-- ============================================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    
    -- Estado del intento
    status VARCHAR(20) DEFAULT 'in_progress',
    CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    
    -- Tiempo
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    time_spent INTEGER, -- segundos totales
    
    -- Resultados
    score NUMERIC(5,2), -- porcentaje (0-100)
    points_earned INTEGER DEFAULT 0,
    total_points INTEGER,
    passed BOOLEAN,
    
    -- Metadatos
    attempt_number INTEGER NOT NULL, -- 1, 2, 3...
    answers_data JSONB, -- respuestas completas en JSON
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para quiz_attempts
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_student ON quiz_attempts(student_id);
CREATE INDEX idx_quiz_attempts_status ON quiz_attempts(status);

-- Constraint único: quiz + student + attempt_number
CREATE UNIQUE INDEX idx_quiz_attempts_unique ON quiz_attempts(quiz_id, student_id, attempt_number);

-- ============================================================================
-- TABLA: quiz_student_answers
-- Descripción: Respuestas individuales de estudiantes en quizzes
-- ============================================================================
CREATE TABLE IF NOT EXISTS quiz_student_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    
    -- Respuesta según tipo de pregunta
    selected_option_id UUID REFERENCES quiz_question_options(id) ON DELETE SET NULL,
    selected_option_ids UUID[], -- para multiple_select
    text_answer TEXT, -- para short_answer y essay
    
    -- Evaluación
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    
    -- Metadatos
    answered_at TIMESTAMP DEFAULT NOW(),
    time_spent INTEGER -- segundos en esta pregunta
);

-- Índices para quiz_student_answers
CREATE INDEX idx_quiz_answers_attempt ON quiz_student_answers(attempt_id);
CREATE INDEX idx_quiz_answers_question ON quiz_student_answers(question_id);

-- ============================================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función: Actualizar updated_at en quizzes
CREATE OR REPLACE FUNCTION update_quiz_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_quiz_timestamp
    BEFORE UPDATE ON quizzes
    FOR EACH ROW
    EXECUTE FUNCTION update_quiz_timestamp();

-- Función: Calcular total_points en quizzes
CREATE OR REPLACE FUNCTION calculate_quiz_total_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE quizzes
    SET total_points = (
        SELECT COALESCE(SUM(points), 0)
        FROM quiz_questions
        WHERE quiz_id = NEW.quiz_id
    )
    WHERE id = NEW.quiz_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_quiz_points
    AFTER INSERT OR UPDATE OR DELETE ON quiz_questions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_quiz_total_points();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_student_answers ENABLE ROW LEVEL SECURITY;

-- Políticas para quizzes
CREATE POLICY "Teachers can manage their own quizzes"
    ON quizzes
    FOR ALL
    USING (teacher_id = auth.uid())
    WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Students can view active quizzes of their courses"
    ON quizzes
    FOR SELECT
    USING (
        is_active = true
        AND EXISTS (
            SELECT 1 FROM enrollments
            WHERE enrollments.course_id = quizzes.course_id
            AND enrollments.student_id = auth.uid()
            AND enrollments.status = 'active'
        )
    );

CREATE POLICY "Admins can manage all quizzes"
    ON quizzes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Políticas para quiz_questions
CREATE POLICY "Teachers can manage questions of their quizzes"
    ON quiz_questions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM quizzes
            WHERE quizzes.id = quiz_questions.quiz_id
            AND quizzes.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Students can view questions of accessible quizzes"
    ON quiz_questions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM quizzes
            JOIN enrollments ON enrollments.course_id = quizzes.course_id
            WHERE quizzes.id = quiz_questions.quiz_id
            AND quizzes.is_active = true
            AND enrollments.student_id = auth.uid()
            AND enrollments.status = 'active'
        )
    );

-- Políticas para quiz_question_options
CREATE POLICY "Teachers can manage options of their questions"
    ON quiz_question_options
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM quiz_questions
            JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
            WHERE quiz_questions.id = quiz_question_options.question_id
            AND quizzes.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Students can view options of accessible questions"
    ON quiz_question_options
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM quiz_questions
            JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
            JOIN enrollments ON enrollments.course_id = quizzes.course_id
            WHERE quiz_questions.id = quiz_question_options.question_id
            AND quizzes.is_active = true
            AND enrollments.student_id = auth.uid()
            AND enrollments.status = 'active'
        )
    );

-- Políticas para quiz_attempts
CREATE POLICY "Students can manage their own quiz attempts"
    ON quiz_attempts
    FOR ALL
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can view attempts of their quizzes"
    ON quiz_attempts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM quizzes
            WHERE quizzes.id = quiz_attempts.quiz_id
            AND quizzes.teacher_id = auth.uid()
        )
    );

-- Políticas para quiz_student_answers
CREATE POLICY "Students can manage their own answers"
    ON quiz_student_answers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM quiz_attempts
            WHERE quiz_attempts.id = quiz_student_answers.attempt_id
            AND quiz_attempts.student_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can view answers of their quizzes"
    ON quiz_student_answers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM quiz_attempts
            JOIN quizzes ON quizzes.id = quiz_attempts.quiz_id
            WHERE quiz_attempts.id = quiz_student_answers.attempt_id
            AND quizzes.teacher_id = auth.uid()
        )
    );

-- ============================================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ============================================================================

-- Comentar o eliminar en producción
COMMENT ON TABLE quizzes IS 'Evaluaciones/quizzes vinculados a cursos específicos';
COMMENT ON TABLE quiz_questions IS 'Preguntas de quizzes con soporte para imágenes';
COMMENT ON TABLE quiz_question_options IS 'Opciones de respuesta para preguntas tipo multiple choice';
COMMENT ON TABLE quiz_attempts IS 'Intentos de estudiantes en quizzes';
COMMENT ON TABLE quiz_student_answers IS 'Respuestas individuales de estudiantes';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
