/**
 * EJEMPLOS DE USO DEL MODO SKIP
 * 
 * Este archivo contiene ejemplos de cómo implementar el modo Skip
 * en diferentes componentes de la aplicación.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSkipMode, useSkipData } from '@/hooks/useSkipMode';
import { createClient } from '@/lib/supabase/client';

// ============================================================================
// EJEMPLO 1: Verificación básica del modo skip
// ============================================================================

export function ExampleBasicSkipCheck() {
  const { isSkipMode, skipRole, skipUser } = useSkipMode();

  if (isSkipMode) {
    return (
      <div>
        <h2>⚡ Modo Skip Activo</h2>
        <p>Usuario: {skipUser?.name}</p>
        <p>Rol: {skipRole}</p>
      </div>
    );
  }

  return <div>Modo normal con base de datos</div>;
}

// ============================================================================
// EJEMPLO 2: Obtener datos con fallback a mock
// ============================================================================

interface Simulacro {
  id: string;
  title: string;
  score: number;
}

export function ExampleDataFetching() {
  const supabase = createClient();

  // Datos mock para desarrollo
  const mockSimulacros: Simulacro[] = [
    { id: '1', title: 'Simulacro ICFES - Matemáticas', score: 85 },
    { id: '2', title: 'Simulacro ICFES - Lectura', score: 90 },
    { id: '3', title: 'Simulacro ICFES - Ciencias', score: 78 }
  ];

  // Usar el hook personalizado
  const { data, loading, error } = useSkipData(
    async () => {
      // Función para obtener datos reales
      const { data, error } = await supabase
        .from('simulacros')
        .select('*');
      
      if (error) throw error;
      return data as Simulacro[];
    },
    mockSimulacros // Datos mock
  );

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map((simulacro: Simulacro) => (
        <div key={simulacro.id}>
          <h3>{simulacro.title}</h3>
          <p>Puntaje: {simulacro.score}%</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// EJEMPLO 3: Manejo manual con if/else
// ============================================================================

interface Course {
  id: number;
  name: string;
}

interface CoursesData {
  courses: Course[];
}

export function ExampleManualHandling() {
  const { isSkipMode } = useSkipMode();
  const supabase = createClient();
  const [data, setData] = useState<CoursesData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (isSkipMode) {
        // Usar datos mock
        console.log('🚀 Skip Mode: Usando datos mock');
        setData({
          courses: [
            { id: 1, name: 'ICFES Matemáticas' },
            { id: 2, name: 'ICFES Lectura Crítica' }
          ]
        });
      } else {
        // Llamada real a Supabase
        try {
          const { data, error } = await supabase
            .from('courses')
            .select('*');
          
          if (error) throw error;
          setData({ courses: data as Course[] });
        } catch (error) {
          console.error('Error al cargar cursos:', error);
        }
      }
    };

    loadData();
  }, [isSkipMode]);

  return (
    <div>
      {data?.courses.map((course: Course) => (
        <div key={course.id}>{course.name}</div>
      ))}
    </div>
  );
}

// ============================================================================
// EJEMPLO 4: Proteger rutas según el rol
// ============================================================================

export function ExampleRoleProtection() {
  const { isSkipMode, skipRole } = useSkipMode();
  const supabase = createClient();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      if (isSkipMode) {
        // En modo skip, usar el rol del localStorage
        setUserRole(skipRole);
      } else {
        // En modo normal, obtener del contexto de autenticación
        try {
          const { data: { user } } = await supabase.auth.getUser();
          const { data } = await supabase
            .from('users')
            .select('role')
            .eq('id', user?.id)
            .single();
          
          setUserRole(data?.role as string);
        } catch (error) {
          console.error('Error al verificar rol:', error);
        }
      }
    };

    checkRole();
  }, [isSkipMode, skipRole]);

  if (userRole !== 'admin') {
    return <div>⛔ Acceso denegado. Solo para administradores.</div>;
  }

  return <div>✅ Bienvenido al panel de administración</div>;
}

// ============================================================================
// EJEMPLO 5: Componente con datos de perfil
// ============================================================================

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  streak: number;
  coursesCompleted: number;
  totalPoints: number;
}

export function ExampleUserProfile() {
  const { isSkipMode, skipUser } = useSkipMode();
  const supabase = createClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (isSkipMode) {
        // Datos mock del perfil
        setProfile({
          name: skipUser?.name || 'Usuario Demo',
          email: skipUser?.email || 'demo@skip.local',
          avatar: '/assets/images/default-avatar.png',
          streak: 7,
          coursesCompleted: 5,
          totalPoints: 1250
        });
      } else {
        // Cargar perfil real desde Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user?.id)
            .single();
          
          setProfile(data as UserProfile);
        } catch (error) {
          console.error('Error al cargar perfil:', error);
        }
      }
    };

    loadProfile();
  }, [isSkipMode, skipUser]);

  if (!profile) return <div>Cargando perfil...</div>;

  return (
    <div>
      <h2>{profile.name}</h2>
      <p>{profile.email}</p>
      <div>🔥 Racha: {profile.streak} días</div>
      <div>📚 Cursos completados: {profile.coursesCompleted}</div>
      <div>⭐ Puntos totales: {profile.totalPoints}</div>
    </div>
  );
}

// ============================================================================
// EJEMPLO 6: Deshabilitar funcionalidades que requieren BD
// ============================================================================

export function ExampleDisabledFeatures() {
  const { isSkipMode } = useSkipMode();
  const supabase = createClient();

  const handleSaveProgress = async () => {
    if (isSkipMode) {
      alert('⚠️ Esta función requiere base de datos y no está disponible en modo Skip');
      return;
    }

    // Guardar progreso real
    try {
      await supabase
        .from('progress')
        .insert({ /* datos */ });
      
      alert('✅ Progreso guardado');
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  return (
    <div>
      <button 
        onClick={handleSaveProgress}
        disabled={isSkipMode}
        title={isSkipMode ? 'No disponible en modo Skip' : 'Guardar progreso'}
      >
        {isSkipMode ? '🚫 Guardar (Deshabilitado)' : '💾 Guardar Progreso'}
      </button>
      
      {isSkipMode && (
        <p style={{ color: 'orange', fontSize: '12px' }}>
          ⚠️ Algunas funciones están deshabilitadas en modo Skip
        </p>
      )}
    </div>
  );
}

