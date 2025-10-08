# Sistema de Evaluaciones: Quizzes vs Simulacros

## 📊 Visión General

Epsilon Academy tiene **DOS sistemas de evaluación separados**:

1. **QUIZZES** - Evaluaciones vinculadas a cursos
2. **SIMULACROS** - Exámenes de práctica independientes

---

## 🎯 QUIZZES (Evaluaciones de Curso)

### Propósito
Evaluar el aprendizaje de estudiantes **dentro de un curso específico**.

### Características Principales
- ✅ **Vinculados a un curso** (`course_id`)
- ✅ **Creados por profesores** del curso
- ✅ **Solo visible para estudiantes inscritos** en ese curso
- ✅ Forman parte del **progreso del curso**
- ✅ Pueden tener **fechas de disponibilidad** específicas
- ✅ Los profesores ven los resultados de **sus estudiantes**

### Tipos de Preguntas
1. **Opción Única** (`multiple_choice`) - Solo una respuesta correcta
2. **Opción Múltiple** (`multiple_select`) - Varias respuestas correctas
3. **Verdadero/Falso** (`true_false`)
4. **Respuesta Corta** (`short_answer`) - Texto breve
5. **Ensayo** (`essay`) - Texto largo, evaluación manual

### Tablas en Base de Datos
```
quizzes                    - Configuración del quiz
├── quiz_questions         - Preguntas del quiz
│   └── quiz_question_options  - Opciones de respuesta
├── quiz_attempts          - Intentos de estudiantes
└── quiz_student_answers   - Respuestas individuales
```

### Flujo de Uso
```
Profesor crea Quiz → Vincula a Curso → Estudiantes inscritos lo ven
→ Estudiante completa Quiz → Profesor revisa resultados
→ Cuenta para calificación del curso
```

### Configuración Típica
- **Tiempo límite:** 30-60 minutos
- **Intentos:** 1-3 intentos
- **Puntaje mínimo:** 70%
- **Mostrar respuestas:** Sí (después de completar)
- **Disponibilidad:** Fechas específicas del curso

---

## 🏆 SIMULACROS (Exámenes de Práctica)

### Propósito
Exámenes de práctica **independientes de cursos** para preparación de exámenes reales.

### Características Principales
- ✅ **NO vinculados a cursos** (standalone)
- ✅ **Categorías libres** (matemáticas, física, programación, etc.)
- ✅ **Sistema de suscripciones** (free/basic/premium/enterprise)
- ✅ **Simulacros de muestra** para usuarios gratuitos
- ✅ **Temporizador estricto** con auto-envío
- ✅ **Estadísticas globales** (tasa de aprobación, promedio)

### Sistema de Suscripciones
| Plan | Simulacros/mes | Precio |
|------|----------------|--------|
| **Free** | 5 simulacros | Gratis |
| **Basic** | 20 simulacros | $X/mes |
| **Premium** | Ilimitados | $XX/mes |
| **Enterprise** | Ilimitados + Personalización | $XXX/mes |

### Simulacros de Muestra (`is_sample = true`)
- Disponibles para **todos los usuarios** (incluso free)
- No cuentan para el límite mensual
- Sirven como **demo** del sistema

### Tablas en Base de Datos
```
subscriptions              - Planes de usuarios
simulacros                 - Exámenes de práctica
├── simulacro_questions    - Preguntas del simulacro
│   └── question_options   - Opciones de respuesta
├── simulacro_attempts     - Intentos de usuarios
└── student_answers        - Respuestas individuales
```

### Flujo de Uso
```
Usuario se suscribe → Ve simulacros disponibles según plan
→ Inicia simulacro → Temporizador cuenta regresiva
→ Completa o se auto-envía → Ve resultados detallados
→ Puede revisar (si está habilitado)
```

### Configuración Típica
- **Tiempo límite:** 60-120 minutos (estricto)
- **Intentos:** 1-3 intentos
- **Puntaje mínimo:** 70-80%
- **Mostrar respuestas:** Opcional
- **Disponibilidad:** Siempre (según suscripción)

---

## 🔍 Comparación Directa

| Característica | QUIZZES | SIMULACROS |
|----------------|---------|------------|
| **Vinculado a curso** | ✅ Sí | ❌ No |
| **Requiere inscripción** | ✅ Sí (al curso) | ❌ No |
| **Sistema de pago** | ❌ No | ✅ Suscripciones |
| **Temporizador** | ⚠️ Opcional | ✅ Obligatorio |
| **Auto-envío** | ⚠️ Opcional | ✅ Siempre |
| **Revisión posterior** | ✅ Común | ⚠️ Opcional |
| **Calificación del curso** | ✅ Sí | ❌ No |
| **Estadísticas globales** | ❌ No | ✅ Sí |
| **Categorías libres** | ❌ No | ✅ Sí |
| **Simulacros de muestra** | ❌ N/A | ✅ Sí |

---

## 🎨 Soporte para Imágenes

**AMBOS SISTEMAS** tienen soporte completo para imágenes:

### Quizzes
- ✅ Imagen en pregunta (`question_image_url`)
- ✅ Imagen en cada opción (`option_image_url`)
- ✅ Imagen en explicación (`explanation_image_url`)

### Simulacros
- ✅ Imagen en pregunta (`question_image_url`)
- ✅ Imagen en cada opción (`option_image_url`)
- ✅ Imagen en explicación (`explanation_image_url`)
- ✅ Imagen de portada (`thumbnail_url`)

---

## 🛠️ Componentes Frontend

