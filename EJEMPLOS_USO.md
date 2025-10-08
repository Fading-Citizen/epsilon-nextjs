# 📚 Ejemplos de Uso - Quizzes vs Simulacros

## Ejemplo 1: Profesor Crea Quiz de Curso

### Contexto
**María** es profesora del curso "Matemáticas 101" y quiere evaluar a sus estudiantes.

### Flujo con QUIZZES
```typescript
// 1. María abre CourseManager desde TeacherDashboard
<CourseManager courseId="curso-mat-101" />

// 2. Hace clic en "Crear Quiz"
<QuizBuilder 
  courseId="curso-mat-101"
  courseName="Matemáticas 101"
/>

// 3. Configura el quiz
{
  title: "Quiz Unidad 1: Álgebra Básica",
  description: "Evaluación de ecuaciones lineales",
  course_id: "curso-mat-101",
  passing_score: 70,
  time_limit: 45, // minutos
  max_attempts: 2,
  show_correct_answers: true,
  difficulty_level: "intermediate"
}

// 4. Agrega preguntas
Question 1: {
  question_text: "Resuelve: 2x + 5 = 13",
  question_type: "multiple_choice",
  points: 2,
  options: [
    { option_text: "x = 3", is_correct: false },
    { option_text: "x = 4", is_correct: true },
    { option_text: "x = 5", is_correct: false },
    { option_text: "x = 6", is_correct: false }
  ]
}

// 5. Guarda → Solo estudiantes inscritos en "Matemáticas 101" lo ven
```

### Resultado
- ✅ Quiz visible solo para estudiantes del curso
- ✅ Cuenta para la calificación final
- ✅ María ve estadísticas de sus estudiantes

---

## Ejemplo 2: Estudiante Toma Quiz de Curso

### Contexto
**Juan** está inscrito en "Matemáticas 101" y ve un nuevo quiz disponible.

### Flujo
```typescript
// 1. Juan va a StudentDashboard → Mis Cursos → Matemáticas 101
<StudentDashboard />
  → <MyCourses />
    → <CourseDetail courseId="curso-mat-101" />

// 2. Ve "Quiz Unidad 1" disponible
<QuizViewer 
  quizId="quiz-123"
  courseId="curso-mat-101"
/>

// 3. Inicia el quiz
- Tiempo límite: 45 minutos
- Intentos disponibles: 2 (primera vez)
- Puntaje mínimo: 70%

// 4. Responde preguntas
- Pregunta 1: Selecciona "x = 4" ✓
- Pregunta 2: Selecciona opción incorrecta ✗
- Pregunta 3: Respuesta corta: "16" ✓

// 5. Envía el quiz
Result: {
  score: 75,
  passed: true,
  correct_answers: 8,
  incorrect_answers: 2,
  time_spent: "32 minutos"
}

// 6. Ve respuestas correctas y explicaciones
```

### Resultado
- ✅ Calificación guardada: 75/100
- ✅ Cuenta para el promedio del curso
- ✅ Puede intentar de nuevo (intento 2/2 restante)

---

## Ejemplo 3: Profesor Crea Simulacro de Práctica

### Contexto
**Carlos** quiere crear un simulacro de preparación para el examen de admisión.

### Flujo con SIMULACROS
```typescript
// 1. Carlos abre SimulacroBuilder desde menú
<SimulacroBuilder 
  // NO tiene courseId - es independiente
/>

// 2. Configura el simulacro
{
  title: "Simulacro Admisión UNAM 2025",
  description: "Examen completo de práctica",
  category: "Admisión Universitaria",
  subject: "Matemáticas",
  difficulty_level: "hard",
  
  // Sistema de suscripciones
  is_sample: false, // No es de muestra
  requires_subscription: "premium",
  
  // Configuración estricta
  time_limit_minutes: 120, // OBLIGATORIO
  max_attempts: 3,
  passing_score: 80,
  
  // Opciones
  shuffle_questions: true,
  shuffle_options: true,
  show_correct_answers: true,
  show_results_immediately: true
}

// 3. Agrega 120 preguntas (simulacro completo)
Question 1: {
  question_text: "Si f(x) = x² + 2x - 3, ¿cuál es f(2)?",
  question_image_url: "https://..../grafica.png",
  question_type: "multiple_choice",
  points: 1,
  options: [
    { 
      option_text: "5", 
      option_image_url: "https://..../opcion_a.png",
      is_correct: true 
    },
    // ... más opciones
  ]
}

// 4. Configura como Premium
// Solo usuarios con suscripción Premium pueden acceder
```

