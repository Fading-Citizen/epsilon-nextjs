# Epsilon Academy - Next.js App Router

Una plataforma educativa moderna construida con Next.js 15, Supabase, y styled-components.

## 🚀 Características

- **Next.js App Router**: Estructura moderna con App Router
- **Autenticación con Supabase**: Sistema completo de autenticación
- **Roles de Usuario**: Estudiante, Profesor, y Administrador
- **Dashboards Específicos**: Interfaces personalizadas por rol
- **API Routes**: Backend integrado con Next.js
- **Responsive Design**: Compatible con dispositivos móviles
- **TypeScript**: Tipado estático para mejor desarrollo

## 📋 Prerrequisitos

- Node.js 18.17 o superior
- npm o yarn
- Cuenta en Supabase

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <your-repo-url>
cd epsilon-nextjs
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Supabase**

   - Crear un proyecto en [Supabase](https://supabase.com)
   - Copiar la URL del proyecto y la clave anónima
   - Ejecutar el esquema SQL en el Editor SQL de Supabase (usar `supabase-schema.sql`)

4. **Configurar variables de entorno**

   Crear `.env.local` con:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secreto_nextauth
NODE_ENV=development
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

## 🗂️ Estructura del Proyecto

```
src/
├── app/                    # App Router pages
│   ├── api/               # API routes
│   ├── login/             # Página de login
│   ├── student/           # Dashboard del estudiante
│   ├── teacher/           # Dashboard del profesor
│   ├── admin/             # Dashboard del administrador
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de inicio
├── components/            # Componentes React
│   ├── auth/              # Componentes de autenticación
│   ├── student/           # Componentes del estudiante
│   ├── teacher/           # Componentes del profesor
│   ├── admin/             # Componentes del administrador
│   └── common/            # Componentes compartidos
├── lib/                   # Utilidades y configuraciones
│   ├── supabase/          # Cliente Supabase
│   └── auth/              # Context de autenticación
├── themes/                # Temas y estilos
└── utils/                 # Funciones utilitarias
```

## 🔐 Autenticación

La aplicación usa Supabase Auth con las siguientes características:

- **Registro e inicio de sesión** con email/contraseña
- **Roles de usuario** (student, teacher, admin)
- **Protección de rutas** con middleware
- **Usuarios demo** para pruebas

### Usuarios Demo

- **Estudiante**: `student.demo@epsilon.com` / `demo123`
- **Profesor**: `teacher.demo@epsilon.com` / `demo123`  
- **Administrador**: `admin.demo@epsilon.com` / `demo123`

## 📱 Páginas y Funcionalidades

### `/login`
- Formulario de autenticación
- Botones para usuarios demo
- Redirección basada en roles

### `/student`
- Dashboard del estudiante
- Vista de cursos inscritos
- Progreso y actividades

### `/teacher`
- Panel del profesor
- Gestión de cursos
- Estudiantes y calificaciones

### `/admin`
- Panel de administración
- Gestión de usuarios
- Estadísticas del sistema

## 🔌 API Routes

### Autenticación
- `POST /api/auth/signin` - Iniciar sesión
- `POST /api/auth/signup` - Registrarse
- `POST /api/auth/signout` - Cerrar sesión
- `GET /api/auth/user` - Obtener usuario actual

### Gestión
- `GET /api/users` - Listar usuarios (admin)
- `POST /api/users` - Crear usuario (admin)
- `GET /api/courses` - Listar cursos
- `POST /api/courses` - Crear curso

## 🎨 Tecnologías Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Styled Components, CSS Modules
- **Backend**: Next.js API Routes
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Deployment**: Vercel (recomendado)

## 🚀 Deployment

### Vercel (Recomendado)

1. Conectar el repositorio a Vercel
2. Configurar las variables de entorno
3. Deploy automático

### Variables de Entorno para Producción

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=tu_secreto_produccion
NODE_ENV=production
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo `LICENSE` para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisar la documentación de [Next.js](https://nextjs.org/docs)
2. Consultar la [documentación de Supabase](https://supabase.com/docs)
3. Abrir un issue en el repositorio

---

**Epsilon Academy** - Transformando la educación con tecnología moderna 🎓