// ============================================================================
// EJEMPLO 7: Simular delays de red en modo skip
// ============================================================================

interface MessageData {
  message: string;
}

export function ExampleWithDelay() {
  const { isSkipMode } = useSkipMode();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MessageData | null>(null);

  const fetchData = async () => {
    setLoading(true);

    if (isSkipMode) {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData({ message: 'Datos mock con delay simulado' });
    } else {
      const { data: resultData } = await supabase.from('table').select();
      setData(resultData ? { message: JSON.stringify(resultData) } : null);
    }

    setLoading(false);
  };

  return (
    <div>
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Cargando...' : 'Cargar Datos'}
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

// ============================================================================
// EJEMPLO 8: Limpiar modo skip y volver al login
// ============================================================================

export function ExampleExitSkip() {
  const { isSkipMode, clearSkipMode } = useSkipMode();

  const handleExitSkip = () => {
    if (confirm('¿Salir del modo Skip y volver al login?')) {
      clearSkipMode();
      window.location.href = '/login';
    }
  };

  if (!isSkipMode) {
    return null;
  }

  return (
    <button onClick={handleExitSkip}>
      🚪 Salir del Modo Skip
    </button>
  );
}

// ============================================================================
// MEJORES PRÁCTICAS
// ============================================================================

/*

✅ DO - Buenas prácticas:

1. Siempre verifica isSkipMode antes de llamadas a Supabase
2. Proporciona datos mock realistas para pruebas efectivas
3. Muestra indicadores visuales cuando estés en modo skip
4. Deshabilita funciones que no tienen sentido sin BD
5. Usa el hook useSkipMode() para consistencia

❌ DON'T - Evita:

1. Dejar console.log() del modo skip en producción
2. Asumir que los datos mock tienen la misma estructura que los reales
3. Hacer que features críticas dependan de skip mode
4. Olvidar manejar el caso de carga (loading state)
5. Habilitar NEXT_PUBLIC_SKIP_AUTH=true en producción

*/