### Resultado
- ✅ Simulacro disponible en catálogo público
- ✅ Requiere suscripción Premium
- ✅ NO vinculado a ningún curso

---

## Ejemplo 4: Usuario Gratuito ve Simulacros

### Contexto
**Ana** es usuaria FREE y quiere practicar para el examen de admisión.

### Flujo
```typescript
// 1. Ana va a la sección Simulacros
<SimulacrosCatalog />

// 2. Ve su plan actual
Subscription: {
  plan_type: "free",
  max_simulacros_per_month: 5,
  used_this_month: 0,
  remaining: 5
}

// 3. Ve categorías disponibles
Categories:
  - Admisión Universitaria
    - ✅ [MUESTRA] Simulacro Básico UNAM (is_sample=true)
    - 🔒 Simulacro Completo UNAM (requires: premium)
    - 🔒 Simulacro Avanzado UNAM (requires: premium)
  
  - Certificaciones
    - 🔒 Todos bloqueados (requires: premium)

// 4. Ana puede hacer:
  ✅ Simulacros de MUESTRA (ilimitados, gratis)
  ✅ 5 simulacros regulares/mes (se consumen del límite)
  🔒 Simulacros Premium bloqueados

// 5. Hace un simulacro de muestra
<SimulacroViewer 
  simulacroId="simulacro-muestra-001"
  isSample={true}
  userSubscription="free"
/>
// No consume su límite mensual
```

### Resultado
- ✅ Puede practicar con simulacros de muestra
- ✅ Tiene 5 simulacros regulares/mes
- 💡 Invitación a actualizar a Premium

---

## Ejemplo 5: Usuario Premium Toma Simulacro

### Contexto
**Pedro** tiene suscripción Premium y toma un simulacro completo.

### Flujo
```typescript
// 1. Pedro selecciona simulacro
<SimulacroViewer 
  simulacroId="simulacro-unam-completo"
  userSubscription="premium"
/>

// 2. Comienza el simulacro
InitialState: {
  total_questions: 120,
  time_limit: 120, // minutos
  current_question: 1,
  answers: {},
  marked_questions: [],
  time_remaining: 7200 // segundos
}

// 3. Durante el examen
- ⏱️ Temporizador cuenta regresiva
- 📝 Responde pregunta por pregunta
- 🚩 Marca preguntas para revisar
- 📊 Barra de progreso: 45/120 respondidas
- ⚠️ Advertencia cuando quedan 10 minutos

// 4. Opciones de navegación
- ⬅️ Anterior
- ➡️ Siguiente
- 🔍 Navigator: ver todas las preguntas
  - ✅ Verde: Respondidas
  - 🟡 Amarillo: Marcadas
  - ⚪ Blanco: Sin responder

// 5. Se acaba el tiempo
- 🔴 Auto-envío a las 2 horas
- OR Pedro envía manualmente antes

// 6. Resultados detallados
Results: {
  score: 85.5,
  passed: true,
  correct_answers: 98,
  incorrect_answers: 22,
  time_spent: "118 minutos",
  
  stats: {
    by_difficulty: {
      easy: "28/30 (93%)",
      medium: "45/50 (90%)",
      hard: "25/40 (63%)"
    }
  },
  
  question_results: [
    {
      question_number: 1,
      correct: true,
      user_answer: "A",
      correct_answer: "A",
      points_earned: 1,
      explanation: "La respuesta correcta es..."
    },
    // ... todas las preguntas
  ]
}

// 7. Puede revisar respuestas
- Ver qué respondió
- Ver respuestas correctas
- Ver explicaciones
```

