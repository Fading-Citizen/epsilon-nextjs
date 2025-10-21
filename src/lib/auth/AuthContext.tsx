'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  
  // Detectar si el modo skip está habilitado
  const skipAuthEnabled = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';

  useEffect(() => {
    // Si skip mode está activo, no hacer llamadas a Supabase
    if (skipAuthEnabled) {
      console.log('🚀 Skip Mode: AuthContext bypassed');
      setLoading(false);
      return;
    }

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, skipAuthEnabled]);

  const signIn = async (email: string, password: string) => {
    // Si skip mode está activo, retornar éxito falso para que use los botones de skip
    if (skipAuthEnabled) {
      console.log('🚀 Skip Mode: Use los botones de Skip en lugar del login normal');
      return { 
        data: null, 
        error: { 
          message: 'Modo Skip activo. Por favor usa los botones "⚡ Skip Estudiante" o "⚡ Skip Admin" para acceder.' 
        } 
      };
    }

    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (result.error) {
        console.error('Sign in error:', result.error);
      }
      
      return result;
    } catch (err) {
      console.error('Unexpected sign in error:', err);
      return { data: null, error: err };
    }
  };

  const signUp = async (email: string, password: string, metadata = {}) => {
    // Si skip mode está activo, no permitir registro
    if (skipAuthEnabled) {
      return { 
        data: null, 
        error: { message: 'Registro no disponible en modo Skip' } 
      };
    }

    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (result.error) {
        console.error('Sign up error:', result.error);
      }
      
      return result;
    } catch (err) {
      console.error('Unexpected sign up error:', err);
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    // Si skip mode está activo, limpiar localStorage
    if (skipAuthEnabled) {
      localStorage.removeItem('skipMode');
      localStorage.removeItem('skipRole');
      localStorage.removeItem('skipUser');
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
