# Epsilon Academy - Sistema de Gestión Educativa

## 🎯 Descripción del Sistema

Epsilon Academy es una plataforma educativa completa que implementa un sistema de roles jerárquico para la gestión de profesores, estudiantes y cursos. La plataforma utiliza **Next.js**, **Supabase** y **TypeScript** para ofrecer una experiencia moderna y escalable.

## 🔐 Sistema de Roles

### **Administrador (Admin)**
- **Permisos completos del sistema**
- ✅ Crear y gestionar profesores
- ✅ Crear y gestionar estudiantes  
- ✅ Ver todas las actividades del sistema
- ✅ Configurar parámetros globales
- 🎯 **Panel**: `AdminPanel.tsx`

### **Profesor (Teacher)**
- **Gestión de cursos y estudiantes asignados**
- ✅ Crear y administrar cursos
- ✅ Asignar estudiantes a cursos
- ✅ Chat directo con estudiantes asignados
- ✅ Ver progreso de estudiantes
- 🎯 **Panel**: `TeacherCourseManager.tsx`, `TeacherChatCenter.tsx`

### **Estudiante (Student)**
- **Acceso a cursos asignados**
- ✅ Ver cursos inscritos
- ✅ Chat con profesor asignado
- ✅ Seguimiento de progreso personal
- 🎯 **Panel**: Dashboard de estudiante (en desarrollo)

## 🗄️ Estructura de la Base de Datos

### **Tablas Principales**

```sql
-- Perfiles de usuario con roles
profiles (id, email, full_name, role, avatar_url)

-- Profesores (extendiendo auth.users)
teachers (id, name, email, specialization, department, is_active)

-- Estudiantes con asignación a profesores
students (id, user_id, name, email, teacher_id, status, progress)

-- Cursos creados por profesores
courses (id, title, description, teacher_id, duration_hours, max_students)

-- Inscripciones de estudiantes a cursos
course_enrollments (id, course_id, student_id, progress, status)

-- Grupos de estudiantes
groups (id, name, description, teacher_id, student_count)

-- Membresías de grupos
group_members (group_id, student_id)

-- Sistema de mensajería
messages (id, channel, sender_id, content, created_at)
```

### **Seguridad RLS (Row Level Security)**

El sistema implementa políticas de seguridad a nivel de fila:

- **Admins**: Acceso completo a todas las tablas
- **Profesores**: Solo pueden ver/editar sus estudiantes y cursos asignados
- **Estudiantes**: Solo pueden ver sus propios datos y cursos inscritos

## 🚀 Instalación y Configuración

### **1. Configuración de Supabase**

```bash
# Aplicar la migración completa
psql -h [SUPABASE_HOST] -U postgres -d [DATABASE] -f apply_migration.sql
```

### **2. Variables de Entorno**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **3. Instalación de Dependencias**

```bash
npm install
npm run dev
```

## 📁 Estructura de Componentes

### **Administración**
```
src/components/admin/
├── AdminPanel.tsx              # Panel principal de administración
```

### **Profesores**
```
src/components/teacher/
├── TeacherCourseManager.tsx    # Gestión de cursos
├── TeacherChatCenter.tsx       # Centro de chat con estudiantes
└── StudentsManager.tsx         # Gestión de estudiantes asignados
```

### **Dashboard Principal**
```
src/components/dashboard/
├── DashboardMain.tsx           # Router principal por roles
```

### **Hooks Personalizados**
```
src/hooks/
├── useUserRole.ts              # Hook para gestión de roles
└── useTeachers.ts              # Hook para obtener profesores
```

## 🎮 Funcionalidades Principales

### **Para Administradores**
1. **Gestión de Profesores**:
   - Crear nuevos profesores con credenciales
   - Asignar especializaciones y departamentos
   - Activar/desactivar cuentas

2. **Gestión de Estudiantes**:
   - Registrar nuevos estudiantes
   - Asignar estudiantes a profesores
   - Monitorear progreso general

