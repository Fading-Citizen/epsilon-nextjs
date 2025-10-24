'use client'

import React, { useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { 
  User, 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  Bell,
  MessageSquare,
  TrendingUp,
  Award,
  Calendar,
  FileText,
  Search,
  Filter,
  Grid,
  List,
  Download,
  Upload,
  Edit,
  Eye,
  Trash2,
  Sun,
  Moon,
  LogOut,
  Video,
  Shield,
  Package,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../themes/ThemeContext';
import CourseManager from './CourseManager';
import CourseEditor from './CourseEditor';
import EvaluationsManager from './EvaluationsManager';
import QuizBuilder from './QuizBuilder';
import SimulacroBuilder from './SimulacroBuilder';
import LiveClassesManager from './LiveClassesManager';
import StudentsManager from './StudentsManager';
import GroupManager from './GroupManager';
import AdminChatCenter from './AdminChatCenter';
import ServicesManager from './ServicesManager';
import UserManagement from './UserManagement';
import StudentReportsManager from './StudentReportsManager';
import EvaluationStatistics from './EvaluationStatistics';

interface AdminDashboardProps {
  user: SupabaseUser;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user: currentUser }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const { signOut } = useAuth();
  const router = useRouter();
  const [showCourseEditor, setShowCourseEditor] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [showSimulacroBuilder, setShowSimulacroBuilder] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<any | null>(null);
  const [editingSimulacro, setEditingSimulacro] = useState<any | null>(null);
  const [coursesViewMode, setCoursesViewMode] = useState<'cards' | 'list'>('cards');
  const [evaluationsViewMode, setEvaluationsViewMode] = useState<'cards' | 'list'>('cards');
  const [simulacrosViewMode, setSimulacrosViewMode] = useState<'cards' | 'list'>('cards');
  const [courseFilters, setCourseFilters] = useState({ search: '', category: 'all', status: 'all', sortBy: 'date' });
  const [evaluationFilters, setEvaluationFilters] = useState({ search: '', type: 'all', status: 'all', course: 'all', sortBy: 'date' });

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (e) {
      console.error('Error al cerrar sesión', e);
    }
  };

  const navigationItems = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'courses', label: 'Cursos', icon: BookOpen },
    { id: 'live-classes', label: 'Clases en Vivo', icon: Video },
    { id: 'evaluations', label: 'Quizzes (Cursos)', icon: FileText },
    { id: 'simulacros', label: 'Simulacros (Práctica)', icon: Award },
    { id: 'students', label: 'Estudiantes', icon: Users },
    { id: 'groups', label: 'Grupos', icon: Shield },
    { id: 'teachers', label: 'Administradores', icon: UserPlus },
    { id: 'services', label: 'Servicios', icon: Package },
    { id: 'statistics', label: 'Estadísticas', icon: BarChart3 },
    { id: 'student-reports', label: 'Informes Simulacros', icon: TrendingUp },
    { id: 'messages', label: 'Mensajes', icon: MessageSquare },
    { id: 'profile', label: 'Perfil', icon: User }
  ];

  const mockStats = {
    totalStudents: 142,
    activeCourses: 8,
    pendingEvaluations: 23,
    completionRate: 78,
    liveClasses: 5,
    upcomingClasses: 3,
    activeGroups: 4,
    totalGroups: 6
  };

  // Helper function for consistent card styling
  const getCardStyle = (isActive = false) => ({
    background: theme.colors.current.background.secondary,
    border: `1px solid ${theme.colors.current.border.primary}`,
    borderRadius: '16px',
    padding: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  });

  const getCardHoverHandlers = () => ({
    onMouseOver: (e: any) => {
      e.currentTarget.style.background = theme.colors.current.background.tertiary;
      e.currentTarget.style.transform = 'translateY(-2px)';
    },
    onMouseOut: (e: any) => {
      e.currentTarget.style.background = theme.colors.current.background.secondary;
      e.currentTarget.style.transform = 'translateY(0)';
    }
  });

  const getIconContainerStyle = () => ({
    width: '60px',
    height: '60px',
    background: theme.colors.current.background.tertiary,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  const getCardTitleStyle = () => ({
    margin: '0 0 0.5rem 0',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: theme.colors.current.text.primary
  });

  const getCardSubtitleStyle = () => ({
    margin: 0,
    color: theme.colors.current.text.secondary
  });

  const renderOverview = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        <div style={{
          background: theme.colors.current.background.secondary,
          border: `1px solid ${theme.colors.current.border.primary}`,
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          transition: 'all 0.3s ease'
        }} onMouseOver={(e) => {
          e.currentTarget.style.background = theme.colors.current.background.tertiary;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }} onMouseOut={(e) => {
          e.currentTarget.style.background = theme.colors.current.background.secondary;
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: theme.colors.current.background.tertiary,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3b82f6'
          }}>
            <Users size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold', color: theme.colors.current.text.primary }}>{mockStats.totalStudents}</h3>
            <p style={{ margin: 0, color: theme.colors.current.text.secondary }}>Estudiantes Totales</p>
          </div>
          <div style={{ 
            background: '#dcfce7',
            color: '#166534',
            padding: '0.25rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>+12%</div>
        </div>
        
        <div style={{
          background: theme.colors.current.background.secondary,
          border: `1px solid ${theme.colors.current.border.primary}`,
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          transition: 'all 0.3s ease'
        }} onMouseOver={(e) => {
          e.currentTarget.style.background = theme.colors.current.background.tertiary;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }} onMouseOut={(e) => {
          e.currentTarget.style.background = theme.colors.current.background.secondary;
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: theme.colors.current.background.tertiary,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8b5cf6'
          }}>
            <BookOpen size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold', color: theme.colors.current.text.primary }}>{mockStats.activeCourses}</h3>
            <p style={{ margin: 0, color: theme.colors.current.text.secondary }}>Cursos Activos</p>
          </div>
          <div style={{ 
            background: '#dcfce7',
            color: '#166534',
            padding: '0.25rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>+3</div>
        </div>
        
        <div style={{
          background: theme.colors.current.background.secondary,
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          transition: 'all 0.3s ease'
        }} onMouseOver={(e) => {
          e.currentTarget.style.background = theme.colors.current.background.tertiary;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }} onMouseOut={(e) => {
          e.currentTarget.style.background = theme.colors.current.background.secondary;
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: '#374151',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f59e0b'
          }}>
            <FileText size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold', color: theme.colors.current.text.primary }}>{mockStats.pendingEvaluations}</h3>
            <p style={{ margin: 0, color: theme.colors.current.text.secondary }}>Evaluaciones Pendientes</p>
          </div>
          <div style={{ 
            background: '#fef3c7',
            color: '#92400e',
            padding: '0.25rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>-5</div>
        </div>
        
        <div style={{
          background: theme.colors.current.background.secondary,
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          transition: 'all 0.3s ease'
        }} onMouseOver={(e) => {
          e.currentTarget.style.background = theme.colors.current.background.tertiary;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }} onMouseOut={(e) => {
          e.currentTarget.style.background = theme.colors.current.background.secondary;
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: '#374151',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <TrendingUp size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold', color: theme.colors.current.text.primary }}>{mockStats.completionRate}%</h3>
            <p style={{ margin: 0, color: theme.colors.current.text.secondary }}>Tasa de Finalización</p>
          </div>
          <div style={{ 
            background: '#dcfce7',
            color: '#166534',
            padding: '0.25rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>+8%</div>
        </div>
        
        <div style={{
          background: theme.colors.current.background.secondary,
          border: `1px solid ${theme.colors.current.border.primary}`,
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          transition: 'all 0.3s ease'
        }} onMouseOver={(e) => {
          e.currentTarget.style.background = theme.colors.current.background.tertiary;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }} onMouseOut={(e) => {
          e.currentTarget.style.background = theme.colors.current.background.secondary;
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: theme.colors.current.background.tertiary,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444'
          }}>
            <Video size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold', color: theme.colors.current.text.primary }}>{mockStats.liveClasses}</h3>
            <p style={{ margin: 0, color: theme.colors.current.text.secondary }}>Clases en Vivo</p>
          </div>
          <div style={{ 
            background: '#fee2e2',
            color: '#991b1b',
            padding: '0.25rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>{mockStats.upcomingClasses} próximas</div>
        </div>
        
        <div style={{
          background: theme.colors.current.background.secondary,
          border: `1px solid ${theme.colors.current.border.primary}`,
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          transition: 'all 0.3s ease'
        }} onMouseOver={(e) => {
          e.currentTarget.style.background = theme.colors.current.background.tertiary;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }} onMouseOut={(e) => {
          e.currentTarget.style.background = theme.colors.current.background.secondary;
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: theme.colors.current.background.tertiary,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8b5cf6'
          }}>
            <Shield size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold', color: theme.colors.current.text.primary }}>{mockStats.activeGroups}</h3>
            <p style={{ margin: 0, color: theme.colors.current.text.secondary }}>Grupos Activos</p>
          </div>
          <div style={{ 
            background: '#e0e7ff',
            color: '#3730a3',
            padding: '0.25rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>{mockStats.totalGroups} total</div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: theme.colors.current.text.primary }}>Acciones Rápidas</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <button style={{
            background: theme.colors.current.background.secondary,
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            color: theme.colors.current.text.primary,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }} onMouseOver={(e) => {
            e.currentTarget.style.background = theme.colors.current.background.tertiary;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }} onMouseOut={(e) => {
            e.currentTarget.style.background = theme.colors.current.background.secondary;
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <Plus size={20} color="#3b82f6" />
            <span>Crear Curso</span>
          </button>
          <button style={{
            background: theme.colors.current.background.secondary,
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            color: theme.colors.current.text.primary,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }} onMouseOver={(e) => {
            e.currentTarget.style.background = theme.colors.current.background.tertiary;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }} onMouseOut={(e) => {
            e.currentTarget.style.background = theme.colors.current.background.secondary;
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <Users size={20} color="#8b5cf6" />
            <span>Agregar Estudiante</span>
          </button>
          <button style={{
            background: theme.colors.current.background.secondary,
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            color: theme.colors.current.text.primary,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }} onMouseOver={(e) => {
            e.currentTarget.style.background = theme.colors.current.background.tertiary;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }} onMouseOut={(e) => {
            e.currentTarget.style.background = theme.colors.current.background.secondary;
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <FileText size={20} color="#f59e0b" />
            <span>Nueva Evaluación</span>
          </button>
          <button style={{
            background: theme.colors.current.background.secondary,
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            color: theme.colors.current.text.primary,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }} onMouseOver={(e) => {
            e.currentTarget.style.background = theme.colors.current.background.tertiary;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }} onMouseOut={(e) => {
            e.currentTarget.style.background = theme.colors.current.background.secondary;
            e.currentTarget.style.transform = 'translateY(0)';
          }} onClick={() => setActiveSection('live-classes')}>
            <Video size={20} color="#ef4444" />
            <span>Clase en Vivo</span>
          </button>
          <button style={{
            background: theme.colors.current.background.secondary,
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            color: theme.colors.current.text.primary,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }} onMouseOver={(e) => {
            e.currentTarget.style.background = theme.colors.current.background.tertiary;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }} onMouseOut={(e) => {
            e.currentTarget.style.background = theme.colors.current.background.secondary;
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <MessageSquare size={20} color="#10b981" />
            <span>Enviar Mensaje</span>
          </button>
          <button style={{
            background: theme.colors.current.background.secondary,
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            color: theme.colors.current.text.primary,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }} onMouseOver={(e) => {
            e.currentTarget.style.background = theme.colors.current.background.tertiary;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }} onMouseOut={(e) => {
            e.currentTarget.style.background = theme.colors.current.background.secondary;
            e.currentTarget.style.transform = 'translateY(0)';
          }} onClick={() => setActiveSection('students')}>
            <Users size={20} color="#3b82f6" />
            <span>Gestionar Estudiantes</span>
          </button>
          <button style={{
            background: theme.colors.current.background.secondary,
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            color: theme.colors.current.text.primary,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }} onMouseOver={(e) => {
            e.currentTarget.style.background = theme.colors.current.background.tertiary;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }} onMouseOut={(e) => {
            e.currentTarget.style.background = theme.colors.current.background.secondary;
            e.currentTarget.style.transform = 'translateY(0)';
          }} onClick={() => setActiveSection('groups')}>
            <Shield size={20} color="#8b5cf6" />
            <span>Gestionar Grupos</span>
          </button>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: theme.colors.current.text.primary }}>Actividad Reciente</h3>
        <div style={{
          background: theme.colors.current.background.secondary,
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 0',
            borderBottom: '1px solid #334155'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#dcfce7',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#166534'
            }}>
              <Users size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 0.25rem 0', color: theme.colors.current.text.primary }}><strong>María García</strong> completó el curso de Cálculo</p>
              <span style={{ fontSize: '0.875rem', color: theme.colors.current.text.secondary }}>Hace 2 horas</span>
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 0',
            borderBottom: '1px solid #334155'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#dbeafe',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1d4ed8'
            }}>
              <FileText size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 0.25rem 0', color: theme.colors.current.text.primary }}>Nueva evaluación <strong>"Quiz de Derivadas"</strong> creada</p>
              <span style={{ fontSize: '0.875rem', color: theme.colors.current.text.secondary }}>Hace 4 horas</span>
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 0 0 0'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#ede9fe',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7c3aed'
            }}>
              <BookOpen size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 0.25rem 0', color: theme.colors.current.text.primary }}>15 estudiantes se inscribieron en <strong>"Física Cuántica"</strong></p>
              <span style={{ fontSize: '0.875rem', color: theme.colors.current.text.secondary }}>Ayer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: theme.colors.current.text.primary }}>Cursos</h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setCoursesViewMode(v => v === 'cards' ? 'list' : 'cards')}
            style={{ padding: '0.5rem 1rem', background: theme.colors.current.background.secondary, border: `1px solid ${theme.colors.current.border.primary}`, borderRadius: 8, cursor: 'pointer', color: theme.colors.current.text.primary }}>
            {coursesViewMode === 'cards' ? 'Vista Lista' : 'Vista Tarjetas'}
          </button>
          <button onClick={() => { setEditingCourse(null); setShowCourseEditor(true); }}
            style={{ padding: '0.5rem 1rem', background: '#3b82f6', border: 'none', borderRadius: 8, cursor: 'pointer', color: 'white', fontWeight: 600 }}>
            + Nuevo Curso
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input placeholder="Buscar" value={courseFilters.search} onChange={e => setCourseFilters(f=>({...f,search:e.target.value}))}
          style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: `1px solid ${theme.colors.current.border.primary}`, background: theme.colors.current.background.secondary, color: theme.colors.current.text.primary }} />
        <select value={courseFilters.category} onChange={e=>setCourseFilters(f=>({...f,category:e.target.value}))}
          style={{ padding: '0.5rem', borderRadius: 8, border: `1px solid ${theme.colors.current.border.primary}`, background: theme.colors.current.background.secondary, color: theme.colors.current.text.primary }}>
          <option value="all">Todas Categorías</option>
          <option value="matematicas">Matemáticas</option>
          <option value="programacion">Programación</option>
          <option value="fisica">Física</option>
        </select>
        <select value={courseFilters.status} onChange={e=>setCourseFilters(f=>({...f,status:e.target.value}))}
          style={{ padding: '0.5rem', borderRadius: 8, border: `1px solid ${theme.colors.current.border.primary}`, background: theme.colors.current.background.secondary, color: theme.colors.current.text.primary }}>
          <option value="all">Todos Estados</option>
          <option value="active">Activos</option>
          <option value="draft">Borradores</option>
          <option value="archived">Archivados</option>
        </select>
        <select value={courseFilters.sortBy} onChange={e=>setCourseFilters(f=>({...f,sortBy:e.target.value}))}
          style={{ padding: '0.5rem', borderRadius: 8, border: `1px solid ${theme.colors.current.border.primary}`, background: theme.colors.current.background.secondary, color: theme.colors.current.text.primary }}>
          <option value="date">Fecha</option>
          <option value="name">Nombre</option>
          <option value="students">Estudiantes</option>
          <option value="status">Estado</option>
        </select>
      </div>
      <CourseManager 
        viewMode={coursesViewMode}
        filters={courseFilters}
        onEditCourse={(c)=>{ setEditingCourse(c); setShowCourseEditor(true); }}
      />
      {showCourseEditor && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
          <div style={{ background: theme.colors.current.background.primary, width:'100%', maxWidth: '1200px', maxHeight:'100%', overflow:'auto', borderRadius: 16 }}>
            <CourseEditor 
              course={editingCourse || undefined}
              onSave={(course)=>{ console.log('save course', course); setShowCourseEditor(false); }}
              onCancel={()=>setShowCourseEditor(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
  const renderEvaluations = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem', alignItems:'center' }}>
        <div>
          <h2 style={{ margin:0, color: theme.colors.current.text.primary }}>📝 Quizzes de Cursos</h2>
          <p style={{ margin:'0.5rem 0 0', color: theme.colors.current.text.secondary, fontSize:'0.875rem' }}>
            Evaluaciones vinculadas a cursos específicos
          </p>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:'0.5rem' }}>
          <button onClick={()=> setEvaluationsViewMode(v=> v==='cards' ? 'list' : 'cards')}
            style={{ padding:'0.5rem 1rem', background: theme.colors.current.background.secondary, border:`1px solid ${theme.colors.current.border.primary}`, borderRadius:8, cursor:'pointer', color: theme.colors.current.text.primary }}>
            {evaluationsViewMode==='cards' ? 'Vista Lista' : 'Vista Tarjetas'}
          </button>
          <button onClick={()=> { setEditingEvaluation(null); setShowQuizBuilder(true); }}
            style={{ padding:'0.5rem 1.5rem', background:'#8b5cf6', border:'none', borderRadius:8, cursor:'pointer', color:'white', fontWeight:600 }}>
            + Nuevo Quiz
          </button>
        </div>
      </div>
      <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
        <input placeholder="Buscar quiz..." value={evaluationFilters.search} onChange={e=>setEvaluationFilters(f=>({...f,search:e.target.value}))}
          style={{ padding:'0.5rem 0.75rem', borderRadius:8, border:`1px solid ${theme.colors.current.border.primary}`, background: theme.colors.current.background.secondary, color: theme.colors.current.text.primary }} />
        <select value={evaluationFilters.course} onChange={e=>setEvaluationFilters(f=>({...f,course:e.target.value}))}
          style={{ padding:'0.5rem', borderRadius:8, border:`1px solid ${theme.colors.current.border.primary}`, background: theme.colors.current.background.secondary, color: theme.colors.current.text.primary }}>
          <option value="all">Todos los Cursos</option>
          <option value="Cálculo Diferencial">Cálculo Diferencial</option>
          <option value="Programación Python">Programación Python</option>
        </select>
        <select value={evaluationFilters.status} onChange={e=>setEvaluationFilters(f=>({...f,status:e.target.value}))}
          style={{ padding:'0.5rem', borderRadius:8, border:`1px solid ${theme.colors.current.border.primary}`, background: theme.colors.current.background.secondary, color: theme.colors.current.text.primary }}>
          <option value="all">Todos Estados</option>
          <option value="draft">Borrador</option>
          <option value="active">Activo</option>
          <option value="finished">Finalizado</option>
        </select>
        <select value={evaluationFilters.sortBy} onChange={e=>setEvaluationFilters(f=>({...f,sortBy:e.target.value}))}
          style={{ padding:'0.5rem', borderRadius:8, border:`1px solid ${theme.colors.current.border.primary}`, background: theme.colors.current.background.secondary, color: theme.colors.current.text.primary }}>
          <option value="date">Fecha</option>
          <option value="name">Nombre</option>
          <option value="course">Curso</option>
          <option value="responses">Respuestas</option>
        </select>
      </div>
      <EvaluationsManager 
        viewMode={evaluationsViewMode}
        filters={evaluationFilters}
        onEditEvaluation={(ev)=>{ setEditingEvaluation(ev); setShowQuizBuilder(true); }}
      />
      {showQuizBuilder && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
          <div style={{ background: theme.colors.current.background.primary, width:'100%', maxWidth: '1400px', maxHeight:'100%', overflow:'auto', borderRadius: 16 }}>
            <QuizBuilder 
              evaluation={editingEvaluation || undefined}
              onSave={(quiz)=>{ console.log('save quiz', quiz); setShowQuizBuilder(false); }}
              onCancel={()=> setShowQuizBuilder(false)}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderSimulacros = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem', alignItems:'center' }}>
        <div>
          <h2 style={{ margin:0, color: theme.colors.current.text.primary }}>🏆 Simulacros de Práctica</h2>
          <p style={{ margin:'0.5rem 0 0', color: theme.colors.current.text.secondary, fontSize:'0.875rem' }}>
            Exámenes independientes con sistema de suscripciones
          </p>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:'0.5rem' }}>
          <button onClick={()=> setSimulacrosViewMode(v=> v==='cards' ? 'list' : 'cards')}
            style={{ padding:'0.5rem 1rem', background: theme.colors.current.background.secondary, border:`1px solid ${theme.colors.current.border.primary}`, borderRadius:8, cursor:'pointer', color: theme.colors.current.text.primary }}>
            {simulacrosViewMode==='cards' ? 'Vista Lista' : 'Vista Tarjetas'}
          </button>
          <button onClick={()=> { setEditingSimulacro(null); setShowSimulacroBuilder(true); }}
            style={{ padding:'0.5rem 1.5rem', background:'#f59e0b', border:'none', borderRadius:8, cursor:'pointer', color:'white', fontWeight:600 }}>
            + Nuevo Simulacro
          </button>
        </div>
      </div>
      <div style={{ 
        padding:'1rem', 
        background: theme.colors.current.background.secondary, 
        borderRadius:8, 
        border:`1px solid ${theme.colors.current.border.primary}`,
        display:'flex',
        gap:'2rem',
        flexWrap:'wrap'
      }}>
        <div>
          <div style={{ fontSize:'2rem', fontWeight:'bold', color:'#10b981' }}>45</div>
          <div style={{ fontSize:'0.875rem', color: theme.colors.current.text.secondary }}>Total Simulacros</div>
        </div>
        <div>
          <div style={{ fontSize:'2rem', fontWeight:'bold', color:'#3b82f6' }}>12</div>
          <div style={{ fontSize:'0.875rem', color: theme.colors.current.text.secondary }}>De Muestra (Free)</div>
        </div>
        <div>
          <div style={{ fontSize:'2rem', fontWeight:'bold', color:'#f59e0b' }}>1,234</div>
          <div style={{ fontSize:'0.875rem', color: theme.colors.current.text.secondary }}>Intentos este mes</div>
        </div>
        <div>
          <div style={{ fontSize:'2rem', fontWeight:'bold', color:'#8b5cf6' }}>72%</div>
          <div style={{ fontSize:'0.875rem', color: theme.colors.current.text.secondary }}>Tasa aprobación</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
        <input placeholder="Buscar simulacro..." 
          style={{ flex:1, minWidth:'200px', padding:'0.5rem 0.75rem', borderRadius:8, border:`1px solid ${theme.colors.current.border.primary}`, background: theme.colors.current.background.secondary, color: theme.colors.current.text.primary }} />
        <select style={{ padding:'0.5rem', borderRadius:8, border:`1px solid ${theme.colors.current.border.primary}`, background: theme.colors.current.background.secondary, color: theme.colors.current.text.primary }}>
          <option value="all">Todas las Categorías</option>
          <option value="admision">Admisión Universitaria</option>
          <option value="certificacion">Certificaciones</option>
          <option value="competencias">Competencias</option>
        </select>
        <select style={{ padding:'0.5rem', borderRadius:8, border:`1px solid ${theme.colors.current.border.primary}`, background: theme.colors.current.background.secondary, color: theme.colors.current.text.primary }}>
          <option value="all">Todos los Niveles</option>
          <option value="free">Muestra (Free)</option>
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
        </select>
        <select style={{ padding:'0.5rem', borderRadius:8, border:`1px solid ${theme.colors.current.border.primary}`, background: theme.colors.current.background.secondary, color: theme.colors.current.text.primary }}>
          <option value="all">Todos Estados</option>
          <option value="published">Publicado</option>
          <option value="draft">Borrador</option>
        </select>
      </div>
      
      {/* Lista de simulacros - placeholder */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1.5rem' }}>
        {[
          { id: 1, nombre: 'Simulacro ICFES - Matemáticas', servicio: 'ICFES', nivel: 'MUESTRA', minutos: 90, preguntas: 45, intentos: 234 },
          { id: 2, nombre: 'Simulacro Saber Pro - Razonamiento', servicio: 'Saber Pro', nivel: 'PREMIUM', minutos: 120, preguntas: 60, intentos: 156 },
          { id: 3, nombre: 'Simulacro UNAL - Cálculo', servicio: 'Admisiones', nivel: 'PREMIUM', minutos: 100, preguntas: 50, intentos: 89 },
          { id: 4, nombre: 'Simulacro Corporativo - Liderazgo', servicio: 'Corporativo', nivel: 'PREMIUM', minutos: 45, preguntas: 30, intentos: 67 }
        ].map(sim => (
          <div key={sim.id} style={{
            background: theme.colors.current.background.secondary,
            border:`1px solid ${theme.colors.current.border.primary}`,
            borderRadius:12,
            padding:'1.5rem',
            cursor:'pointer',
            transition:'all 0.2s'
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ margin:0, color: theme.colors.current.text.primary, fontSize: '1rem' }}>{sim.nombre}</h3>
                </div>
                <span style={{ 
                  padding:'0.125rem 0.5rem', 
                  background:'#6366f120', 
                  color:'#6366f1', 
                  borderRadius:4, 
                  fontSize:'0.625rem',
                  fontWeight: '700',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.5px'
                }}>
                  {sim.servicio}
                </span>
              </div>
              <span style={{ padding:'0.25rem 0.75rem', background: sim.nivel === 'MUESTRA' ? '#10b981' : '#f59e0b', color:'white', borderRadius:6, fontSize:'0.75rem', fontWeight: '600' }}>
                {sim.nivel}
              </span>
            </div>
            <p style={{ margin:'0.75rem 0 1rem', fontSize:'0.875rem', color: theme.colors.current.text.secondary }}>
              Preparación para examen de admisión
            </p>
            <div style={{ display:'flex', gap:'1rem', fontSize:'0.875rem', color: theme.colors.current.text.secondary }}>
              <span>⏱️ {sim.minutos} min</span>
              <span>📝 {sim.preguntas} preguntas</span>
              <span>👥 {sim.intentos} intentos</span>
            </div>
            <div style={{ marginTop:'1rem', display:'flex', gap:'0.5rem' }}>
              <button 
                onClick={() => { setEditingSimulacro({ id: sim.id }); setShowSimulacroBuilder(true); }}
                style={{ flex:1, padding:'0.5rem', background:'#3b82f6', color:'white', border:'none', borderRadius:6, cursor:'pointer' }}>
                Editar
              </button>
              <button style={{ padding:'0.5rem 0.75rem', background: theme.colors.current.background.tertiary, border:`1px solid ${theme.colors.current.border.primary}`, borderRadius:6, cursor:'pointer' }}>
                📊
              </button>
            </div>
          </div>
        ))}
      </div>

      {showSimulacroBuilder && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
          <div style={{ background: theme.colors.current.background.primary, width:'100%', maxWidth: '1400px', maxHeight:'100%', overflow:'auto', borderRadius: 16 }}>
            <SimulacroBuilder 
              simulacroId={editingSimulacro?.id}
              onSave={(simulacro)=>{ console.log('save simulacro', simulacro); setShowSimulacroBuilder(false); }}
              onCancel={()=> setShowSimulacroBuilder(false)}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'courses':
        return renderCourses();
      case 'live-classes':
        return <LiveClassesManager />;
      case 'evaluations':
        return renderEvaluations();
      case 'simulacros':
        return renderSimulacros();
      case 'students':
        return <StudentsManager onNavigateToGroups={() => setActiveSection('groups')} />;
      case 'groups':
        return <GroupManager onNavigateToStudents={() => setActiveSection('students')} />;
      case 'teachers':
        return <UserManagement />;
      case 'services':
        return <ServicesManager />;
      case 'statistics':
        return <EvaluationStatistics isDarkMode={isDarkMode} />;
      case 'student-reports':
        return <StudentReportsManager isDarkMode={isDarkMode} />;
      case 'messages':
        return <AdminChatCenter teacherId={currentUser.id} />;
      case 'profile':
        return (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: theme.colors.current.text.primary }}>Perfil del Instructor</h2>
              <button style={{
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                color: '#22c55e',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '600'
              }}>
                <Edit size={20} />
                Editar Perfil
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
              {/* Información personal */}
              <div style={{
                background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: '12px',
                padding: '2rem'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    background: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: theme.colors.current.text.primary
                  }}>
                    {currentUser?.email?.charAt(0).toUpperCase() || 'I'}
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 'bold', color: theme.colors.current.text.primary }}>
                    Dr. Juan Instructor
                  </h3>
                  <p style={{ margin: 0, color: theme.colors.current.text.secondary }}>Profesor de Matemáticas</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600', color: theme.colors.current.text.primary }}>Información de Contacto</h4>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.875rem', color: theme.colors.current.text.secondary }}>Email:</label>
                    <p style={{ margin: '0.25rem 0 0 0', color: theme.colors.current.text.primary }}>{currentUser?.email || 'instructor@epsilon.com'}</p>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.875rem', color: theme.colors.current.text.secondary }}>Teléfono:</label>
                    <p style={{ margin: '0.25rem 0 0 0', color: theme.colors.current.text.primary }}>+34 123 456 789</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', color: theme.colors.current.text.secondary }}>Oficina:</label>
                    <p style={{ margin: '0.25rem 0 0 0', color: theme.colors.current.text.primary }}>Edificio A, Despacho 205</p>
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600', color: theme.colors.current.text.primary }}>Estadísticas</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ textAlign: 'center', padding: '1rem', background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>8</div>
                      <div style={{ fontSize: '0.875rem', color: theme.colors.current.text.secondary }}>Cursos Activos</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>142</div>
                      <div style={{ fontSize: '0.875rem', color: theme.colors.current.text.secondary }}>Estudiantes</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuración y detalles */}
              <div>
                {/* Información académica */}
                <div style={{
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600', color: theme.colors.current.text.primary }}>Información Académica</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: theme.colors.current.text.secondary }}>Especialización:</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: theme.colors.current.text.primary }}>Matemáticas Aplicadas</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: theme.colors.current.text.secondary }}>Años de Experiencia:</label>
                      <p style={{ margin: '0.25rem 0 0 0', color: theme.colors.current.text.primary }}>12 años</p>
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '0.875rem', color: theme.colors.current.text.secondary }}>Titulación:</label>
                    <p style={{ margin: '0.25rem 0 0 0', color: theme.colors.current.text.primary }}>Doctorado en Matemáticas - Universidad Complutense de Madrid</p>
                  </div>
                </div>

                {/* Horario de atención */}
                <div style={{
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600', color: theme.colors.current.text.primary }}>Horario de Atención</h4>
                  
                  {[
                    { day: 'Lunes', hours: '9:00 - 12:00, 14:00 - 17:00' },
                    { day: 'Martes', hours: '9:00 - 12:00, 14:00 - 17:00' },
                    { day: 'Miércoles', hours: '9:00 - 12:00' },
                    { day: 'Jueves', hours: '9:00 - 12:00, 14:00 - 17:00' },
                    { day: 'Viernes', hours: '9:00 - 12:00' }
                  ].map((schedule, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderBottom: index < 4 ? `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}` : 'none'
                    }}>
                      <span style={{ color: theme.colors.current.text.primary, fontWeight: '600' }}>{schedule.day}</span>
                      <span style={{ color: theme.colors.current.text.secondary }}>{schedule.hours}</span>
                    </div>
                  ))}
                </div>

                {/* Configuración de cuenta */}
                <div style={{
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600', color: theme.colors.current.text.primary }}>Configuración de Cuenta</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      justifyContent: 'flex-start'
                    }}>
                      <Settings size={16} />
                      Cambiar Contraseña
                    </button>
                    
                    <button style={{
                      background: 'rgba(168, 85, 247, 0.2)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      color: '#a855f7',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      justifyContent: 'flex-start'
                    }}>
                      <Bell size={16} />
                      Configurar Notificaciones
                    </button>
                    
                    <button style={{
                      background: 'rgba(251, 191, 36, 0.2)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      color: '#fbbf24',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      justifyContent: 'flex-start'
                    }}>
                      <Download size={16} />
                      Exportar Datos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.colors.current.background.primary,
      color: theme.colors.current.text.primary
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 2rem',
        background: theme.colors.current.background.secondary,
        borderBottom: `1px solid ${theme.colors.current.border.primary}`
      }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 'bold', color: theme.colors.current.text.primary }}>Panel de Instructor</h1>
          <p style={{ margin: 0, color: theme.colors.current.text.secondary }}>Bienvenido, {currentUser?.email || 'Instructor'}</p>
        </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button style={{
            position: 'relative',
            background: theme.colors.current.background.tertiary,
            border: `1px solid ${theme.colors.current.border.primary}`,
            borderRadius: '8px',
            padding: '0.75rem',
            color: theme.colors.current.text.primary,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }} onMouseOver={(e) => {
            e.currentTarget.style.background = theme.colors.current.border.primary;
          }} onMouseOut={(e) => {
            e.currentTarget.style.background = theme.colors.current.background.tertiary;
          }}>
            <Bell size={20} />
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: '#dc2626',
              color: theme.colors.current.text.primary,
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>3</span>
          </button>
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            style={{
              background: theme.colors.current.background.tertiary,
              border: `1px solid ${theme.colors.current.border.primary}`,
              borderRadius: '8px',
              padding: '0.75rem',
              color: theme.colors.current.text.primary,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} 
            onMouseOver={(e) => {
              e.currentTarget.style.background = theme.colors.current.border.primary;
            }} 
            onMouseOut={(e) => {
              e.currentTarget.style.background = theme.colors.current.background.tertiary;
            }}
            title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div style={{
            width: '40px',
            height: '40px',
            background: theme.colors.current.background.tertiary,
            border: `1px solid ${theme.colors.current.border.primary}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }} onMouseOver={(e) => {
            e.currentTarget.style.background = theme.colors.current.border.primary;
          }} onMouseOut={(e) => {
            e.currentTarget.style.background = theme.colors.current.background.tertiary;
          }}>
            <User size={20} color={theme.colors.current.text.primary} />
          </div>
          <button 
            onClick={handleSignOut}
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: '8px',
              padding: '0.6rem 1rem',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all .3s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
            title="Cerrar sesión"
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 100px)' }}>
        {/* Sidebar Navigation */}
        <nav style={{
          width: '250px',
          background: theme.colors.current.background.secondary,
          borderRight: `1px solid ${theme.colors.current.border.primary}`,
          padding: '1rem 0'
        }}>
          {navigationItems.map(item => (
            <button
              key={item.id}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.5rem',
                background: activeSection === item.id ? theme.colors.current.background.tertiary : 'transparent',
                border: 'none',
                borderLeft: activeSection === item.id ? '4px solid #3b82f6' : '4px solid transparent',
                color: activeSection === item.id ? theme.colors.current.text.primary : theme.colors.current.text.secondary,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem'
              }}
              onClick={() => setActiveSection(item.id)}
              onMouseOver={(e) => {
                if (activeSection !== item.id) {
                  (e.currentTarget as HTMLButtonElement).style.background = theme.colors.current.background.tertiary;
                  (e.currentTarget as HTMLButtonElement).style.color = theme.colors.current.text.primary;
                }
              }}
              onMouseOut={(e) => {
                if (activeSection !== item.id) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = theme.colors.current.text.secondary;
                }
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

