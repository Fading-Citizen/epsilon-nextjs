import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface TeacherRecord {
  id: string;
  name: string | null;
  email?: string | null;
}

/**
 * Hook para obtener listado de profesores desde Supabase.
 * Estrategia:
 * 1. Intenta tabla `teachers` (id,name,email)
 * 2. Si vacía o error: intenta `profiles` filtrando role='teacher'
 * 3. Fallback mock mínimo para no romper UI
 */
export function useTeachers() {
  const supabase = createClient();
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError(null);
      // Try teachers table
      const tryTables: Array<() => Promise<TeacherRecord[]>> = [
        async () => {
          const { data, error } = await supabase.from('teachers').select('id,name,email').limit(200);
          if (error) throw error;
          return (data || []).map(r => ({ id: r.id as string, name: (r as any).name, email: (r as any).email }));
        },
        async () => {
          const { data, error } = await supabase.from('profiles').select('id,full_name,role,email').eq('role','teacher').limit(200);
          if (error) throw error;
          return (data || []).map(r => ({ id: (r as any).id, name: (r as any).full_name, email: (r as any).email }));
        }
      ];
      for (const fn of tryTables) {
        try {
          const list = await fn();
          if (!cancelled && list.length) { setTeachers(list); setLoading(false); return; }
        } catch (e) {
          // continue
        }
      }
      if (!cancelled) {
        // Fallback mock
        setTeachers([
          { id: 't1', name: 'Prof. Juan Pérez' },
          { id: 't2', name: 'Prof. Laura Martínez' },
          { id: 't3', name: 'Prof. Carlos Ruiz' }
        ]);
        setLoading(false);
        setError('Usando lista de profesores mock (configure tablas)');
      }
    }
    load();
    return () => { cancelled = true; };
  }, [supabase]);

  return { teachers, loading, error };
}
