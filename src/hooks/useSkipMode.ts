/**
 * Hook para manejar el modo Skip (desarrollo sin base de datos)
 * 
 * Uso:
 * ```typescript
 * const { isSkipMode, skipRole, skipUser, clearSkipMode } = useSkipMode();
 * 
 * if (isSkipMode) {
 *   // Usar datos mock
 *   return mockData;
 * } else {
 *   // Llamada real a base de datos
 *   const data = await fetchFromSupabase();
 *   return data;
 * }
 * ```
 */

'use client';

import { useEffect, useState } from 'react';

interface SkipUser {
  id: string;
  email: string;
  role: 'student' | 'admin';
  name: string;
}

interface UseSkipModeReturn {
  isSkipMode: boolean;
  skipRole: 'student' | 'admin' | null;
  skipUser: SkipUser | null;
  clearSkipMode: () => void;
  isLoading: boolean;
}

export function useSkipMode(): UseSkipModeReturn {
  const [isSkipMode, setIsSkipMode] = useState(false);
  const [skipRole, setSkipRole] = useState<'student' | 'admin' | null>(null);
  const [skipUser, setSkipUser] = useState<SkipUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      const skipModeActive = localStorage.getItem('skipMode') === 'true';
      const role = localStorage.getItem('skipRole') as 'student' | 'admin' | null;
      const userJson = localStorage.getItem('skipUser');
      
      setIsSkipMode(skipModeActive);
      setSkipRole(role);
      
      if (userJson) {
        setSkipUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Error al leer skip mode desde localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSkipMode = () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('skipMode');
    localStorage.removeItem('skipRole');
    localStorage.removeItem('skipUser');
    
    setIsSkipMode(false);
    setSkipRole(null);
    setSkipUser(null);
  };

  return {
    isSkipMode,
    skipRole,
    skipUser,
    clearSkipMode,
    isLoading
  };
}

/**
 * Hook para obtener datos mock cuando se está en modo skip
 * 
 * Uso:
 * ```typescript
 * const data = useSkipData(
 *   () => fetchRealData(), // Función que obtiene datos reales
 *   mockData               // Datos mock para skip mode
 * );
 * ```
 */
export function useSkipData<T>(
  fetchRealData: () => Promise<T>,
  mockData: T
): { data: T | null; loading: boolean; error: Error | null } {
  const { isSkipMode } = useSkipMode();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (isSkipMode) {
          // Simular delay de red
          await new Promise(resolve => setTimeout(resolve, 300));
          setData(mockData);
        } else {
          const result = await fetchRealData();
          setData(result);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isSkipMode]);

  return { data, loading, error };
}