### **Para Profesores**
1. **Gestión de Cursos**:
   - Crear cursos con duración y límites
   - Establecer fechas de inicio/fin
   - Gestionar estados (borrador/activo/completado)

2. **Gestión de Estudiantes**:
   - Ver lista de estudiantes asignados
   - Inscribir estudiantes en cursos
   - Monitorear progreso individual

3. **Sistema de Chat**:
   - Chat directo 1:1 con estudiantes asignados
   - Historial de conversaciones
   - Notificaciones en tiempo real

### **Para Estudiantes**
1. **Vista de Cursos**:
   - Lista de cursos inscritos
   - Progreso personal
   - Información de profesor asignado

2. **Chat con Profesor**:
   - Comunicación directa con profesor asignado
   - Consultas y seguimiento académico

## 🔧 Configuración Inicial

### **1. Crear Usuario Administrador**

```sql
-- 1. Registrar usuario en Supabase Auth
-- 2. Obtener el ID del usuario
-- 3. Insertar en tabla profiles
INSERT INTO public.profiles (id, email, full_name, role) 
VALUES ('user_id_from_auth', 'admin@epsilon.com', 'Administrador', 'admin');
```

### **2. Configurar Primer Profesor**

```sql
-- El admin puede crear profesores desde el AdminPanel
-- O manualmente:
INSERT INTO public.teachers (id, name, email, specialization) 
VALUES ('teacher_auth_id', 'Profesor Principal', 'profesor@epsilon.com', 'Matemáticas');

INSERT INTO public.profiles (id, email, full_name, role) 
VALUES ('teacher_auth_id', 'profesor@epsilon.com', 'Profesor Principal', 'teacher');
```

### **3. Datos de Prueba**

El sistema incluye datos de muestra que se pueden activar ejecutando:

```sql
SELECT insert_sample_data();
```

## 🔄 Flujo de Trabajo

### **Flujo de Administrador**
1. Login → Dashboard Admin
2. Crear Profesores → Asignar especializaciones
3. Crear Estudiantes → Asignar a profesores
4. Monitorear actividad general

### **Flujo de Profesor**
1. Login → Dashboard Profesor
2. Crear Cursos → Configurar detalles
3. Inscribir Estudiantes → Asignar a cursos
4. Chat con Estudiantes → Seguimiento personalizado

### **Flujo de Estudiante**
1. Login → Dashboard Estudiante
2. Ver Cursos Asignados → Revisar progreso
3. Chat con Profesor → Consultas académicas

## 🛡️ Seguridad

- **Autenticación**: Supabase Auth con JWT
- **Autorización**: RLS policies basadas en roles
- **Validación**: Checks a nivel de base de datos
- **Sanitización**: Validación de entrada en componentes

## 📊 Características Técnicas

- ⚡ **Performance**: Indexes optimizados para consultas por rol
- 🔄 **Real-time**: Suscripciones Supabase para chat
- 🎨 **UI/UX**: Componentes responsivos con Lucide Icons
- 🔧 **TypeScript**: Tipado estricto en toda la aplicación
- 📱 **Responsive**: Adaptable a dispositivos móviles

## 🚧 Desarrollo Futuro

### **Próximas Funcionalidades**
- [ ] Dashboard completo para estudiantes
- [ ] Sistema de evaluaciones y calificaciones
- [ ] Notificaciones push
- [ ] Calendario de clases
- [ ] Reportes y analytics
- [ ] Integración con sistemas externos

### **Mejoras Técnicas**
- [ ] Cache optimizado
- [ ] Offline support
- [ ] PWA capabilities
- [ ] Internacionalización (i18n)

## 📞 Soporte

Para consultas técnicas o reportar problemas:
- Revisa la documentación de componentes
- Verifica las políticas RLS en Supabase
- Consulta los logs de desarrollo con `npm run dev`

---

**✨ Epsilon Academy - Transformando la educación con tecnología moderna**