### Para QUIZZES
```
src/components/teacher/
├── QuizBuilder.tsx              - Constructor de quizzes (curso)
├── QuizBuilder.module.css
└── QuestionEditorModal.tsx      - Editor compartido

src/components/student/
├── QuizViewer.tsx               - Tomar quiz de curso
└── QuizViewer.module.css
```

### Para SIMULACROS
```
src/components/teacher/
├── SimulacroBuilder.tsx         - Constructor de simulacros
├── SimulacroBuilder.module.css
├── QuestionsTab.tsx
├── PreviewTab.tsx
└── QuestionEditorModal.tsx      - Editor compartido

src/components/student/
├── SimulacroViewer.tsx          - Tomar simulacro
├── SimulacroViewer.module.css
└── SimulacroViewerComponents.tsx
```

---

## 📁 Migraciones de Base de Datos

```
supabase/migrations/
├── 20250107_quizzes_system.sql      - Sistema de QUIZZES (curso)
└── 20250107_simulacros_system.sql   - Sistema de SIMULACROS (práctica)
```

**IMPORTANTE:** Ejecutar ambas migraciones en orden.

---

## 🔐 Seguridad (RLS Policies)

### Quizzes
- Profesores pueden crear/editar **sus propios quizzes**
- Estudiantes solo ven quizzes de **cursos inscritos**
- Estudiantes solo ven **sus propios intentos**
- Profesores ven intentos de **sus estudiantes**

### Simulacros
- Profesores pueden crear **cualquier simulacro**
- Usuarios solo ven simulacros según **su suscripción**
- Simulacros de muestra visibles para **todos**
- Usuarios solo ven **sus propios intentos**

---

## 🚀 Casos de Uso

### Usar QUIZZES cuando:
- ✅ Evalúas aprendizaje en un curso
- ✅ Quieres calificaciones del curso
- ✅ Necesitas control de fechas de entrega
- ✅ Solo estudiantes inscritos deben verlo
- ✅ Forman parte del currículo

**Ejemplo:** "Quiz de Álgebra Lineal - Unidad 3: Matrices"

### Usar SIMULACROS cuando:
- ✅ Preparación para exámenes externos
- ✅ Práctica sin vínculo a curso
- ✅ Monetización con suscripciones
- ✅ Exámenes cronometrados estrictos
- ✅ Catálogo público de exámenes

**Ejemplo:** "Simulacro Examen de Admisión Universidad 2025"

---

## 📊 Ejemplo de Arquitectura

```
ESTUDIANTE
│
├─► QUIZZES (dentro de cursos)
│   ├─ Curso: Matemáticas 101
│   │   ├─ Quiz 1: Álgebra Básica
│   │   ├─ Quiz 2: Ecuaciones
│   │   └─ Quiz 3: Funciones
│   │
│   └─ Curso: Física 101
│       ├─ Quiz 1: Cinemática
│       └─ Quiz 2: Dinámica
│
└─► SIMULACROS (independientes)
    ├─ Categoría: Admisión Universitaria
    │   ├─ Simulacro Matemáticas
    │   ├─ Simulacro Verbal
    │   └─ Simulacro General
    │
    └─ Categoría: Certificación Profesional
        ├─ Simulacro AWS Cloud Practitioner
        └─ Simulacro Google Analytics
```

---

## 🎯 Resumen Ejecutivo

| Aspecto | QUIZZES | SIMULACROS |
|---------|---------|------------|
| **Contexto** | Educativo (curso) | Preparación (examen) |
| **Modelo de negocio** | Incluido en curso | Suscripciones |
| **Público** | Estudiantes inscritos | Cualquier usuario |
| **Propósito** | Evaluar aprendizaje | Practicar exámenes |
| **Calificación** | Cuenta para curso | Práctica solamente |

---

## 🔄 Integración

Ambos sistemas **pueden coexistir**:
- Un estudiante puede estar en el **Curso de Física** (con quizzes)
- Y también practicar **Simulacros de Admisión** (independientes)
- Los datos están **completamente separados**
- No hay interferencia entre sistemas

---

## 📝 Notas de Implementación

### Backend (API Routes)
```
/api/quizzes/              - CRUD de quizzes (curso)
/api/quizzes/[id]/submit   - Enviar respuestas de quiz

/api/simulacros/           - CRUD de simulacros (práctica)
/api/simulacros/[id]/submit - Enviar respuestas de simulacro
/api/subscriptions/        - Gestión de suscripciones
```

### Storage (Supabase)
```
Bucket: quizzes/
├── questions/       - Imágenes de preguntas de quizzes
└── options/         - Imágenes de opciones de quizzes

Bucket: simulacros/
├── thumbnails/      - Portadas de simulacros
├── questions/       - Imágenes de preguntas de simulacros
└── options/         - Imágenes de opciones de simulacros
```

---

## ✅ Checklist de Implementación

### Quizzes (Evaluaciones de Curso)
- [x] Schema de base de datos
- [ ] QuizBuilder (reutilizar existente)
- [ ] QuizViewer para estudiantes
- [ ] API routes CRUD
- [ ] Integración con CourseManager
- [ ] Sistema de calificaciones

### Simulacros (Exámenes de Práctica)
- [x] Schema de base de datos
- [x] SimulacroBuilder
- [x] SimulacroViewer
- [ ] Sistema de suscripciones
- [ ] API routes CRUD
- [ ] Panel de simulacros de muestra
- [ ] Integración de pagos

---

**Última actualización:** Enero 7, 2025
