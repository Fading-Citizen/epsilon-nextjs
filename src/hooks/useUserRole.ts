import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export type UserRole = 'admin' | 'student' | null;

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
}

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setUserRole(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }

        // First try to get from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
          setUserRole(profile.role);
          setLoading(false);
          return;
        }

        // If not in profiles, check if they are an admin (teacher)
        const { data: teacher, error: teacherError } = await supabase
          .from('teachers')
          .select('id, name, email')
          .eq('id', user.id)
          .single();

        if (teacher) {
          const teacherProfile: UserProfile = {
            id: teacher.id,
            email: teacher.email,
            full_name: teacher.name,
            role: 'admin'
          };
          setUserProfile(teacherProfile);
          setUserRole('admin');
          setLoading(false);
          return;
        }

        // If not a teacher, check if they are a student
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('id, name, email')
          .eq('id', user.id)
          .single();

        if (student) {
          const studentProfile: UserProfile = {
            id: student.id,
            email: student.email,
            full_name: student.name,
            role: 'student'
          };
          setUserProfile(studentProfile);
          setUserRole('student');
          setLoading(false);
          return;
        }

        // Default to null if not found in any table
        setUserRole(null);
        setUserProfile(null);
        setLoading(false);

      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadUserRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          loadUserRole();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = userRole === 'admin';
  const isTeacher = userRole === 'admin'; // Alias for backwards compatibility
  const isStudent = userRole === 'student';

  const hasRole = (requiredRole: UserRole | UserRole[]) => {
    if (!userRole) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    
    return userRole === requiredRole;
  };

  const canManageUsers = isAdmin;
  const canManageCourses = isAdmin || isTeacher;
  const canViewCourses = isAdmin || isTeacher || isStudent;

  return {
    userRole,
    userProfile,
    loading,
    error,
    isAdmin,
    isTeacher,
    isStudent,
    hasRole,
    canManageUsers,
    canManageCourses,
    canViewCourses
  };
}
