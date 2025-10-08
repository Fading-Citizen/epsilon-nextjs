# 🎨 Integración en Dashboards - Quizzes vs Simulacros

## ✅ CAMBIOS REALIZADOS

### 📚 TeacherDashboard_main.tsx

#### **ANTES (Solo "Evaluaciones")**
```
Navegación:
├── Resumen
├── Cursos
├── Clases en Vivo
├── Evaluaciones  ← Todo mezclado
├── Estudiantes
├── Grupos
├── Mensajes
└── Perfil
```

#### **AHORA (Separado)**
```
Navegación:
├── Resumen
├── Cursos
├── Clases en Vivo
├── Quizzes (Cursos) ← 📝 Evaluaciones de curso
├── Simulacros (Práctica) ← 🏆 Exámenes independientes
├── Estudiantes
├── Grupos
├── Mensajes
└── Perfil
```

---

## 📝 SECCIÓN: QUIZZES (CURSOS)

### Diseño Visual

```
┌────────────────────────────────────────────────────────────────┐
│  📝 Quizzes de Cursos                    [Vista] [+ Nuevo Quiz]│
│  Evaluaciones vinculadas a cursos específicos                   │
├────────────────────────────────────────────────────────────────┤
│  [Buscar quiz...] [Todos los Cursos▼] [Estado▼] [Ordenar▼]   │
├────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│  │ Quiz Álgebra    │  │ Quiz Cálculo    │  │ Quiz Física     ││
│  │ Curso: Mat 101  │  │ Curso: Mat 201  │  │ Curso: Fis 101  ││
│  │ 15 preguntas    │  │ 20 preguntas    │  │ 12 preguntas    ││
│  │ 45 intentos     │  │ 32 intentos     │  │ 28 intentos     ││
│  │ [Editar] [📊]   │  │ [Editar] [📊]   │  │ [Editar] [📊]   ││
│  └─────────────────┘  └─────────────────┘  └─────────────────┘│
└────────────────────────────────────────────────────────────────┘
```