### Resultado
- ✅ Práctica completa realizada
- ✅ Resultados detallados guardados
- ✅ NO afecta ninguna calificación de curso
- ✅ Le quedan 2 intentos más

---

## Comparación Visual de Flujos

### QUIZ (Curso)
```
Profesor → Curso → Crear Quiz → Estudiantes inscritos
                                      ↓
                               Tomar Quiz → Calificación
                                      ↓
                               Promedio del Curso
```

### SIMULACRO (Práctica)
```
Profesor → Crear Simulacro → Catálogo Público
                                   ↓
Usuario → Suscripción → Tomar Simulacro → Resultados
                                   ↓
                            Solo Práctica
```

---

## Ejemplo 6: Admin Gestiona Suscripciones

### Contexto
**Admin** quiere ver estadísticas de suscripciones.

### Dashboard de Admin
```typescript
<AdminPanel />
  → <SubscriptionsManager />

Statistics: {
  total_users: 1250,
  
  by_plan: {
    free: 800 (64%),
    basic: 200 (16%),
    premium: 230 (18.4%),
    enterprise: 20 (1.6%)
  },
  
  revenue: {
    monthly: "$12,500",
    annual: "$150,000"
  },
  
  usage: {
    simulacros_taken_this_month: 4500,
    average_per_user: 3.6,
    most_popular_category: "Admisión Universitaria"
  }
}

// Admin puede:
- Crear simulacros de muestra
- Marcar simulacros como premium
- Ajustar límites de planes
- Ver estadísticas detalladas
```

---

## Ejemplo 7: Profesor Ve Resultados

### QUIZZES (Resultados de Curso)
```typescript
<TeacherDashboard />
  → <CourseDetail courseId="mat-101" />
    → <QuizResults quizId="quiz-123" />

Results: {
  quiz: "Quiz Unidad 1",
  course: "Matemáticas 101",
  
  students_attempted: 28,
  students_passed: 22 (79%),
  average_score: 76.5,
  
  student_results: [
    {
      student: "Juan Pérez",
      score: 75,
      attempts: 1,
      time_spent: "32 min",
      status: "passed"
    },
    // ... más estudiantes
  ]
}

// Profesor puede:
- Ver quién aprobó/reprobó
- Ver intentos de cada estudiante
- Exportar resultados
- Revisar respuestas individuales
```

### SIMULACROS (Estadísticas Globales)
```typescript
<TeacherDashboard />
  → <MySimulacros />
    → <SimulacroStats simulacroId="simulacro-001" />

GlobalStats: {
  simulacro: "Simulacro UNAM 2025",
  
  total_attempts: 450,
  unique_users: 320,
  average_score: 72.3,
  pass_rate: 65%,
  
  difficulty_analysis: {
    questions_too_easy: [12, 45, 67],
    questions_too_hard: [89, 103, 115],
    average_difficulty_correct: 68%
  },
  
  top_scores: [
    { user: "Anonymous", score: 98.5 },
    { user: "Anonymous", score: 96.0 },
    // ...
  ]
}

// Profesor ve:
- Estadísticas globales (anónimas)
- Preguntas problemáticas
- Tasa de aprobación general
- NO ve nombres de usuarios (privacidad)
```

---

## Resumen de Casos de Uso

| Caso de Uso | Sistema | Contexto |
|-------------|---------|----------|
| Evaluar aprendizaje de curso | QUIZ | Profesor → Curso → Estudiantes |
| Calificar estudiantes | QUIZ | Calificación afecta promedio |
| Práctica para examen externo | SIMULACRO | Usuario → Catálogo → Práctica |
| Monetización | SIMULACRO | Suscripciones Premium |
| Demo/muestra | SIMULACRO | is_sample=true |
| Estadísticas de curso | QUIZ | Por estudiante del curso |
| Estadísticas globales | SIMULACRO | Anónimas, generales |

---

**Fecha:** Enero 7, 2025
