# 🎓 Epsilon Academy# 🎓 Epsilon Academy



**Plataforma educativa interactiva multi-rol con gestión completa de cursos, estudiantes y profesores.****Plataforma educativa interactiva multi-rol con gestión completa de cursos, estudiantes y profesores.**



![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)

![React](https://img.shields.io/badge/React-19.1.0-blue)![React](https://img.shields.io/badge/React-19.1.0-blue)

![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)

![Supabase](https://img.shields.io/badge/Supabase-Latest-green)![Supabase](https://img.shields.io/badge/Supabase-Latest-green)



---## 🚀 Características



## 📋 Tabla de Contenidos- **Next.js App Router**: Estructura moderna con App Router

- **Autenticación con Supabase**: Sistema completo de autenticación

- [Descripción](#-descripción)- **Roles de Usuario**: Estudiante, Profesor, y Administrador

- [Características Principales](#-características-principales)- **Dashboards Específicos**: Interfaces personalizadas por rol

- [Tecnologías](#-tecnologías)- **API Routes**: Backend integrado con Next.js

- [Arquitectura del Sistema](#-arquitectura-del-sistema)- **Responsive Design**: Compatible con dispositivos móviles

- [Instalación](#-instalación)- **TypeScript**: Tipado estático para mejor desarrollo

- [Estructura del Proyecto](#-estructura-del-proyecto)

- [Sistema de Roles](#-sistema-de-roles)## 📋 Prerrequisitos

- [Base de Datos](#-base-de-datos)

- [Usuarios Demo](#-usuarios-demo)- Node.js 18.17 o superior

- [Temas y Diseño](#-temas-y-diseño)- npm o yarn

- [API Routes](#-api-routes)- Cuenta en Supabase

- [Scripts Disponibles](#-scripts-disponibles)

## 🛠️ Instalación

---

1. **Clonar el repositorio**

## 🎯 Descripción```bash

git clone <your-repo-url>

**Epsilon Academy** es una plataforma educativa moderna construida con Next.js 15 y Supabase, diseñada para facilitar la gestión de cursos, estudiantes y profesores. Implementa un sistema de roles completo con tres niveles de acceso: **Admin**, **Teacher** y **Student**.cd epsilon-nextjs

```

La plataforma incluye:

- 🔐 Autenticación segura con Supabase Auth2. **Instalar dependencias**

- 👥 Sistema multi-rol con permisos diferenciados```bash

- 📚 Gestión completa de cursos y leccionesnpm install

- 💬 Sistema de mensajería integrado```

- 📊 Dashboard personalizado por rol

- 🌓 Tema claro/oscuro3. **Configurar Supabase**

- 🎨 Diseño responsive con Tailwind CSS

   - Crear un proyecto en [Supabase](https://supabase.com)

---   - Copiar la URL del proyecto y la clave anónima

   - Ejecutar el esquema SQL en el Editor SQL de Supabase (usar `supabase-schema.sql`)

## ✨ Características Principales

4. **Configurar variables de entorno**

### Para Administradores

- ✅ Gestión completa de usuarios (profesores y estudiantes)   Crear `.env.local` con:

- ✅ Control de acceso y permisos```env

- ✅ Vista general del sistemaNEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase

- ✅ Configuración de parámetros globalesNEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase

SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio

### Para ProfesoresNEXTAUTH_URL=http://localhost:3000

- ✅ Crear y gestionar cursosNEXTAUTH_SECRET=tu_secreto_nextauth

- ✅ Administrar estudiantes asignadosNODE_ENV=development

- ✅ Crear lecciones y asignaciones```

- ✅ Evaluaciones y calificaciones

- ✅ Chat con estudiantes5. **Ejecutar en desarrollo**

- ✅ Vista de progreso de estudiantes```bash

- ✅ Gestión de gruposnpm run dev

```

### Para Estudiantes

- ✅ Acceso a cursos inscritos## 🗂️ Estructura del Proyecto

- ✅ Visualización de lecciones

- ✅ Entrega de asignaciones```

- ✅ Chat con profesor asignadosrc/

- ✅ Seguimiento de progreso personal├── app/                    # App Router pages

│   ├── api/               # API routes

---│   ├── login/             # Página de login

│   ├── student/           # Dashboard del estudiante

## 🛠 Tecnologías│   ├── teacher/           # Dashboard del profesor

│   ├── admin/             # Dashboard del administrador

### Frontend│   ├── layout.tsx         # Layout principal

- **Next.js 15.5.2** - Framework React con App Router│   └── page.tsx           # Página de inicio

- **React 19.1.0** - Biblioteca de UI├── components/            # Componentes React

- **TypeScript 5.9.3** - Tipado estático│   ├── auth/              # Componentes de autenticación

- **Tailwind CSS 4** - Estilos utility-first│   ├── student/           # Componentes del estudiante

- **Styled Components 6.1.19** - CSS-in-JS│   ├── teacher/           # Componentes del profesor

- **Framer Motion 12** - Animaciones│   ├── admin/             # Componentes del administrador

- **Lucide React** - Iconos│   └── common/            # Componentes compartidos

├── lib/                   # Utilidades y configuraciones

### Backend & Database│   ├── supabase/          # Cliente Supabase

- **Supabase** - Backend as a Service│   └── auth/              # Context de autenticación

  - Authentication (Auth)├── themes/                # Temas y estilos

  - PostgreSQL Database└── utils/                 # Funciones utilitarias

  - Row Level Security (RLS)```

  - Real-time subscriptions

- **@supabase/ssr** - SSR support para Next.js## 🔐 Autenticación



---La aplicación usa Supabase Auth con las siguientes características:



## 🏗 Arquitectura del Sistema- **Registro e inicio de sesión** con email/contraseña

- **Roles de usuario** (student, teacher, admin)

```- **Protección de rutas** con middleware

┌─────────────────────────────────────────────────────────┐- **Usuarios demo** para pruebas

│                    Next.js App Router                    │

├─────────────────────────────────────────────────────────┤### Usuarios Demo

│                                                           │

│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │- **Estudiante**: `student.demo@epsilon.com` / `demo123`

│  │   Middleware │  │  Auth Context │  │Theme Context │  │- **Profesor**: `teacher.demo@epsilon.com` / `demo123`  

│  │  (Protected) │  │  (Supabase)  │  │ (Dark/Light) │  │- **Administrador**: `admin.demo@epsilon.com` / `demo123`

│  └──────────────┘  └──────────────┘  └──────────────┘  │

│                                                           │## 📱 Páginas y Funcionalidades

├─────────────────────────────────────────────────────────┤

│                      Dashboards                          │### `/login`

│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │- Formulario de autenticación

│  │    Admin     │  │   Teacher    │  │   Student    │  │- Botones para usuarios demo

│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │  │- Redirección basada en roles

│  └──────────────┘  └──────────────┘  └──────────────┘  │

│                                                           │### `/student`

├─────────────────────────────────────────────────────────┤- Dashboard del estudiante

│                    API Routes                            │- Vista de cursos inscritos

│  /api/auth  |  /api/courses  |  /api/users              │- Progreso y actividades

│  /api/update-password                                    │

└─────────────────────────────────────────────────────────┘### `/teacher`

                            ↓- Panel del profesor

┌─────────────────────────────────────────────────────────┐- Gestión de cursos

│                      Supabase                            │- Estudiantes y calificaciones

│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │

│  │ PostgreSQL │  │   Auth     │  │  Storage   │       │### `/admin`

│  │    +RLS    │  │  Service   │  │  (Files)   │       │- Panel de administración

│  └────────────┘  └────────────┘  └────────────┘       │- Gestión de usuarios

└─────────────────────────────────────────────────────────┘- Estadísticas del sistema

```

## 🔌 API Routes

---

### Autenticación

## 📦 Instalación- `POST /api/auth/signin` - Iniciar sesión

- `POST /api/auth/signup` - Registrarse

### Prerrequisitos- `POST /api/auth/signout` - Cerrar sesión

- `GET /api/auth/user` - Obtener usuario actual

- Node.js 20+

- npm o yarn### Gestión

- Cuenta de Supabase- `GET /api/users` - Listar usuarios (admin)

- `POST /api/users` - Crear usuario (admin)

### Paso 1: Clonar el repositorio- `GET /api/courses` - Listar cursos

- `POST /api/courses` - Crear curso

```bash

git clone <repository-url>## 🎨 Tecnologías Utilizadas

cd epsilon-nextjs

```- **Frontend**: Next.js 15, React 19, TypeScript

- **Styling**: Styled Components, CSS Modules

### Paso 2: Instalar dependencias- **Backend**: Next.js API Routes

- **Base de Datos**: Supabase (PostgreSQL)

```bash- **Autenticación**: Supabase Auth

npm install- **Deployment**: Vercel (recomendado)

```

## 🚀 Deployment

### Paso 3: Configurar variables de entorno

### Vercel (Recomendado)

Crea un archivo `.env.local` en la raíz del proyecto:

1. Conectar el repositorio a Vercel

```env2. Configurar las variables de entorno

# Supabase Configuration3. Deploy automático

NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key### Variables de Entorno para Producción

```

```env

Obtén estas credenciales desde:NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase

👉 https://supabase.com/dashboard/project/_/settings/apiNEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase

SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio

### Paso 4: Configurar la base de datosNEXTAUTH_URL=https://tu-dominio.com

NEXTAUTH_SECRET=tu_secreto_produccion

Ejecuta las migraciones de Supabase:NODE_ENV=production

```

```bash

# Opción 1: Usar los scripts SQL directamente en Supabase Dashboard## 🤝 Contribuir

# 1. Abre tu proyecto en Supabase Dashboard

# 2. Ve a SQL Editor1. Fork el proyecto

# 3. Ejecuta los archivos en orden:2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)

#    - supabase-schema.sql3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)

#    - supabase/migrations/20250828_teacher_management_system.sql4. Push a la rama (`git push origin feature/AmazingFeature`)

#    - supabase/migrations/20250828_admin_enhancements.sql5. Abrir un Pull Request

#    - supabase/migrations/20250828_add_password_editing.sql

## 📄 Licencia

# Opción 2: Usar el script de setup

npm run setup-dbEste proyecto está bajo la Licencia MIT - ver el archivo `LICENSE` para detalles.

```

## 🆘 Soporte

### Paso 5: Crear usuarios demo (opcional)

Si tienes problemas o preguntas:

```bash

node create-demo-users.js1. Revisar la documentación de [Next.js](https://nextjs.org/docs)

```2. Consultar la [documentación de Supabase](https://supabase.com/docs)

3. Abrir un issue en el repositorio

### Paso 6: Iniciar el servidor de desarrollo

---

```bash

npm run dev**Epsilon Academy** - Transformando la educación con tecnología moderna 🎓

```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📁 Estructura del Proyecto

```
epsilon-nextjs/
├── public/                      # Archivos estáticos
│   └── assets/
│       └── images/              # Logos y recursos visuales
│
├── src/
│   ├── app/                     # App Router (Next.js 15)
│   │   ├── layout.tsx           # Layout principal con providers
│   │   ├── page.tsx             # Página principal (redirect a login)
│   │   ├── globals.css          # Estilos globales
│   │   │
│   │   ├── admin/               # Rutas de admin
│   │   │   └── page.tsx
│   │   ├── teacher/             # Rutas de teacher
│   │   │   └── page.tsx
│   │   ├── student/             # Rutas de student
│   │   │   └── page.tsx
│   │   ├── login/               # Página de login
│   │   │   └── page.tsx
│   │   │
│   │   └── api/                 # API Routes
│   │       ├── auth/
│   │       ├── courses/
│   │       ├── users/
│   │       └── update-password/
│   │
│   ├── components/              # Componentes React
│   │   ├── admin/               # Componentes de admin
│   │   ├── teacher/             # Componentes de profesor
│   │   ├── student/             # Componentes de estudiante
│   │   ├── auth/                # Componentes de autenticación
│   │   └── common/              # Componentes compartidos
│   │
│   ├── lib/                     # Librerías y utilidades
│   │   ├── auth/
│   │   │   └── AuthContext.tsx  # Context de autenticación
│   │   └── supabase/
│   │       ├── client.ts        # Cliente de Supabase
│   │       └── middleware.ts    # Middleware de Supabase
│   │
│   ├── hooks/                   # Custom Hooks
│   │   └── useUserRole.ts       # Hook para obtener rol del usuario
│   │
│   ├── themes/                  # Sistema de temas
│   │   ├── ThemeContext.tsx     # Context de tema (dark/light)
│   │   └── colors.js            # Paleta de colores
│   │
│   └── utils/
│       └── paths.js             # Utilidades de rutas
│
├── supabase/
│   ├── config.toml              # Configuración local de Supabase
│   └── migrations/              # Migraciones SQL
│
├── scripts/                     # Scripts de utilidad
│   ├── setup-db.js              # Setup inicial de BD
│   └── migrate.ts               # Ejecutar migraciones
│
├── middleware.ts                # Middleware de Next.js
├── next.config.ts               # Configuración de Next.js
├── tsconfig.json                # Configuración de TypeScript
├── tailwind.config.js           # Configuración de Tailwind
├── package.json
└── .env.local                   # Variables de entorno (no commitear)
```

---

## 🔐 Sistema de Roles

### 1. **Administrador (Admin)**

**Permisos:**
- ✅ Acceso completo al sistema
- ✅ Crear, editar y eliminar profesores
- ✅ Crear, editar y eliminar estudiantes
- ✅ Ver estadísticas globales
- ✅ Gestionar configuraciones del sistema

**Dashboard:** `/admin`

---

### 2. **Profesor (Teacher)**

**Permisos:**
- ✅ Crear y gestionar sus propios cursos
- ✅ Ver y gestionar estudiantes asignados
- ✅ Crear lecciones y asignaciones
- ✅ Calificar trabajos de estudiantes
- ✅ Chat con estudiantes asignados
- ❌ No puede acceder a datos de otros profesores

**Dashboard:** `/teacher`

**Componentes principales:**
- `CourseManager.tsx` - Gestión de cursos
- `StudentManager.tsx` - Gestión de estudiantes
- `GroupManager.tsx` - Gestión de grupos
- `EvaluationsManager.tsx` - Evaluaciones
- `LiveClassesManager.tsx` - Clases en vivo
- `TeacherChatCenter.tsx` - Centro de mensajería

---

### 3. **Estudiante (Student)**

**Permisos:**
- ✅ Ver cursos en los que está inscrito
- ✅ Acceder a lecciones y materiales
- ✅ Entregar asignaciones
- ✅ Chat con su profesor asignado
- ❌ No puede ver cursos de otros profesores

**Dashboard:** `/student`

---

## 🗄 Base de Datos

### Tablas Principales

#### **profiles**
Extiende `auth.users` de Supabase.

```sql
profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT,                    -- 'admin' | 'teacher' | 'student'
  avatar_url TEXT,
  created_at TIMESTAMP
)
```

#### **teachers**
Información específica de profesores.

```sql
teachers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  specialization TEXT,
  department TEXT,
  is_active BOOLEAN DEFAULT true
)
```

#### **students**
Estudiantes con asignación a profesores.

```sql
students (
  id UUID PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  teacher_id UUID,              -- FK a teachers
  status TEXT,
  progress INTEGER
)
```

#### **courses**
Cursos creados por profesores.

```sql
courses (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID,
  teacher_id UUID,
  category TEXT,
  difficulty_level TEXT,
  is_published BOOLEAN,
  thumbnail_url TEXT
)
```

#### **enrollments**
Inscripciones de estudiantes.

```sql
enrollments (
  id UUID PRIMARY KEY,
  course_id UUID,
  student_id UUID,
  progress INTEGER,
  enrolled_at TIMESTAMP,
  UNIQUE(course_id, student_id)
)
```

#### **lessons**
Lecciones dentro de cursos.

```sql
lessons (
  id UUID PRIMARY KEY,
  course_id UUID,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  order_index INTEGER
)
```

#### **assignments**
Tareas y asignaciones.

```sql
assignments (
  id UUID PRIMARY KEY,
  course_id UUID,
  lesson_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  max_points INTEGER
)
```

#### **submissions**
Entregas de estudiantes.

```sql
submissions (
  id UUID PRIMARY KEY,
  assignment_id UUID,
  student_id UUID,
  content TEXT,
  file_urls TEXT[],
  points_earned INTEGER,
  feedback TEXT
)
```

### Row Level Security (RLS)

Todas las tablas tienen políticas RLS:

```sql
-- Solo el profesor puede ver sus estudiantes
CREATE POLICY "Teachers can view own students"
ON students FOR SELECT
USING (teacher_id = auth.uid());

-- Admins pueden ver todo
CREATE POLICY "Admins can view all"
ON students FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

## 👤 Usuarios Demo

Después de ejecutar `create-demo-users.js`:

| Rol | Email | Password |
|-----|-------|----------|
| **Admin** | admin.demo@epsilon.com | demo123 |
| **Teacher** | teacher.demo@epsilon.com | demo123 |
| **Student** | student.demo@epsilon.com | demo123 |

**⚠️ Cambia estas contraseñas en producción.**

---

## 🎨 Temas y Diseño

### Sistema de Temas

**Context:** `src/themes/ThemeContext.tsx`

**Uso:**
```tsx
import { useTheme } from '@/themes/ThemeContext';

function MyComponent() {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  
  return (
    <div style={{ background: theme.colors.current.background.primary }}>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

### Paleta de Colores

```javascript
primary: {
  kids: '#F0E23D',           // E-KIDS PRIMARIA
  bachillerato: '#F7750b',   // BACHILLERATO
  preU: '#6969bc',           // Pre-U UNIVERSITARIOS
  profes: '#087799',         // Profes
}
```

---

## 🔌 API Routes

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Cursos
- `GET /api/courses` - Listar cursos
- `POST /api/courses` - Crear curso (Teacher/Admin)
- `PUT /api/courses/[id]` - Actualizar curso
- `DELETE /api/courses/[id]` - Eliminar curso

### Usuarios
- `GET /api/users` - Listar usuarios (Admin)
- `POST /api/users` - Crear usuario (Admin)
- `POST /api/update-password` - Actualizar contraseña

---

## 📝 Sistema de Evaluaciones

Epsilon Academy tiene **DOS sistemas de evaluación separados**:

### 🎯 QUIZZES (Evaluaciones de Curso)
Evaluaciones vinculadas a cursos específicos para medir el aprendizaje.

**Características:**
- ✅ Vinculados a un curso específico
- ✅ Solo visible para estudiantes inscritos
- ✅ Forma parte de la calificación del curso
- ✅ Fechas de disponibilidad configurables
- ✅ Sin costo adicional (incluido en el curso)

**Tipos de preguntas:**
- Opción única (multiple choice)
- Opción múltiple (multiple select)
- Verdadero/Falso
- Respuesta corta
- Ensayo

**Componentes:**
- `QuizBuilder.tsx` - Constructor para profesores
- `QuizViewer.tsx` - Interfaz para estudiantes

**Base de datos:**
```
quizzes
├── quiz_questions
│   └── quiz_question_options
├── quiz_attempts
└── quiz_student_answers
```

### 🏆 SIMULACROS (Exámenes de Práctica)
Exámenes de práctica **independientes de cursos** para preparación.

**Características:**
- ✅ NO vinculados a cursos (standalone)
- ✅ Sistema de suscripciones (free/basic/premium/enterprise)
- ✅ Disponible para todos los usuarios
- ✅ Simulacros de muestra gratuitos
- ✅ Temporizador estricto con auto-envío
- ✅ Estadísticas globales

**Planes de suscripción:**
| Plan | Simulacros/mes | Precio |
|------|----------------|--------|
| Free | 5 | Gratis |
| Basic | 20 | $X/mes |
| Premium | Ilimitados | $XX/mes |
| Enterprise | Ilimitados + Custom | $XXX/mes |

**Componentes:**
- `SimulacroBuilder.tsx` - Constructor para profesores
- `SimulacroViewer.tsx` - Interfaz con temporizador

**Base de datos:**
```
subscriptions
simulacros
├── simulacro_questions
│   └── question_options
├── simulacro_attempts
└── student_answers
```

### 🖼️ Soporte de Imágenes

**AMBOS sistemas** soportan:
- ✅ Imágenes en preguntas
- ✅ Imágenes en opciones de respuesta
- ✅ Imágenes en explicaciones
- ✅ Portada de simulacro (solo simulacros)

### 📚 Documentación Detallada

Para más información sobre las diferencias y casos de uso:
- 📖 Ver `QUIZZES_VS_SIMULACROS.md` - Comparación completa
- 📊 Ver `ARQUITECTURA_EVALUACIONES.txt` - Diagramas visuales

### 🗄️ Migraciones

```bash
supabase/migrations/
├── 20250107_quizzes_system.sql      # Sistema de Quizzes
└── 20250107_simulacros_system.sql   # Sistema de Simulacros
```

**Ejecutar migraciones:**
1. Ir al panel de Supabase
2. SQL Editor
3. Ejecutar ambos archivos en orden

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run dev:turbo        # Iniciar con Turbopack

# Producción
npm run build            # Compilar para producción
npm run start            # Iniciar servidor de producción

# Otros
npm run lint             # Ejecutar ESLint
npm run setup-db         # Configurar base de datos
```

---

## 🐛 Problemas Comunes

### Error: "Invalid hook call"

**Solución:**
```bash
npm ls react react-dom
npm uninstall @supabase/auth-ui-react
npm install
```

### Error: "Supabase URL required"

**Solución:**
1. Verifica que `.env.local` exista
2. Reinicia el servidor
3. Verifica las credenciales

---

## 🗺 Roadmap

### Versión 1.1
- [ ] Notificaciones en tiempo real
- [ ] Videollamadas integradas
- [ ] Sistema de foros
- [ ] Reportes en PDF

### Versión 2.0
- [ ] IA para recomendación
- [ ] Gamificación
- [ ] App móvil

---

## 📞 Soporte

- Crea un issue en el repositorio
- Consulta la [documentación de Next.js](https://nextjs.org/docs)
- Consulta la [documentación de Supabase](https://supabase.com/docs)

---

**Desarrollado con ❤️ por el equipo de Epsilon Academy**