### Características
- ✅ **Color:** Púrpura (#8b5cf6)
- ✅ **Icono:** FileText (📝)
- ✅ **Filtros:** Por curso, estado, fecha
- ✅ **Botón:** "+ Nuevo Quiz"
- ✅ **Modal:** QuizBuilder.tsx

---

## 🏆 SECCIÓN: SIMULACROS (PRÁCTICA)

### Diseño Visual

```
┌────────────────────────────────────────────────────────────────┐
│  🏆 Simulacros de Práctica        [Vista] [+ Nuevo Simulacro]  │
│  Exámenes independientes con sistema de suscripciones          │
├────────────────────────────────────────────────────────────────┤
│  Estadísticas:                                                  │
│  [45 Total] [12 Muestra] [1,234 Intentos] [72% Aprobación]    │
├────────────────────────────────────────────────────────────────┤
│  [Buscar...] [Categoría▼] [Nivel▼] [Estado▼]                 │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │ Simulacro UNAM 1         │  │ Simulacro UNAM 2         │   │
│  │ [MUESTRA]                │  │ [PREMIUM]                │   │
│  │ Preparación admisión     │  │ Preparación admisión     │   │
│  │ ⏱️ 120 min 📝 120 Q 👥 234│  │ ⏱️ 120 min 📝 120 Q 👥 156│   │
│  │ [Editar] [📊]            │  │ [Editar] [📊]            │   │
│  └──────────────────────────┘  └──────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### Características
- ✅ **Color:** Naranja (#f59e0b)
- ✅ **Icono:** Award (🏆)
- ✅ **Estadísticas:** Total, Muestra, Intentos, Tasa
- ✅ **Filtros:** Categoría, nivel de suscripción, estado
- ✅ **Botón:** "+ Nuevo Simulacro"
- ✅ **Modal:** SimulacroBuilder.tsx
- ✅ **Badges:** [MUESTRA] / [PREMIUM] / [BASIC]

---

## 🎓 STUDENT DASHBOARD

### Navegación Actual

```
Menu Items:
├── Dashboard (Home)
├── Oferta Académica
├── Cursos Adquiridos
├── Clases en Vivo
├── Simulacros ← YA EXISTE
├── Noticias
├── Mensajes
└── Perfil
```

### Mejoras Necesarias

#### 1. **En "Cursos Adquiridos"** → Agregar acceso a Quizzes

```
┌────────────────────────────────────────────┐
│ Curso: Matemáticas 101                     │
│ ├── 📚 Lecciones (15)                      │
│ ├── 📝 Quizzes (3) ← NUEVO                │
│ │   ├── Quiz 1: Álgebra (✅ 85%)           │
│ │   ├── Quiz 2: Ecuaciones (✅ 92%)        │
│ │   └── Quiz 3: Funciones (⏳ Pendiente)   │
│ ├── 🎥 Clases en Vivo (2)                  │
│ └── 📊 Progreso: 78%                       │
└────────────────────────────────────────────┘
```

#### 2. **En "Simulacros"** → Mejorar con sistema de suscripción

```
┌────────────────────────────────────────────────────────────┐
│  🏆 Simulacros de Práctica                                  │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Tu Plan: FREE 🆓                                        ││
│  │ 3/5 simulacros usados este mes                         ││
│  │ [Actualizar a Premium] → Acceso ilimitado              ││
│  └────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  Categorías:                                                │
│  ┌─────────────────┐ ┌─────────────────┐ ┌────────────────┐│
│  │ 📚 Admisión     │ │ 🎓 Certificación│ │ 🏅 Competencias││
│  │ 12 disponibles  │ │ 8 disponibles   │ │ 5 disponibles  ││
│  └─────────────────┘ └─────────────────┘ └────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  Simulacros de Muestra (GRATIS) 🆓                          │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ 🎯 UNAM Básico   │  │ 🎯 IPN Básico    │                │
│  │ [GRATIS]         │  │ [GRATIS]         │                │
│  │ Iniciar →        │  │ Iniciar →        │                │
│  └──────────────────┘  └──────────────────┘                │
├─────────────────────────────────────────────────────────────┤
│  Simulacros Premium 💎 (Requiere suscripción)               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ 🔒 UNAM Completo │  │ 🔒 IPN Completo  │                │
│  │ 🔒 Bloqueado     │  │ 🔒 Bloqueado     │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 ARMONÍA VISUAL

### Paleta de Colores Consistente

```javascript
// QUIZZES (Evaluaciones de Curso)
quizzes: {
  primary: '#8b5cf6',    // Púrpura
  light: '#c4b5fd',
  bg: '#f5f3ff',
  icon: '📝'
}

// SIMULACROS (Exámenes de Práctica)
simulacros: {
  primary: '#f59e0b',    // Naranja
  light: '#fde68a',
  bg: '#fffbeb',
  icon: '🏆'
}

// CURSOS
cursos: {
  primary: '#3b82f6',    // Azul
  light: '#93c5fd',
  bg: '#eff6ff',
  icon: '📚'
}

// CLASES EN VIVO
clases: {
  primary: '#ef4444',    // Rojo
  light: '#fca5a5',
  bg: '#fef2f2',
  icon: '🎥'
}
```

### Componentes Reutilizables

Ambos dashboards usan:
- ✅ **Mismo tema** (ThemeContext)
- ✅ **Mismos colores** para cada sección
- ✅ **Mismos iconos** (lucide-react)
- ✅ **Mismo sistema de filtros**
- ✅ **Misma estructura de cards**

---

## 🔄 FLUJO DE USUARIO ARMÓNICO

### PROFESOR

```
1. Crear Curso
   ↓
2. Agregar Contenido
   ↓
3a. Crear QUIZ (Evaluación del curso)
   └→ Se vincula al curso
   └→ Solo estudiantes inscritos

3b. Crear SIMULACRO (Práctica independiente)
   └→ NO vinculado al curso
   └→ Disponible en catálogo público
```

### ESTUDIANTE

```
1. Ver "Cursos Adquiridos"
   ↓
2a. Acceder a QUIZZES del curso
   └→ Tomar Quiz 1
   └→ Calificación afecta promedio del curso
   └→ Ver resultados inmediatos

2b. Ir a "Simulacros"
   └→ Ver plan actual (Free/Premium)
   └→ Seleccionar categoría
   └→ Tomar simulacro de muestra (gratis)
   └→ O usar cupo mensual (Free: 5/mes)
   └→ Resultados solo para práctica
```

---

## ✨ EXPERIENCIA UNIFICADA

### Cards Consistentes (Ambos Dashboards)

```css
/* Estructura de Card Estándar */
.card {
  background: theme.background.secondary;
  border: 1px solid theme.border;
  border-left: 4px solid [COLOR_CATEGORIA];
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px [COLOR]20;
}
```

### Botones Consistentes

```css
/* Primario */
.btn-primary {
  background: [COLOR_CATEGORIA];
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
}

/* Secundario */
.btn-secondary {
  background: theme.background.secondary;
  border: 1px solid theme.border;
  color: theme.text.primary;
}
```

---

## 📋 CHECKLIST DE INTEGRACIÓN

### Profesor Dashboard ✅
- [x] Separar "Evaluaciones" en "Quizzes" y "Simulacros"
- [x] Agregar sección "Quizzes (Cursos)" con color púrpura
- [x] Agregar sección "Simulacros (Práctica)" con color naranja
- [x] Implementar filtros específicos para cada tipo
- [x] Mostrar estadísticas de simulacros
- [x] Botón "+ Nuevo Quiz" abre QuizBuilder
- [x] Botón "+ Nuevo Simulacro" abre SimulacroBuilder
- [x] Badges para indicar nivel (MUESTRA/PREMIUM)

### Estudiante Dashboard 🚧
- [ ] Agregar sección "Quizzes" en cada curso
- [ ] Mostrar quizzes disponibles por curso
- [ ] Permitir iniciar quiz desde curso
- [ ] Mejorar sección "Simulacros" existente
- [ ] Mostrar plan de suscripción actual
- [ ] Separar simulacros de muestra de premium
- [ ] Agregar contador de simulacros usados/restantes
- [ ] Botón "Actualizar Plan" visible
- [ ] Indicadores visuales de acceso (🆓/🔒)

---

## 🎯 PRÓXIMOS PASOS

### Fase 1: Completar Estudiante Dashboard
1. Modificar StudentDashboard_responsive.tsx
2. Agregar sección de quizzes en vista de curso
3. Mejorar renderSimulacros() con suscripciones
4. Crear componente de plan de suscripción

### Fase 2: Crear QuizViewer
1. Interfaz similar a SimulacroViewer
2. Sin temporizador obligatorio
3. Mostrar resultados inmediatos
4. Vinculado al curso

### Fase 3: Integrar con Backend
1. Crear API routes
2. Conectar con Supabase
3. Implementar Storage para imágenes
4. Sistema de pagos para suscripciones

---

**Fecha de actualización:** Enero 7, 2025
**Estado:** Profesor Dashboard ✅ | Estudiante Dashboard 🚧
