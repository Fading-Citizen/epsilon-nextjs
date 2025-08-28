'use client'

import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import AdminPanel from '@/components/admin/AdminPanel';
import TeacherCourseManager from '@/components/teacher/TeacherCourseManager';
import TeacherChatCenter from '@/components/teacher/TeacherChatCenter';
import { BookOpen, MessageCircle, Users, Settings, Shield } from 'lucide-react';

export default function DashboardMain() {
  const { userRole, userProfile, loading, isAdmin, isTeacher, isStudent } = useUserRole();
  const [activeSection, setActiveSection] = React.useState('main');

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: '4px solid #e5e7eb', 
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ marginBottom: '1rem' }}>Acceso Denegado</h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            No tienes permisos para acceder a esta sección.
          </p>
          <button
            onClick={() => window.location.href = '/auth/login'}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (isAdmin) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <div style={{ 
          width: 250, 
          background: '#1f2937', 
          color: 'white',
          padding: '2rem 0'
        }}>
          <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
              Panel Admin
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#9ca3af', fontSize: '0.875rem' }}>
              {userProfile?.full_name || userProfile?.email}
            </p>
          </div>

          <nav>
            <button
              onClick={() => setActiveSection('users')}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: activeSection === 'users' ? '#374151' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Users size={20} />
              Gestión de Usuarios
            </button>
            
            <button
              onClick={() => setActiveSection('settings')}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: activeSection === 'settings' ? '#374151' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Settings size={20} />
              Configuración
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, background: '#f9fafb' }}>
          {activeSection === 'users' && <AdminPanel />}
          {activeSection === 'settings' && (
            <div style={{ padding: '2rem' }}>
              <h1>Configuración del Sistema</h1>
              <p>Próximamente...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Teacher Dashboard
  if (isTeacher) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <div style={{ 
          width: 250, 
          background: '#1e40af', 
          color: 'white',
          padding: '2rem 0'
        }}>
          <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
              Panel Profesor
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#bfdbfe', fontSize: '0.875rem' }}>
              {userProfile?.full_name || userProfile?.email}
            </p>
          </div>

          <nav>
            <button
              onClick={() => setActiveSection('courses')}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: activeSection === 'courses' ? '#1d4ed8' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <BookOpen size={20} />
              Mis Cursos
            </button>
            
            <button
              onClick={() => setActiveSection('chat')}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: activeSection === 'chat' ? '#1d4ed8' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <MessageCircle size={20} />
              Chat Estudiantes
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, background: '#f9fafb' }}>
          {activeSection === 'courses' && <TeacherCourseManager />}
          {activeSection === 'chat' && <TeacherChatCenter teacherId={userProfile?.id || ''} />}
        </div>
      </div>
    );
  }

  // Student Dashboard
  if (isStudent) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <div style={{ 
          width: 250, 
          background: '#059669', 
          color: 'white',
          padding: '2rem 0'
        }}>
          <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
              Panel Estudiante
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#a7f3d0', fontSize: '0.875rem' }}>
              {userProfile?.full_name || userProfile?.email}
            </p>
          </div>

          <nav>
            <button
              onClick={() => setActiveSection('courses')}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: activeSection === 'courses' ? '#047857' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <BookOpen size={20} />
              Mis Cursos
            </button>
            
            <button
              onClick={() => setActiveSection('chat')}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: activeSection === 'chat' ? '#047857' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <MessageCircle size={20} />
              Chat con Profesor
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, background: '#f9fafb' }}>
          {activeSection === 'courses' && (
            <div style={{ padding: '2rem' }}>
              <h1>Mis Cursos</h1>
              <p>Vista de cursos para estudiantes - próximamente...</p>
            </div>
          )}
          {activeSection === 'chat' && (
            <div style={{ padding: '2rem' }}>
              <h1>Chat con Profesor</h1>
              <p>Chat para estudiantes - próximamente...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
