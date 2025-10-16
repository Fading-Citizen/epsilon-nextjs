'use client'

import React, { useState, useEffect } from 'react';
import { User, Bell, BookOpen, Award, TrendingUp, Calendar, Sun, Moon, LogOut, Search, Play, Clock, Users, Star, Eye, Menu, X, Home, GraduationCap, FileText, Trophy, MessageSquare, Plus, RefreshCw, BarChart, MessageCircle, Send, Camera, Save, Newspaper, Grid3X3, List, Filter, Tag, ChevronDown, SortAsc, SortDesc, Video, Mic, MicOff, VideoOff, Share, Settings, Volume2, PhoneOff, UserPlus, Copy, ExternalLink, ShoppingCart } from 'lucide-react';
import { useTheme } from '@/themes/ThemeContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import SimulacroViewer from './SimulacroViewer';
import ServicesStore from './ServicesStore';

const StudentDashboard = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  // Estados para organización y vista
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'rating' | 'progress'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Estados para clases en vivo
  const [isJoinedToLiveClass, setIsJoinedToLiveClass] = useState(false);
  const [currentLiveClass, setCurrentLiveClass] = useState<any>(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  
  // Estados para SimulacroViewer
  const [activeSimulacro, setActiveSimulacro] = useState<any>(null);
  const [showSimulacroViewer, setShowSimulacroViewer] = useState(false);
  const [userSubscription, setUserSubscription] = useState({
    plan: 'free' as 'free' | 'basic' | 'premium' | 'enterprise',
    simulacrosUsados: 3,
    simulacrosMaximos: 5,
    renovacionMes: '2025-02-01'
  });

  // Control de acceso por servicios/productos adquiridos
  const [serviciosAdquiridos, setServiciosAdquiridos] = useState<string[]>([
    'ICFES',           // Usuario tiene acceso a contenido ICFES
    'Cursos Especializados'  // Usuario tiene acceso a cursos especializados
    // Los servicios 'Saber Pro', 'Admisiones', 'Corporativo' NO están adquiridos
  ]);
  
  const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);
  const [deniedServiceInfo, setDeniedServiceInfo] = useState<{servicio: string, tipo: string, nombre: string} | null>(null);

  // Función para verificar acceso a un servicio
  const tieneAccesoAServicio = (servicio: string): boolean => {
    return serviciosAdquiridos.includes(servicio);
  };

  // Función para mostrar modal de acceso denegado
  const mostrarAccesoDenegado = (servicio: string, tipo: 'simulacro' | 'curso', nombre: string) => {
    setDeniedServiceInfo({ servicio, tipo, nombre });
    setShowAccessDeniedModal(true);
  };
  
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: '#3b82f6' },
    { id: 'tienda', label: 'Tienda', icon: ShoppingCart, color: '#f59e0b' },
    { id: 'oferta-academica', label: 'Oferta Académica', icon: GraduationCap, color: '#10b981' },
    { id: 'mis-cursos', label: 'Cursos Adquiridos', icon: BookOpen, color: '#8b5cf6' },
    { id: 'clases-vivo', label: 'Clases en Vivo', icon: Play, color: '#ef4444' },
    { id: 'simulacros', label: 'Simulacros', icon: Trophy, color: '#f59e0b' },
    { id: 'mis-informes', label: 'Mis Informes', icon: FileText, color: '#10b981' },
    { id: 'noticias', label: 'Noticias', icon: Newspaper, color: '#6366f1' },
    { id: 'mensajes', label: 'Mensajes', icon: MessageSquare, color: '#ef4444' },
    { id: 'perfil', label: 'Perfil', icon: User, color: '#6366f1' }
  ];

  // Funciones auxiliares para organización
  const categories = {
    ofertaAcademica: ['Todas', 'Matemáticas', 'Física', 'Química', 'Programación', 'Ingeniería', 'Ciencias'],
    misCursos: ['Todos', 'En Progreso', 'Completados', 'Por Iniciar', 'Certificados'],
    simulacros: ['Todos', 'ICFES', 'Universitario', 'Saber Pro', 'Competencias', 'Práctica'],
    clasesVivo: ['Todas', 'En Vivo', 'Programadas', 'Finalizadas', 'Mis Cursos']
  };

  const tags = {
    ofertaAcademica: ['Básico', 'Intermedio', 'Avanzado', 'Certificado', 'Gratuito', 'Premium', 'Nuevo'],
    misCursos: ['Favorito', 'Urgente', 'Revisión', 'Completado', 'En Curso'],
    simulacros: ['Rápido', 'Completo', 'Práctica', 'Examen', 'Preparación', 'Evaluación'],
    clasesVivo: ['Gratis', 'Premium', 'Interactiva', 'Grabada', 'Q&A', 'Taller']
  };

  const getCurrentCategories = () => {
    switch(currentPage) {
      case 'oferta-academica': return categories.ofertaAcademica;
      case 'mis-cursos': return categories.misCursos;
      case 'simulacros': return categories.simulacros;
      case 'clases-vivo': return categories.clasesVivo;
      default: return [];
    }
  };

  const getCurrentTags = () => {
    switch(currentPage) {
      case 'oferta-academica': return tags.ofertaAcademica;
      case 'mis-cursos': return tags.misCursos;
      case 'simulacros': return tags.simulacros;
      case 'clases-vivo': return tags.clasesVivo;
      default: return [];
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('todas');
    setSelectedTags([]);
    setSearchTerm('');
  };

  const navegarA = (page: string) => {
    setCurrentPage(page);
    resetFilters(); // Reset filters when changing pages
    if (isMobile) setSidebarOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (e) {
      console.error('Error al cerrar sesión', e);
    }
  };

  // Funciones auxiliares para Simulacros
  const canAccessSimulacro = (simulacro: any) => {
    // Simulacros de muestra siempre son accesibles
    if (simulacro.isSample) return true;
    
    // Plan premium o enterprise tienen acceso ilimitado
    if (userSubscription.plan === 'premium' || userSubscription.plan === 'enterprise') {
      return true;
    }
    
    // Plan free: verificar si no ha excedido el límite
    if (userSubscription.plan === 'free') {
      return userSubscription.simulacrosUsados < userSubscription.simulacrosMaximos;
    }
    
    // Plan basic: verificar límite de 20
    if (userSubscription.plan === 'basic') {
      return userSubscription.simulacrosUsados < 20;
    }
    
    return false;
  };

  const handleIniciarSimulacro = (simulacro: any) => {
    // 1. VERIFICAR ACCESO AL SERVICIO (Primera prioridad)
    if (!tieneAccesoAServicio(simulacro.servicio)) {
      mostrarAccesoDenegado(simulacro.servicio, 'simulacro', simulacro.nombre);
      return;
    }

    // 2. VERIFICAR CUPO DE SUSCRIPCIÓN (Solo si tiene acceso al servicio)
    const canAccess = canAccessSimulacro(simulacro);
    
    if (!canAccess) {
      alert('Has alcanzado el límite mensual de simulacros. Mejora tu plan para acceso ilimitado.');
      return;
    }
    
    // 3. Si no es muestra y tiene plan gratuito, confirmar uso del cupo
    if (!simulacro.isSample && userSubscription.plan === 'free') {
      const remaining = userSubscription.simulacrosMaximos - userSubscription.simulacrosUsados;
      const message = `Vas a usar 1 de tus ${remaining} simulacros restantes este mes. ¿Continuar?`;
      
      if (!confirm(message)) {
        return;
      }
    }
    
    // 4. Abrir el modal con el simulacro
    setActiveSimulacro(simulacro);
    setShowSimulacroViewer(true);
  };

  // Función para manejar inscripción a cursos
  const handleInscribirseCurso = (curso: any) => {
    // 1. VERIFICAR ACCESO AL SERVICIO
    if (!tieneAccesoAServicio(curso.servicio)) {
      mostrarAccesoDenegado(curso.servicio, 'curso', curso.nombre);
      return;
    }

    // 2. Si tiene acceso, proceder con la inscripción
    alert(`Inscripción al curso: ${curso.nombre}\nPrecio: $${curso.precio.toLocaleString()}\n\n¡Próximamente sistema de pagos!`);
    // TODO: Implementar flujo de pago
  };

  // Función para acceder a curso adquirido
  const handleAccederCurso = (curso: any) => {
    // 1. VERIFICAR ACCESO AL SERVICIO
    if (!tieneAccesoAServicio(curso.servicio)) {
      mostrarAccesoDenegado(curso.servicio, 'curso', curso.nombre);
      return;
    }

    // 2. Si tiene acceso, abrir el curso
    alert(`Abriendo curso: ${curso.nombre}`);
    // TODO: Navegar a la página del curso
  };

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cerrar sidebar en desktop
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Fallback si theme no está disponible
  const safeTheme = theme || {
    colors: {
      current: {
        backgroundGradient: 'linear-gradient(135deg, #1e3a8a, #1e40af)',
        sidebar: { background: '#1f2937', border: '#374151', hover: '#2563eb', active: '#1d4ed8' },
        text: { primary: '#111827', secondary: '#4b5563', muted: '#6b7280' },
        card: { background: '#ffffff', border: '#e5e7eb', highlight: '#3b82f6', hover: '#2563eb', accent: '#3b82f6' }
      },
      dark: {
        backgroundGradient: 'linear-gradient(135deg, #0f172a, #1e293b)',
        sidebar: { background: '#0f172a', border: '#1e293b', hover: '#3b82f6', active: '#2563eb' },
        text: { primary: '#f9fafb', secondary: '#9ca3af', muted: '#6b7280' },
        card: { background: '#1e293b', border: '#334155', highlight: '#3b82f6', hover: '#2563eb', accent: '#3b82f6' }
      }
    }
  };

  // Componente de barra de herramientas
  const ToolbarComponent = ({ title, showNewButton = false, newButtonText = "Nuevo", onNewClick }: {
    title: string;
    showNewButton?: boolean;
    newButtonText?: string;
    onNewClick?: () => void;
  }) => (
    <div style={{ marginBottom: '2rem' }}>
      {/* Header con título y botón */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: safeTheme.colors.current.text.primary }}>
          {title}
        </h1>
        {showNewButton && (
          <button 
            onClick={onNewClick}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={16} />
            {newButtonText}
          </button>
        )}
      </div>

      {/* Barra de filtros y controles */}
      <div style={{
        background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr auto auto',
        gap: '1rem',
        alignItems: 'center'
      }}>
        {/* Selector de categoría */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '150px' }}>
          <Filter size={16} style={{ color: safeTheme.colors.current.text.secondary }} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '0.5rem',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
              borderRadius: '6px',
              background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
              color: safeTheme.colors.current.text.primary,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            {getCurrentCategories().map((cat) => (
              <option key={cat} value={cat.toLowerCase()}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Etiquetas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' as const }}>
          <Tag size={16} style={{ color: safeTheme.colors.current.text.secondary }} />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
            {getCurrentTags().map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  border: `1px solid ${selectedTags.includes(tag) ? '#3b82f6' : (isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)')}`,
                  borderRadius: '20px',
                  background: selectedTags.includes(tag) 
                    ? 'linear-gradient(135deg, #3b82f6, #2563eb)' 
                    : 'transparent',
                  color: selectedTags.includes(tag) ? 'white' : safeTheme.colors.current.text.secondary,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Ordenamiento */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '0.5rem',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
              borderRadius: '6px',
              background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
              color: safeTheme.colors.current.text.primary,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            <option value="name">Nombre</option>
            <option value="date">Fecha</option>
            <option value="rating">Calificación</option>
            <option value="progress">Progreso</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            style={{
              background: 'none',
              border: 'none',
              color: safeTheme.colors.current.text.secondary,
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
          </button>
        </div>

        {/* Selector de vista */}
        <div style={{ display: 'flex', border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`, borderRadius: '6px', overflow: 'hidden' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '0.5rem',
              background: viewMode === 'grid' 
                ? 'linear-gradient(135deg, #3b82f6, #2563eb)' 
                : 'transparent',
              border: 'none',
              color: viewMode === 'grid' ? 'white' : safeTheme.colors.current.text.secondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '0.5rem',
              background: viewMode === 'list' 
                ? 'linear-gradient(135deg, #3b82f6, #2563eb)' 
                : 'transparent',
              border: 'none',
              color: viewMode === 'list' ? 'white' : safeTheme.colors.current.text.secondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div style={{ position: 'relative', marginTop: '1rem' }}>
        <Search size={20} style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: safeTheme.colors.current.text.secondary
        }} />
        <input
          type="text"
          placeholder={`Buscar en ${title.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 0.75rem 0.75rem 2.5rem',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '8px',
            background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            color: safeTheme.colors.current.text.primary,
            outline: 'none'
          }}
        />
      </div>
    </div>
  );

  
  const renderSimulacros = () => {
    const simulacros = [
      {
        id: 1,
        nombre: 'Simulacro ICFES - Matemáticas Básico',
        descripcion: 'Examen de muestra gratuito de matemáticas según el formato ICFES',
        preguntas: 20,
        tiempo: '40 min',
        ultimoIntento: '85%',
        fecha: '2025-08-25',
        estado: 'completado',
        color: '#10b981',
        categoria: 'ICFES',
        servicio: 'ICFES',
        tags: ['🆓 MUESTRA', 'Matemáticas', 'Básico'],
        isSample: true,
        requiresSubscription: false
      },
      {
        id: 2,
        nombre: 'Simulacro ICFES - Física Completo',
        descripcion: 'Evaluación completa de conceptos fundamentales de física',
        preguntas: 45,
        tiempo: '90 min',
        ultimoIntento: '92%',
        fecha: '2025-08-20',
        estado: 'completado',
        color: '#3b82f6',
        categoria: 'ICFES',
        servicio: 'ICFES',
        tags: ['💎 PREMIUM', 'Física', 'Completo'],
        isSample: false,
        requiresSubscription: true
      },
      {
        id: 3,
        nombre: 'Simulacro ICFES - Química Orgánica',
        descripcion: 'Examen de química orgánica e inorgánica nivel avanzado',
        preguntas: 50,
        tiempo: '100 min',
        ultimoIntento: null,
        fecha: null,
        estado: 'disponible',
        color: '#8b5cf6',
        categoria: 'ICFES',
        servicio: 'ICFES',
        tags: ['💎 PREMIUM', 'Química', 'Avanzado'],
        isSample: false,
        requiresSubscription: true
      },
      {
        id: 4,
        nombre: 'Simulacro Razonamiento Lógico - Gratis',
        descripcion: 'Práctica gratuita de razonamiento lógico y matemático',
        preguntas: 15,
        tiempo: '30 min',
        ultimoIntento: null,
        fecha: null,
        estado: 'disponible',
        color: '#10b981',
        categoria: 'Competencias',
        servicio: 'Saber Pro',
        tags: ['🆓 GRATIS', 'Razonamiento', 'Práctica'],
        isSample: true,
        requiresSubscription: false
      },
      {
        id: 5,
        nombre: 'Simulacro Universitario - Cálculo Integral',
        descripcion: 'Preparación completa para exámenes de admisión universitaria',
        preguntas: 60,
        tiempo: '120 min',
        ultimoIntento: '78%',
        fecha: '2025-08-15',
        estado: 'completado',
        color: '#ef4444',
        categoria: 'Universitario',
        servicio: 'Admisiones',
        tags: ['💎 PREMIUM', 'Cálculo', 'Universitario'],
        isSample: false,
        requiresSubscription: true
      },
      {
        id: 6,
        nombre: 'Simulacro Saber Pro - Razonamiento',
        descripcion: 'Competencias genéricas de razonamiento cuantitativo',
        preguntas: 40,
        tiempo: '90 min',
        ultimoIntento: '88%',
        fecha: '2025-08-10',
        estado: 'completado',
        color: '#f59e0b',
        categoria: 'Saber Pro',
        servicio: 'Saber Pro',
        tags: ['💎 PREMIUM', 'Razonamiento', 'Evaluación'],
        isSample: false,
        requiresSubscription: true
      }
    ];

    // Filtrar simulacros
    const filteredSimulacros = simulacros.filter(simulacro => {
      const matchesSearch = simulacro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           simulacro.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'todas' || selectedCategory === 'todos' || 
                             simulacro.categoria.toLowerCase() === selectedCategory.toLowerCase();
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => simulacro.tags.includes(tag));
      
      return matchesSearch && matchesCategory && matchesTags;
    });

    // Ordenar simulacros
    const sortedSimulacros = [...filteredSimulacros].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.nombre;
          bValue = b.nombre;
          break;
        case 'date':
          aValue = a.fecha || '1900-01-01';
          bValue = b.fecha || '1900-01-01';
          break;
        case 'rating':
          aValue = parseInt(a.ultimoIntento || '0');
          bValue = parseInt(b.ultimoIntento || '0');
          break;
        default:
          aValue = a.nombre;
          bValue = b.nombre;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return (
      <div style={{ padding: '2rem' }}>
        <ToolbarComponent 
          title="Simulacros" 
          showNewButton={false}
        />

        {/* Estadísticas de simulacros */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{
            background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center' as const
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>24</div>
            <div style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>Simulacros Completados</div>
          </div>
          <div style={{
            background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center' as const
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem' }}>87%</div>
            <div style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>Promedio General</div>
          </div>
          <div style={{
            background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center' as const
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem' }}>5</div>
            <div style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>Disponibles</div>
          </div>
        </div>

        {/* Panel de Suscripción */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          color: 'white',
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap' as const, gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Plan {userSubscription.plan.toUpperCase()} 🆓
              </h3>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
                {userSubscription.simulacrosUsados} de {userSubscription.simulacrosMaximos} simulacros utilizados este mes
              </p>
            </div>
            <button 
              onClick={() => alert('Funcionalidad de mejora de plan próximamente')}
              style={{
                background: 'white',
                color: '#f59e0b',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'transform 0.2s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              💎 Mejorar Plan
            </button>
          </div>
          
          {/* Barra de progreso */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            height: '10px',
            overflow: 'hidden',
            marginBottom: '0.75rem'
          }}>
            <div style={{
              background: 'white',
              height: '100%',
              width: `${(userSubscription.simulacrosUsados / userSubscription.simulacrosMaximos) * 100}%`,
              transition: 'width 0.3s ease',
              borderRadius: '8px'
            }} />
          </div>
          
          <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>
            📅 Tu cupo se reinicia el {new Date(userSubscription.renovacionMes).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Vista de simulacros */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: viewMode === 'grid' 
            ? 'repeat(auto-fit, minmax(400px, 1fr))' 
            : '1fr',
          gap: '1.5rem' 
        }}>
          {sortedSimulacros.map((simulacro) => {
            const tieneAcceso = tieneAccesoAServicio(simulacro.servicio);
            return (
            <div key={simulacro.id} style={{
              position: 'relative',
              background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              borderLeft: `4px solid ${tieneAcceso ? simulacro.color : '#9ca3af'}`,
              borderRadius: '12px',
              padding: viewMode === 'list' ? '1.5rem' : '2rem',
              display: viewMode === 'list' ? 'flex' : 'block',
              alignItems: viewMode === 'list' ? 'center' : 'initial',
              gap: viewMode === 'list' ? '1.5rem' : '0',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              opacity: tieneAcceso ? 1 : 0.7
            }}
            onMouseOver={(e) => {
              if (tieneAcceso) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${simulacro.color}20`;
              }
            }}
            onMouseOut={(e) => {
              if (tieneAcceso) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}>
              
              {/* Overlay de servicio bloqueado */}
              {!tieneAcceso && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0 12px 0 12px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  zIndex: 1,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}>
                  🔒 Sin Acceso
                </div>
              )}
              
              {viewMode === 'grid' ? (
                <>
                  {/* Vista en cuadrícula */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ 
                          margin: 0, 
                          fontSize: '1.25rem', 
                          fontWeight: 'bold', 
                          color: safeTheme.colors.current.text.primary
                        }}>
                          {simulacro.nombre}
                        </h3>
                        <span style={{
                          padding: '0.125rem 0.5rem',
                          fontSize: '0.625rem',
                          background: '#6366f120',
                          color: '#6366f1',
                          borderRadius: '6px',
                          fontWeight: '700',
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.5px'
                        }}>
                          {simulacro.servicio}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' as const }}>
                        {simulacro.tags.map(tag => (
                          <span key={tag} style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            background: tag.includes('🆓') || tag.includes('MUESTRA') || tag.includes('GRATIS') ? '#10b98120' : 
                                       tag.includes('💎') || tag.includes('PREMIUM') ? '#f59e0b20' : `${simulacro.color}20`,
                            color: tag.includes('🆓') || tag.includes('MUESTRA') || tag.includes('GRATIS') ? '#10b981' : 
                                  tag.includes('💎') || tag.includes('PREMIUM') ? '#f59e0b' : simulacro.color,
                            borderRadius: '12px',
                            fontWeight: '600',
                            border: tag.includes('💎') || tag.includes('PREMIUM') ? '1px solid #f59e0b' : 'none'
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{
                      background: simulacro.estado === 'completado' ? '#10b98120' : '#f59e0b20',
                      color: simulacro.estado === 'completado' ? '#10b981' : '#f59e0b',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {simulacro.estado === 'completado' ? 'Completado' : 'Disponible'}
                    </div>
                  </div>
                  
                  <p style={{ 
                    color: safeTheme.colors.current.text.secondary, 
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    marginBottom: '1.5rem'
                  }}>
                    {simulacro.descripcion}
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={16} style={{ color: safeTheme.colors.current.text.secondary }} />
                      <span style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>
                        {simulacro.preguntas} preguntas
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} style={{ color: safeTheme.colors.current.text.secondary }} />
                      <span style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>
                        {simulacro.tiempo}
                      </span>
                    </div>
                    {simulacro.ultimoIntento && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={16} style={{ color: simulacro.color }} />
                        <span style={{ fontSize: '0.875rem', color: simulacro.color, fontWeight: '600' }}>
                          {simulacro.ultimoIntento}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Mensaje de bloqueo si no tiene acceso */}
                  {!canAccessSimulacro(simulacro) && (
                    <div style={{
                      background: '#ef444420',
                      border: '1px solid #ef4444',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      fontSize: '0.875rem',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🔒 <span>Has alcanzado el límite mensual. Mejora tu plan para acceso ilimitado.</span>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => handleIniciarSimulacro(simulacro)}
                    disabled={!canAccessSimulacro(simulacro)}
                    style={{
                      width: '100%',
                      background: canAccessSimulacro(simulacro) 
                        ? `linear-gradient(135deg, ${simulacro.color}, ${simulacro.color}dd)` 
                        : '#9ca3af',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      color: 'white',
                      fontWeight: '600',
                      cursor: canAccessSimulacro(simulacro) ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      opacity: canAccessSimulacro(simulacro) ? 1 : 0.6,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {canAccessSimulacro(simulacro) ? <Play size={16} /> : <>🔒</>}
                    {canAccessSimulacro(simulacro) 
                      ? (simulacro.estado === 'completado' ? 'Repetir' : 'Iniciar') + ' Simulacro'
                      : 'Bloqueado'}
                  </button>
                </>
              ) : (
                <>
                  {/* Vista en lista */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '1.1rem', 
                        fontWeight: 'bold', 
                        color: safeTheme.colors.current.text.primary
                      }}>
                        {simulacro.nombre}
                      </h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {simulacro.tags.slice(0, 2).map(tag => (
                          <span key={tag} style={{
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.7rem',
                            background: `${simulacro.color}20`,
                            color: simulacro.color,
                            borderRadius: '10px',
                            fontWeight: '500'
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p style={{ 
                      color: safeTheme.colors.current.text.secondary, 
                      fontSize: '0.875rem',
                      margin: 0
                    }}>
                      {simulacro.descripcion}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={14} style={{ color: safeTheme.colors.current.text.secondary }} />
                      <span style={{ color: safeTheme.colors.current.text.secondary }}>
                        {simulacro.preguntas}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} style={{ color: safeTheme.colors.current.text.secondary }} />
                      <span style={{ color: safeTheme.colors.current.text.secondary }}>
                        {simulacro.tiempo}
                      </span>
                    </div>
                    {simulacro.ultimoIntento && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={14} style={{ color: simulacro.color }} />
                        <span style={{ color: simulacro.color, fontWeight: '600' }}>
                          {simulacro.ultimoIntento}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleIniciarSimulacro(simulacro)}
                    disabled={!canAccessSimulacro(simulacro)}
                    style={{
                      background: canAccessSimulacro(simulacro) 
                        ? `linear-gradient(135deg, ${simulacro.color}, ${simulacro.color}dd)` 
                        : '#9ca3af',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem 1.5rem',
                      color: 'white',
                      fontWeight: '600',
                      cursor: canAccessSimulacro(simulacro) ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      whiteSpace: 'nowrap' as const,
                      opacity: canAccessSimulacro(simulacro) ? 1 : 0.6,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {canAccessSimulacro(simulacro) ? <Play size={16} /> : <>🔒</>}
                    {canAccessSimulacro(simulacro) 
                      ? (simulacro.estado === 'completado' ? 'Repetir' : 'Iniciar')
                      : 'Bloqueado'}
                  </button>
                </>
              )}
            </div>
            );
          })}
        </div>

        {sortedSimulacros.length === 0 && (
          <div style={{
            textAlign: 'center' as const,
            padding: '3rem',
            color: safeTheme.colors.current.text.secondary
          }}>
            <Trophy size={48} style={{ marginBottom: '1rem' }} />
            <p>No se encontraron simulacros que coincidan con los filtros seleccionados.</p>
          </div>
        )}

        {/* Modal SimulacroViewer */}
        {showSimulacroViewer && activeSimulacro && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '0' : '2rem'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              maxWidth: isMobile ? '100%' : '1400px',
              background: isDarkMode ? '#1a1a1a' : '#ffffff',
              borderRadius: isMobile ? '0' : '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}>
              <SimulacroViewer
                simulacroId={activeSimulacro.id}
                onComplete={(results: any) => {
                  console.log('Simulacro completado:', results);
                  
                  // Actualizar cupo si no es muestra y tiene plan gratuito
                  if (!activeSimulacro.isSample && userSubscription.plan === 'free') {
                    setUserSubscription(prev => ({
                      ...prev,
                      simulacrosUsados: Math.min(prev.simulacrosUsados + 1, prev.simulacrosMaximos)
                    }));
                  }
                  
                  // Cerrar modal
                  setShowSimulacroViewer(false);
                  setActiveSimulacro(null);
                  
                  // Mostrar resultados
                  alert(`¡Simulacro completado!\n\nPuntaje: ${results.score || 'N/A'}\nRespuestas correctas: ${results.correct || 0}/${results.total || 0}`);
                }}
                onExit={() => {
                  const confirmExit = confirm('¿Seguro que quieres salir? Se perderá tu progreso actual.');
                  if (confirmExit) {
                    setShowSimulacroViewer(false);
                    setActiveSimulacro(null);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Modal de Acceso Denegado */}
        {showAccessDeniedModal && deniedServiceInfo && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <div style={{
              background: isDarkMode ? '#1f2937' : '#ffffff',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              border: `2px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
            }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ 
                  fontSize: '4rem', 
                  marginBottom: '1rem',
                  filter: 'grayscale(100%)'
                }}>
                  🔒
                </div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                  color: isDarkMode ? '#f3f4f6' : '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  Acceso Restringido
                </h2>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.875rem',
                  color: isDarkMode ? '#9ca3af' : '#6b7280'
                }}>
                  No tienes acceso a este servicio
                </p>
              </div>

              {/* Content */}
              <div style={{
                background: isDarkMode ? '#111827' : '#f9fafb',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '600', 
                    textTransform: 'uppercase',
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    marginBottom: '0.25rem',
                    letterSpacing: '0.5px'
                  }}>
                    {deniedServiceInfo.tipo === 'simulacro' ? 'Simulacro' : 'Curso'}
                  </div>
                  <div style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: 'bold',
                    color: isDarkMode ? '#f3f4f6' : '#1f2937'
                  }}>
                    {deniedServiceInfo.nombre}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#ef444420',
                  borderLeft: '4px solid #ef4444',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                  <div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600',
                      color: '#ef4444',
                      marginBottom: '0.25rem'
                    }}>
                      Servicio No Adquirido
                    </div>
                    <div style={{ 
                      fontSize: '0.875rem',
                      color: isDarkMode ? '#d1d5db' : '#4b5563'
                    }}>
                      Este contenido pertenece al servicio <strong>{deniedServiceInfo.servicio}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div style={{ 
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                lineHeight: '1.6'
              }}>
                <p style={{ margin: '0 0 0.75rem' }}>
                  Para acceder a este contenido necesitas adquirir el servicio <strong>{deniedServiceInfo.servicio}</strong>.
                </p>
                <p style={{ margin: 0 }}>
                  Contacta con tu administrador o visita la tienda para obtener acceso.
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    setShowAccessDeniedModal(false);
                    setDeniedServiceInfo(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: `1px solid ${isDarkMode ? '#374151' : '#d1d5db'}`,
                    borderRadius: '8px',
                    background: 'transparent',
                    color: isDarkMode ? '#f3f4f6' : '#1f2937',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowAccessDeniedModal(false);
                    setDeniedServiceInfo(null);
                    alert('Próximamente: Tienda de servicios\n\nPor ahora, contacta con tu administrador para adquirir este servicio.');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Ver Servicios
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMisInformes = () => {
    // Estado para el informe seleccionado
    const [selectedInforme, setSelectedInforme] = React.useState<any>(null);

    // Datos de ejemplo de informes completados (en producción vendrían de Supabase)
    const misInformes = [
      {
        id: '1',
        simulacroId: 'sim1',
        simulacroNombre: 'Simulacro ICFES - Matemáticas',
        servicio: 'ICFES',
        fecha: '2025-10-15T10:30:00',
        porcentaje: 85.5,
        puntajeObtenido: 42,
        puntajeTotal: 50,
        duracion: 90,
        preguntasCorrectas: 34,
        preguntasIncorrectas: 6,
        preguntasNoRespondidas: 2,
        totalPreguntas: 40
      },
      {
        id: '2',
        simulacroId: 'sim2',
        simulacroNombre: 'Simulacro ICFES - Lectura Crítica',
        servicio: 'ICFES',
        fecha: '2025-10-10T14:00:00',
        porcentaje: 78.0,
        puntajeObtenido: 39,
        puntajeTotal: 50,
        duracion: 75,
        preguntasCorrectas: 31,
        preguntasIncorrectas: 8,
        preguntasNoRespondidas: 1,
        totalPreguntas: 40
      },
      {
        id: '3',
        simulacroId: 'sim3',
        simulacroNombre: 'Simulacro ICFES - Ciencias Naturales',
        servicio: 'ICFES',
        fecha: '2025-10-05T09:15:00',
        porcentaje: 92.0,
        puntajeObtenido: 46,
        puntajeTotal: 50,
        duracion: 85,
        preguntasCorrectas: 37,
        preguntasIncorrectas: 3,
        preguntasNoRespondidas: 0,
        totalPreguntas: 40
      }
    ];

    const getColorByPercentage = (percentage: number) => {
      if (percentage >= 80) return '#10b981';
      if (percentage >= 60) return '#f59e0b';
      return '#ef4444';
    };

    const handleViewInforme = (informeId: string) => {
      // Aquí cargaríamos el informe completo desde Supabase
      const informe = misInformes.find(i => i.id === informeId);
      if (!informe) return;

      // Crear informe completo con todos los detalles
      const informeCompleto = {
        ...informe,
        estudianteId: user?.id || 'current-user',
        estudianteNombre: user?.email?.split('@')[0] || 'Estudiante',
        preguntas: Array.from({ length: 5 }, (_, i) => ({
          id: `q${i}`,
          pregunta: `Pregunta de ejemplo ${i + 1}`,
          respuestaCorrecta: 'A',
          respuestaUsuario: i % 3 === 0 ? 'B' : 'A',
          correcta: i % 3 !== 0,
          materia: ['Matemáticas', 'Español', 'Ciencias'][i % 3],
          dificultad: ['facil', 'media', 'dificil'][i % 3] as 'facil' | 'media' | 'dificil',
          tiempoRespuesta: 45 + i * 10
        })),
        analisisPorMateria: [
          { materia: 'Matemáticas', correctas: 12, incorrectas: 3, porcentaje: 80 },
          { materia: 'Español', correctas: 10, incorrectas: 5, porcentaje: 66.7 },
          { materia: 'Ciencias', correctas: 14, incorrectas: 1, porcentaje: 93.3 }
        ],
        analisisPorDificultad: [
          { dificultad: 'facil', correctas: 13, incorrectas: 2, porcentaje: 86.7 },
          { dificultad: 'media', correctas: 11, incorrectas: 4, porcentaje: 73.3 },
          { dificultad: 'dificil', correctas: 8, incorrectas: 7, porcentaje: 53.3 }
        ],
        tiempoPromedioPorPregunta: 67.5,
        recomendaciones: [
          'Reforzar conceptos de geometría analítica',
          'Practicar más ejercicios de lectura crítica',
          'Mejorar velocidad de respuesta en preguntas fáciles'
        ]
      };

      setSelectedInforme(informeCompleto);
    };

    // Si hay un informe seleccionado, mostrar el SimulacroReport
    if (selectedInforme) {
      // Importar dinámicamente el componente SimulacroReport
      const SimulacroReport = require('./SimulacroReport').default;
      return (
        <div style={{ padding: '2rem' }}>
          <button
            onClick={() => setSelectedInforme(null)}
            style={{
              background: safeTheme.colors.current.background.card,
              color: safeTheme.colors.current.text.primary,
              border: `1px solid ${safeTheme.colors.current.border}`,
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            ← Volver a Mis Informes
          </button>
          <SimulacroReport 
            informe={selectedInforme} 
            isDarkMode={isDarkMode}
            showStudentInfo={false}
            onClose={() => setSelectedInforme(null)}
          />
        </div>
      );
    }

    // Vista de lista de informes
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Mis Informes de Simulacros
          </h1>
          <p style={{
            marginTop: '0.5rem',
            color: safeTheme.colors.current.text.secondary,
            fontSize: '0.95rem'
          }}>
            Revisa el rendimiento de tus simulacros completados
          </p>
        </div>

        {/* Estadísticas resumidas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: safeTheme.colors.current.background.card,
            padding: '1.5rem',
            borderRadius: '12px',
            borderLeft: '4px solid #3b82f6'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
              {misInformes.length}
            </div>
            <div style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>
              Simulacros Completados
            </div>
          </div>

          <div style={{
            background: safeTheme.colors.current.background.card,
            padding: '1.5rem',
            borderRadius: '12px',
            borderLeft: '4px solid #10b981'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
              {(misInformes.reduce((sum, i) => sum + i.porcentaje, 0) / misInformes.length).toFixed(1)}%
            </div>
            <div style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>
              Promedio General
            </div>
          </div>

          <div style={{
            background: safeTheme.colors.current.background.card,
            padding: '1.5rem',
            borderRadius: '12px',
            borderLeft: '4px solid #f59e0b'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
              {Math.max(...misInformes.map(i => i.porcentaje)).toFixed(1)}%
            </div>
            <div style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>
              Mejor Puntaje
            </div>
          </div>
        </div>

        {/* Lista de informes */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {misInformes.map((informe) => (
            <div
              key={informe.id}
              style={{
                background: safeTheme.colors.current.background.card,
                border: `1px solid ${safeTheme.colors.current.border}`,
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => handleViewInforme(informe.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: safeTheme.colors.current.text.primary
                }}>
                  {informe.simulacroNombre}
                </h3>
                <div style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: `${getColorByPercentage(informe.porcentaje)}20`,
                    color: getColorByPercentage(informe.porcentaje)
                  }}>
                    {informe.servicio}
                  </span>
                  <span style={{
                    fontSize: '0.875rem',
                    color: safeTheme.colors.current.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Calendar size={14} />
                    {new Date(informe.fecha).toLocaleDateString('es-ES')}
                  </span>
                  <span style={{
                    fontSize: '0.875rem',
                    color: safeTheme.colors.current.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Clock size={14} />
                    {informe.duracion} min
                  </span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: getColorByPercentage(informe.porcentaje)
                  }}>
                    {informe.porcentaje.toFixed(1)}%
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: safeTheme.colors.current.text.secondary,
                    marginTop: '0.25rem'
                  }}>
                    {informe.puntajeObtenido}/{informe.puntajeTotal} pts
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewInforme(informe.id);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Eye size={16} />
                  Ver Informe
                </button>
              </div>
            </div>
          ))}
        </div>

        {misInformes.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: safeTheme.colors.current.text.secondary
          }}>
            <FileText size={48} style={{ margin: '0 auto', opacity: 0.5 }} />
            <p style={{ marginTop: '1rem' }}>
              Aún no has completado ningún simulacro
            </p>
            <button
              onClick={() => navegarA('simulacros')}
              style={{
                marginTop: '1rem',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Ir a Simulacros
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderNoticias = () => (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: safeTheme.colors.current.text.primary }}>Noticias</h1>
      </div>
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {[
          { id:1, titulo:'Nuevo Simulacro Disponible', fecha:'2025-08-28', categoria:'Simulacros', color:'#f59e0b', resumen:'Se ha habilitado un nuevo simulacro de Razonamiento Lógico con 50 preguntas y retroalimentación detallada.' },
          { id:2, titulo:'Actualización de Plataforma', fecha:'2025-08-27', categoria:'Plataforma', color:'#3b82f6', resumen:'Mejoramos el rendimiento de reproducción de videos y añadimos soporte offline para algunos recursos.' },
          { id:3, titulo:'Becas Parciales Disponibles', fecha:'2025-08-26', categoria:'Anuncios', color:'#10b981', resumen:'Aplica a las nuevas becas parciales del 30% para cursos avanzados de programación y física.' },
          { id:4, titulo:'Ranking Semanal de Progreso', fecha:'2025-08-25', categoria:'Comunidad', color:'#8b5cf6', resumen:'Consulta tu posición en el ranking de progreso académico de esta semana.' }
        ].filter(n => n.titulo.toLowerCase().includes(globalSearchTerm.toLowerCase()) || n.resumen.toLowerCase().includes(globalSearchTerm.toLowerCase())).map(noticia => (
          <div key={noticia.id} style={{
            background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.95)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderLeft: `4px solid ${noticia.color}`,
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap: '1rem' }}>
              <div style={{ flex:1 }}>
                <h3 style={{ margin:'0 0 0.5rem 0', fontSize:'1.25rem', fontWeight:'600', color: safeTheme.colors.current.text.primary }}>
                  {noticia.titulo}
                </h3>
                <p style={{ margin:0, fontSize:'0.875rem', color: safeTheme.colors.current.text.secondary }}>
                  {noticia.resumen}
                </p>
              </div>
              <div style={{ textAlign:'right' }}>
                <span style={{
                  background: `${noticia.color}20`,
                  color: noticia.color,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.65rem',
                  fontWeight:'600',
                  letterSpacing:'0.5px'
                }}>{noticia.categoria}</span>
                <div style={{ marginTop:'0.5rem', fontSize:'0.65rem', color: safeTheme.colors.current.text.secondary }}>
                  {noticia.fecha}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <button style={{
                background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius:'6px',
                padding:'0.5rem 0.75rem',
                fontSize:'0.7rem',
                cursor:'pointer',
                color: safeTheme.colors.current.text.primary
              }}>Leer más</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMensajes = () => (
    <div style={{ padding: '2rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: safeTheme.colors.current.text.primary }}>
          Mensajes
        </h1>
        <button style={{
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem 1.5rem',
          color: 'white',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <MessageCircle size={16} />
          Nuevo Mensaje
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: '2rem', height: '600px' }}>
        {/* Lista de conversaciones */}
        <div style={{
          background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          borderRadius: '12px',
          padding: '1rem',
          overflowY: 'auto' as const
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 'bold', color: safeTheme.colors.current.text.primary }}>
            Conversaciones
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              {
                id: 1,
                nombre: 'Dr. García',
                rol: 'Profesor',
                ultimoMensaje: '¿Tienes alguna duda sobre la tarea de integrales?',
                fecha: '2025-08-28',
                hora: '14:30',
                noLeidos: 2,
                activo: true
              },
              {
                id: 2,
                nombre: 'Dra. Martínez',
                rol: 'Profesora',
                ultimoMensaje: 'Excelente trabajo en el último examen',
                fecha: '2025-08-27',
                hora: '09:15',
                noLeidos: 0,
                activo: false
              },
              {
                id: 3,
                nombre: 'Coordinación Académica',
                rol: 'Administración',
                ultimoMensaje: 'Recordatorio: Simulacro programado para mañana',
                fecha: '2025-08-26',
                hora: '16:45',
                noLeidos: 1,
                activo: false
              },
              {
                id: 4,
                nombre: 'Ing. López',
                rol: 'Profesor',
                ultimoMensaje: 'El material complementario ya está disponible',
                fecha: '2025-08-25',
                hora: '11:20',
                noLeidos: 0,
                activo: false
              }
            ].map((conversacion) => (
              <div key={conversacion.id} style={{
                background: conversacion.activo ? 
                  (isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)') :
                  (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)'),
                border: `1px solid ${conversacion.activo ? '#3b82f6' : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')}`,
                borderRadius: '8px',
                padding: '1rem',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 'bold', color: safeTheme.colors.current.text.primary }}>
                      {conversacion.nombre}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: safeTheme.colors.current.text.secondary }}>
                      {conversacion.rol}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: safeTheme.colors.current.text.secondary }}>
                      {conversacion.hora}
                    </span>
                    {conversacion.noLeidos > 0 && (
                      <div style={{
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        {conversacion.noLeidos}
                      </div>
                    )}
                  </div>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: safeTheme.colors.current.text.secondary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap' as const
                }}>
                  {conversacion.ultimoMensaje}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat activo */}
        <div style={{
          background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header del chat */}
          <div style={{
            background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '12px 12px 0 0',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              DG
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem', fontWeight: 'bold', color: safeTheme.colors.current.text.primary }}>
                Dr. García
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>
                Profesor de Cálculo
              </p>
            </div>
          </div>

          {/* Mensajes */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' as const, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { id: 1, texto: 'Buenos días, profesor. Tengo una duda sobre el ejercicio 15 de la página 45.', autor: 'estudiante', hora: '14:25' },
              { id: 2, texto: 'Hola! Claro, dime cuál es tu duda específicamente.', autor: 'profesor', hora: '14:27' },
              { id: 3, texto: 'No entiendo cómo aplicar la regla de la cadena en esa integral por partes.', autor: 'estudiante', hora: '14:28' },
              { id: 4, texto: '¿Tienes alguna duda sobre la tarea de integrales?', autor: 'profesor', hora: '14:30' }
            ].map((mensaje) => (
              <div key={mensaje.id} style={{
                display: 'flex',
                justifyContent: mensaje.autor === 'estudiante' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '70%',
                  background: mensaje.autor === 'estudiante' ? '#3b82f6' : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'),
                  color: mensaje.autor === 'estudiante' ? 'white' : safeTheme.colors.current.text.primary,
                  padding: '0.75rem 1rem',
                  borderRadius: mensaje.autor === 'estudiante' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  border: mensaje.autor === 'profesor' ? `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` : 'none'
                }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', lineHeight: '1.4' }}>
                    {mensaje.texto}
                  </p>
                  <span style={{
                    fontSize: '0.75rem',
                    color: mensaje.autor === 'estudiante' ? 'rgba(255, 255, 255, 0.8)' : safeTheme.colors.current.text.secondary
                  }}>
                    {mensaje.hora}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input de mensaje */}
          <div style={{
            borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            padding: '1rem',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              style={{
                flex: 1,
                padding: '0.75rem',
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: '8px',
                background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                color: safeTheme.colors.current.text.primary,
                outline: 'none'
              }}
            />
            <button style={{
              background: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerfil = () => (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header del perfil con gradiente */}
      <div style={{
        background: `linear-gradient(135deg, ${isDarkMode ? '#1e3a8a, #3730a3' : '#3b82f6, #8b5cf6'})`,
        borderRadius: '20px',
        padding: '3rem 2rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '140px',
            height: '140px',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '3.5rem',
            fontWeight: '700',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
          }}>
            {(user?.email || 'ES').split(/[@\s]/).filter(Boolean).map((w:string)=>w[0]).join('').slice(0,2).toUpperCase()}
          </div>
          
          <div style={{ flex: 1, color: 'white' }}>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', fontWeight: '800' }}>
              {user?.email?.split('@')[0]?.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Estudiante Epsilon'}
            </h1>
            <p style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', opacity: 0.9 }}>
              🎓 Estudiante de Ingeniería | 🚀 Nivel Avanzado
            </p>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
              <span>📅 Miembro desde Enero 2024</span>
              <span>⭐ Puntuación: 4.8/5</span>
            </div>
          </div>
          
          <button style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            padding: '0.75rem 1.5rem',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}>
            <Camera size={18} />
            Cambiar Foto
          </button>
        </div>
      </div>

      {/* Estadísticas principales con tarjetas atractivas */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        {[
          { icon: '📚', value: '5', label: 'Cursos Activos', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
          { icon: '🎯', value: '87%', label: 'Promedio General', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
          { icon: '⚡', value: '24', label: 'Simulacros', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
          { icon: '🏆', value: '12', label: 'Certificados', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' }
        ].map((stat, index) => (
          <div key={index} style={{
            background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center' as const,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer'
          }} onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
          }} onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: stat.bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              fontSize: '1.5rem'
            }}>
              {stat.icon}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color, marginBottom: '0.5rem' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.85rem', color: safeTheme.colors.current.text.secondary, fontWeight: '500' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: '2rem' }}>
        {/* Panel lateral con logros y actividad */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Logros recientes */}
          <div style={{
            background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '16px',
            padding: '1.5rem'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 'bold', color: safeTheme.colors.current.text.primary, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🏅 Logros Recientes
            </h3>
            {[
              { title: 'Completaste Cálculo Diferencial', date: 'Hace 2 días', icon: '🎯', color: '#10b981' },
              { title: 'Racha de 7 días estudiando', date: 'Hace 1 semana', icon: '🔥', color: '#f59e0b' },
              { title: 'Top 10 en Simulacro Nacional', date: 'Hace 2 semanas', icon: '🚀', color: '#8b5cf6' }
            ].map((achievement, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                borderRadius: '10px',
                marginBottom: '0.5rem',
                background: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'
              }}>
                <div style={{ fontSize: '1.5rem' }}>{achievement.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: safeTheme.colors.current.text.primary }}>
                    {achievement.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: safeTheme.colors.current.text.secondary }}>
                    {achievement.date}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progreso semanal */}
          <div style={{
            background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '16px',
            padding: '1.5rem'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 'bold', color: safeTheme.colors.current.text.primary, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📊 Actividad Semanal
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => {
                const activity = [85, 92, 78, 96, 88, 45, 23][index];
                return (
                  <div key={index} style={{ textAlign: 'center' as const }}>
                    <div style={{ fontSize: '0.7rem', color: safeTheme.colors.current.text.secondary, marginBottom: '0.5rem' }}>{day}</div>
                    <div style={{
                      height: '40px',
                      background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'end',
                      padding: '2px'
                    }}>
                      <div style={{
                        width: '100%',
                        background: `linear-gradient(to top, #3b82f6, #8b5cf6)`,
                        borderRadius: '4px',
                        height: `${activity}%`,
                        minHeight: '2px'
                      }} />
                    </div>
                    <div style={{ fontSize: '0.6rem', color: safeTheme.colors.current.text.secondary, marginTop: '0.25rem' }}>{activity}%</div>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: 'center' as const, fontSize: '0.85rem', color: safeTheme.colors.current.text.secondary }}>
              💪 ¡Excelente semana! Sigue así
            </div>
          </div>
        </div>

        {/* Formulario de perfil mejorado */}
        <div style={{
          background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          borderRadius: '16px',
          padding: '2rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: safeTheme.colors.current.text.primary, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚙️ Información Personal
            </h3>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '20px',
              padding: '0.5rem 1rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#10b981'
            }}>
              ✅ Perfil Verificado
            </div>
          </div>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Información básica */}
            <div style={{
              background: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
            }}>
              <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '600', color: safeTheme.colors.current.text.primary, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                👤 Datos Básicos
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: safeTheme.colors.current.text.primary
                  }}>
                    <span style={{ color: '#3b82f6' }}>📝</span>
                    Nombre
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.email?.split('@')[0]?.split('.')[0] || 'Juan Diego'}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      borderRadius: '12px',
                      background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                      color: safeTheme.colors.current.text.primary,
                      outline: 'none',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: safeTheme.colors.current.text.primary
                  }}>
                    <span style={{ color: '#8b5cf6' }}>👤</span>
                    Apellido
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.email?.split('@')[0]?.split('.')[1] || 'Pérez'}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      borderRadius: '12px',
                      background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                      color: safeTheme.colors.current.text.primary,
                      outline: 'none',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8b5cf6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem', 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: safeTheme.colors.current.text.primary
                }}>
                  <span style={{ color: '#10b981' }}>📧</span>
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={user?.email || 'juan.perez@email.com'}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    borderRadius: '12px',
                    background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                    color: safeTheme.colors.current.text.primary,
                    outline: 'none',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10b981';
                    e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Información adicional */}
            <div style={{
              background: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
            }}>
              <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '600', color: safeTheme.colors.current.text.primary, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🎓 Información Académica
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: safeTheme.colors.current.text.primary
                  }}>
                    <span style={{ color: '#f59e0b' }}>📱</span>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    defaultValue="+57 300 123 4567"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      borderRadius: '12px',
                      background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                      color: safeTheme.colors.current.text.primary,
                      outline: 'none',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f59e0b';
                      e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: safeTheme.colors.current.text.primary
                  }}>
                    <span style={{ color: '#ef4444' }}>🎂</span>
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    defaultValue="1998-05-15"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      borderRadius: '12px',
                      background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                      color: safeTheme.colors.current.text.primary,
                      outline: 'none',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ef4444';
                      e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: safeTheme.colors.current.text.primary
                  }}>
                    <span style={{ color: '#06b6d4' }}>🏫</span>
                    Institución Educativa
                  </label>
                  <input
                    type="text"
                    defaultValue="Universidad Nacional de Colombia"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      borderRadius: '12px',
                      background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                      color: safeTheme.colors.current.text.primary,
                      outline: 'none',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#06b6d4';
                      e.target.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: safeTheme.colors.current.text.primary
                  }}>
                    <span style={{ color: '#84cc16' }}>📚</span>
                    Programa Académico
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '1rem',
                    border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    borderRadius: '12px',
                    background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                    color: safeTheme.colors.current.text.primary,
                    outline: 'none',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }} onFocus={(e) => {
                    e.target.style.borderColor = '#84cc16';
                    e.target.style.boxShadow = '0 0 0 3px rgba(132, 204, 22, 0.1)';
                  }} onBlur={(e) => {
                    e.target.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}>
                    <option value="">Seleccionar programa</option>
                    <option value="ingenieria">🔧 Ingeniería</option>
                    <option value="medicina">⚕️ Medicina</option>
                    <option value="derecho">⚖️ Derecho</option>
                    <option value="administracion">💼 Administración</option>
                    <option value="psicologia">🧠 Psicología</option>
                    <option value="arquitectura">🏗️ Arquitectura</option>
                    <option value="comunicacion">📺 Comunicación</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Biografía */}
            <div style={{
              background: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
            }}>
              <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '600', color: safeTheme.colors.current.text.primary, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ✍️ Biografía Personal
              </h4>
              <textarea
                defaultValue="🚀 Estudiante de ingeniería apasionado por las matemáticas y la programación. Siempre busco nuevos desafíos académicos para expandir mis conocimientos y crecer profesionalmente. Me encanta resolver problemas complejos y trabajar en equipo."
                rows={4}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  borderRadius: '12px',
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                  color: safeTheme.colors.current.text.primary,
                  outline: 'none',
                  resize: 'vertical' as const,
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button style={{
                background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                borderRadius: '12px',
                padding: '0.75rem 1.5rem',
                color: safeTheme.colors.current.text.primary,
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }} onMouseOver={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';
              }} onMouseOut={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
              }}>
                ❌ Cancelar
              </button>
              <button style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 2rem',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s ease'
              }} onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
              }} onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
              }}>
                <Save size={18} />
                💾 Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTienda = () => {
    const handleAdquirir = (servicioId: string) => {
      // Agregar servicio a serviciosAdquiridos
      setServiciosAdquiridos(prev => [...prev, servicioId]);
      
      // Mostrar notificación
      alert(`¡Felicitaciones! Has adquirido el servicio: ${servicioId.toUpperCase()}\n\nAhora tienes acceso a todos los simulacros y cursos de este servicio.`);
      
      // Volver a Dashboard
      setTimeout(() => {
        setCurrentPage('dashboard');
      }, 500);
    };

    return (
      <ServicesStore 
        serviciosAdquiridos={serviciosAdquiridos}
        isDarkMode={isDarkMode}
        onAdquirir={handleAdquirir}
      />
    );
  };

  const renderDashboard = () => (
    <div style={{ padding: isMobile ? '1rem' : '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Hero Section - Bienvenida Publicitaria */}
      <div style={{
        background: `linear-gradient(135deg, ${isDarkMode ? '#1e3a8a, #7c3aed' : '#3b82f6, #8b5cf6'})`,
        borderRadius: '24px',
        padding: '3rem 2rem',
        marginBottom: '3rem',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, color: 'white' }}>
          <h1 style={{ 
            margin: '0 0 1rem 0', 
            fontSize: isMobile ? '2rem' : '3rem', 
            fontWeight: '800',
            background: 'linear-gradient(45deg, #ffffff, #f1f5f9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            ¡Bienvenido de vuelta, {
              user?.email ? 
                (user.email.split('@')[0]?.split('.')[0]?.charAt(0).toUpperCase() || '') + 
                (user.email.split('@')[0]?.split('.')[0]?.slice(1) || '') 
                : 'Estudiante'
            }! 🎓
          </h1>
          <p style={{ 
            margin: '0 auto 2rem auto', 
            fontSize: '1.2rem', 
            opacity: 0.95,
            maxWidth: '600px'
          }}>
            Descubre nuevos cursos, mantente al día con las últimas noticias académicas y alcanza tus metas educativas
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navegarA('oferta-academica')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '15px',
                padding: '1rem 2rem',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                fontSize: '1rem'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              🚀 Explorar Cursos
            </button>
            <button 
              onClick={() => navegarA('noticias')}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '15px',
                padding: '1rem 2rem',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                fontSize: '1rem'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              📢 Ver Noticias
            </button>
          </div>
        </div>
      </div>

      {/* Sección de Ofertas Destacadas */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ 
            margin: '0 0 1rem 0', 
            fontSize: '2.5rem', 
            fontWeight: '800', 
            color: safeTheme.colors.current.text.primary,
            background: isDarkMode ? 'linear-gradient(45deg, #3b82f6, #8b5cf6)' : 'linear-gradient(45deg, #1e40af, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🌟 Cursos Destacados
          </h2>
          <p style={{ 
            fontSize: '1.1rem', 
            color: safeTheme.colors.current.text.secondary,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Los cursos más populares y mejor valorados por nuestros estudiantes
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {[
            { 
              nombre: 'Cálculo Diferencial Avanzado', 
              profesor: 'Dr. García', 
              estudiantes: 2400, 
              rating: 4.9, 
              precio: 'Gratis', 
              categoria: 'Matemáticas',
              color: '#3b82f6',
              icono: '📐',
              tiempo: '12 semanas',
              descripcion: 'Domina las técnicas avanzadas del cálculo diferencial'
            },
            { 
              nombre: 'Python para Data Science', 
              profesor: 'Ing. Martínez', 
              estudiantes: 3200, 
              rating: 4.8, 
              precio: '$99', 
              categoria: 'Programación',
              color: '#10b981',
              icono: '🐍',
              tiempo: '8 semanas',
              descripcion: 'Aprende Python aplicado a ciencia de datos'
            },
            { 
              nombre: 'Física Cuántica Fundamental', 
              profesor: 'Dra. López', 
              estudiantes: 1800, 
              rating: 4.7, 
              precio: '$149', 
              categoria: 'Física',
              color: '#8b5cf6',
              icono: '⚛️',
              tiempo: '16 semanas',
              descripcion: 'Explora los misterios del mundo cuántico'
            }
          ].map((curso, index) => (
            <div key={index} style={{
              background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              borderRadius: '20px',
              padding: '2rem',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }} onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            }} onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }} onClick={() => navegarA('oferta-academica')}>
              
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: curso.color,
                color: 'white',
                padding: '0.5rem 1rem',
                borderBottomLeftRadius: '15px',
                fontWeight: '700',
                fontSize: '0.9rem'
              }}>
                {curso.precio}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: `${curso.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  marginBottom: '1rem'
                }}>
                  {curso.icono}
                </div>
                
                <div style={{
                  background: `${curso.color}20`,
                  color: curso.color,
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  display: 'inline-block',
                  marginBottom: '1rem'
                }}>
                  {curso.categoria}
                </div>
                
                <h3 style={{ 
                  margin: '0 0 0.5rem 0', 
                  fontSize: '1.4rem', 
                  fontWeight: '700', 
                  color: safeTheme.colors.current.text.primary 
                }}>
                  {curso.nombre}
                </h3>
                
                <p style={{ 
                  margin: '0 0 1rem 0', 
                  color: safeTheme.colors.current.text.secondary,
                  fontSize: '0.95rem',
                  lineHeight: '1.5'
                }}>
                  {curso.descripcion}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: safeTheme.colors.current.text.secondary }}>
                  👨‍🏫 {curso.profesor}
                </div>
                <div style={{ fontSize: '0.85rem', color: safeTheme.colors.current.text.secondary }}>
                  ⏱️ {curso.tiempo}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ color: '#fbbf24', fontSize: '1rem' }}>⭐</div>
                  <span style={{ fontWeight: '600', color: safeTheme.colors.current.text.primary }}>{curso.rating}</span>
                  <span style={{ fontSize: '0.8rem', color: safeTheme.colors.current.text.secondary }}>
                    ({curso.estudiantes.toLocaleString()} estudiantes)
                  </span>
                </div>
              </div>

              <button style={{
                width: '100%',
                background: `linear-gradient(135deg, ${curso.color}, ${curso.color}dd)`,
                border: 'none',
                borderRadius: '12px',
                padding: '1rem',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }} onMouseOver={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${curso.color}ee, ${curso.color}cc)`;
              }} onMouseOut={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${curso.color}, ${curso.color}dd)`;
              }}>
                🎓 Inscribirse Ahora
              </button>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => navegarA('oferta-academica')}
            style={{
              background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
              borderRadius: '15px',
              padding: '1rem 2rem',
              color: safeTheme.colors.current.text.primary,
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
            }}
          >
            📚 Ver Todos los Cursos (+250 disponibles)
          </button>
        </div>
      </div>

      {/* Sección de Noticias Promocionales */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ 
            margin: '0 0 1rem 0', 
            fontSize: '2.5rem', 
            fontWeight: '800', 
            color: safeTheme.colors.current.text.primary,
            background: isDarkMode ? 'linear-gradient(45deg, #f59e0b, #ef4444)' : 'linear-gradient(45deg, #ea580c, #dc2626)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            📢 Últimas Noticias
          </h2>
          <p style={{ 
            fontSize: '1.1rem', 
            color: safeTheme.colors.current.text.secondary,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Mantente al día con los últimos acontecimientos académicos
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {[
            {
              titulo: '🎉 Nueva Especialización en IA',
              descripcion: 'Lanzamos nuestra nueva especialización en Inteligencia Artificial con certificación internacional',
              categoria: 'Nuevos Cursos',
              fecha: 'Hace 2 días',
              color: '#3b82f6',
              icono: '🤖'
            },
            {
              titulo: '💡 Simulacro Nacional ICFES',
              descripcion: 'Regístrate para el simulacro nacional gratuito. Últimos cupos disponibles',
              categoria: 'Simulacros',
              fecha: 'Hace 1 día',
              color: '#f59e0b',
              icono: '📝'
            },
            {
              titulo: '🏆 Becas de Excelencia 2025',
              descripcion: 'Postúlate a nuestras becas de excelencia académica. Convocatoria abierta hasta marzo',
              categoria: 'Becas',
              fecha: 'Hace 3 días',
              color: '#10b981',
              icono: '💰'
            },
            {
              titulo: '🚀 Actualización de Plataforma',
              descripcion: 'Nueva interfaz, mejores herramientas y experiencia optimizada para móviles',
              categoria: 'Plataforma',
              fecha: 'Hace 1 semana',
              color: '#8b5cf6',
              icono: '⚡'
            }
          ].map((noticia, index) => (
            <div key={index} style={{
              background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              borderRadius: '16px',
              padding: '1.5rem',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }} onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
            }} onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }} onClick={() => navegarA('noticias')}>
              
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${noticia.color}, ${noticia.color}aa)`
              }} />

              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  background: `${noticia.color}20`,
                  color: noticia.color,
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <span>{noticia.icono}</span>
                  {noticia.categoria}
                </div>
                
                <h3 style={{ 
                  margin: '0 0 0.75rem 0', 
                  fontSize: '1.2rem', 
                  fontWeight: '700', 
                  color: safeTheme.colors.current.text.primary,
                  lineHeight: '1.4'
                }}>
                  {noticia.titulo}
                </h3>
                
                <p style={{ 
                  margin: '0 0 1rem 0', 
                  color: safeTheme.colors.current.text.secondary,
                  fontSize: '0.9rem',
                  lineHeight: '1.5'
                }}>
                  {noticia.descripcion}
                </p>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '0.8rem',
                color: safeTheme.colors.current.text.secondary
              }}>
                <span>📅 {noticia.fecha}</span>
                <span style={{ color: noticia.color, fontWeight: '600' }}>Leer más →</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => navegarA('noticias')}
            style={{
              background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
              borderRadius: '15px',
              padding: '1rem 2rem',
              color: safeTheme.colors.current.text.primary,
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
            }}
          >
            📰 Ver Todas las Noticias
          </button>
        </div>
      </div>

      {/* Call to Action Final */}
      <div style={{
        background: `linear-gradient(135deg, ${isDarkMode ? '#059669, #0d9488' : '#10b981, #059669'})`,
        borderRadius: '24px',
        padding: '3rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-30%',
          left: '-20%',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, color: 'white' }}>
          <h2 style={{ 
            margin: '0 0 1rem 0', 
            fontSize: isMobile ? '1.8rem' : '2.2rem', 
            fontWeight: '800'
          }}>
            ¿Listo para alcanzar tus metas? 🎯
          </h2>
          <p style={{ 
            margin: '0 auto 2rem auto', 
            fontSize: '1.1rem', 
            opacity: 0.95,
            maxWidth: '500px'
          }}>
            Únete a miles de estudiantes que ya están transformando su futuro con Epsilon Academy
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navegarA('oferta-academica')}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: '15px',
                padding: '1rem 2rem',
                color: '#059669',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '1rem'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              🚀 Explorar Cursos
            </button>
            <button 
              onClick={() => navegarA('simulacros')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '15px',
                padding: '1rem 2rem',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                fontSize: '1rem'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              🎯 Practicar Simulacros
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar contenido según la página actual
  const renderContent = () => {
    switch (currentPage) {
      case 'oferta-academica':
        return renderOfertaAcademica();
      case 'mis-cursos':
        return renderMisCursos();
      case 'clases-vivo':
        return renderClasesVivo();
      case 'simulacros':
        return renderSimulacros();
      case 'mis-informes':
        return renderMisInformes();
      case 'noticias':
        return renderNoticias();
      case 'mensajes':
        return renderMensajes();
      case 'perfil':
        return renderPerfil();
      case 'tienda':
        return renderTienda();
      default:
        return renderDashboard();
    }
  };

  const renderOfertaAcademica = () => {
    const cursos = [
      {
        id: 1,
        nombre: 'Cálculo Diferencial',
        descripcion: 'Fundamentos del cálculo diferencial para ingeniería y ciencias',
        duracion: '12 semanas',
        nivel: 'Intermedio',
        profesor: 'Dr. García',
        rating: 4.8,
        estudiantes: 245,
        precio: 299000,
        categoria: 'Matemáticas',
        servicio: 'ICFES',
        tags: ['Certificado', 'Intermedio', 'Popular'],
        color: '#3b82f6',
        fecha: '2025-09-01'
      },
      {
        id: 2,
        nombre: 'Álgebra Lineal',
        descripcion: 'Vectores, matrices y transformaciones lineales',
        duracion: '10 semanas',
        nivel: 'Avanzado',
        profesor: 'Dra. Martínez',
        rating: 4.6,
        estudiantes: 189,
        precio: 349000,
        categoria: 'Matemáticas',
        servicio: 'Saber Pro',
        tags: ['Avanzado', 'Certificado'],
        color: '#3b82f6',
        fecha: '2025-09-15'
      },
      {
        id: 3,
        nombre: 'Geometría Analítica',
        descripcion: 'Estudio de figuras geométricas mediante álgebra',
        duracion: '8 semanas',
        nivel: 'Básico',
        profesor: 'Prof. López',
        rating: 4.9,
        estudiantes: 312,
        precio: 199000,
        categoria: 'Matemáticas',
        servicio: 'ICFES',
        tags: ['Básico', 'Popular', 'Nuevo'],
        color: '#3b82f6',
        fecha: '2025-08-30'
      },
      {
        id: 4,
        nombre: 'Mecánica Clásica',
        descripcion: 'Fundamentos de la física newtoniana aplicada',
        duracion: '14 semanas',
        nivel: 'Intermedio',
        profesor: 'Dr. Rodríguez',
        rating: 4.7,
        estudiantes: 198,
        precio: 399000,
        categoria: 'Física',
        servicio: 'Admisiones',
        tags: ['Intermedio', 'Certificado'],
        color: '#10b981',
        fecha: '2025-09-10'
      },
      {
        id: 5,
        nombre: 'Electromagnetismo',
        descripcion: 'Campos eléctricos y magnéticos en la física moderna',
        duracion: '16 semanas',
        nivel: 'Avanzado',
        profesor: 'Dra. Fernández',
        rating: 4.5,
        estudiantes: 156,
        precio: 449000,
        categoria: 'Física',
        servicio: 'Saber Pro',
        tags: ['Avanzado', 'Premium'],
        color: '#10b981',
        fecha: '2025-09-20'
      },
      {
        id: 6,
        nombre: 'Python Básico',
        descripcion: 'Introducción a la programación con Python',
        duracion: '12 semanas',
        nivel: 'Básico',
        profesor: 'Ing. González',
        rating: 4.9,
        estudiantes: 423,
        precio: 249000,
        categoria: 'Programación',
        servicio: 'Cursos Especializados',
        tags: ['Básico', 'Popular', 'Gratuito'],
        color: '#8b5cf6',
        fecha: '2025-08-28'
      },
      {
        id: 7,
        nombre: 'JavaScript Moderno',
        descripcion: 'ES6+ y desarrollo web frontend avanzado',
        duracion: '10 semanas',
        nivel: 'Intermedio',
        profesor: 'Dev. Morales',
        rating: 4.8,
        estudiantes: 367,
        precio: 329000,
        categoria: 'Programación',
        servicio: 'Corporativo',
        tags: ['Intermedio', 'Nuevo', 'Premium'],
        color: '#8b5cf6',
        fecha: '2025-09-05'
      }
    ];

    // Filtrar cursos
    const filteredCursos = cursos.filter(curso => {
      const matchesSearch = curso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           curso.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           curso.profesor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'todas' || 
                             curso.categoria.toLowerCase() === selectedCategory.toLowerCase();
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => curso.tags.includes(tag));
      
      return matchesSearch && matchesCategory && matchesTags;
    });

    // Ordenar cursos
    const sortedCursos = [...filteredCursos].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.nombre;
          bValue = b.nombre;
          break;
        case 'date':
          aValue = a.fecha;
          bValue = b.fecha;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'progress':
          aValue = a.estudiantes;
          bValue = b.estudiantes;
          break;
        default:
          aValue = a.nombre;
          bValue = b.nombre;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return (
      <div style={{ padding: '2rem' }}>
        <ToolbarComponent 
          title="Oferta Académica"
          showNewButton={false}
        />

        {/* Vista de cursos */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: viewMode === 'grid' 
            ? 'repeat(auto-fit, minmax(380px, 1fr))' 
            : '1fr',
          gap: '1.5rem' 
        }}>
          {sortedCursos.map((curso) => {
            const tieneAcceso = tieneAccesoAServicio(curso.servicio);
            return (
            <div key={curso.id} style={{
              position: 'relative',
              background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              borderLeft: `4px solid ${tieneAcceso ? curso.color : '#9ca3af'}`,
              borderRadius: '12px',
              padding: viewMode === 'list' ? '1.5rem' : '2rem',
              display: viewMode === 'list' ? 'flex' : 'block',
              alignItems: viewMode === 'list' ? 'center' : 'initial',
              gap: viewMode === 'list' ? '1.5rem' : '0',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              opacity: tieneAcceso ? 1 : 0.7
            }}
            onMouseOver={(e) => {
              if (tieneAcceso) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${curso.color}20`;
              }
            }}
            onMouseOut={(e) => {
              if (tieneAcceso) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}>
              
              {/* Overlay de servicio bloqueado */}
              {!tieneAcceso && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0 12px 0 12px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  zIndex: 1,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}>
                  🔒 Sin Acceso
                </div>
              )}
              
              {viewMode === 'grid' ? (
                <>
                  {/* Vista en cuadrícula */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '1.25rem', 
                        fontWeight: 'bold', 
                        color: safeTheme.colors.current.text.primary,
                        marginBottom: '0.5rem'
                      }}>
                        {curso.nombre}
                      </h3>
                      <span style={{ 
                        padding:'0.125rem 0.5rem', 
                        background:'#6366f120', 
                        color:'#6366f1', 
                        borderRadius:4, 
                        fontSize:'0.625rem',
                        fontWeight: '700',
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.5px',
                        display: 'inline-block',
                        marginBottom: '0.5rem'
                      }}>
                        {curso.servicio}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {curso.tags.map(tag => (
                          <span key={tag} style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            background: `${curso.color}20`,
                            color: curso.color,
                            borderRadius: '12px',
                            fontWeight: '500'
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{
                      background: curso.nivel === 'Básico' ? '#10b98120' : curso.nivel === 'Intermedio' ? '#f59e0b20' : '#ef444420',
                      color: curso.nivel === 'Básico' ? '#10b981' : curso.nivel === 'Intermedio' ? '#f59e0b' : '#ef4444',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {curso.nivel}
                    </div>
                  </div>
                  
                  <p style={{ 
                    color: safeTheme.colors.current.text.secondary, 
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    marginBottom: '1.5rem'
                  }}>
                    {curso.descripcion}
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={16} style={{ color: safeTheme.colors.current.text.secondary }} />
                      <span style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>
                        {curso.profesor}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} style={{ color: safeTheme.colors.current.text.secondary }} />
                      <span style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>
                        {curso.duracion}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} style={{ color: safeTheme.colors.current.text.secondary }} />
                      <span style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>
                        {curso.estudiantes} estudiantes
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Star size={16} style={{ color: curso.color }} />
                      <span style={{ fontSize: '0.875rem', color: curso.color, fontWeight: '600' }}>
                        {curso.rating}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: curso.color }}>
                        ${curso.precio.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: safeTheme.colors.current.text.secondary }}>
                        Pago único
                      </span>
                    </div>
                    <button 
                      onClick={() => handleInscribirseCurso(curso)}
                      disabled={!tieneAccesoAServicio(curso.servicio)}
                      style={{
                        background: tieneAccesoAServicio(curso.servicio) 
                          ? `linear-gradient(135deg, ${curso.color}, ${curso.color}dd)` 
                          : '#9ca3af',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.75rem 1.5rem',
                        color: 'white',
                        fontWeight: '600',
                        cursor: tieneAccesoAServicio(curso.servicio) ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: tieneAccesoAServicio(curso.servicio) ? 1 : 0.6
                      }}>
                      {tieneAccesoAServicio(curso.servicio) ? (
                        <>
                          <BookOpen size={16} />
                          Inscribirse
                        </>
                      ) : (
                        <>
                          🔒 Servicio No Adquirido
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Vista en lista */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '1.1rem', 
                        fontWeight: 'bold', 
                        color: safeTheme.colors.current.text.primary
                      }}>
                        {curso.nombre}
                      </h3>
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
                        {curso.servicio}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {curso.tags.slice(0, 2).map(tag => (
                          <span key={tag} style={{
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.7rem',
                            background: `${curso.color}20`,
                            color: curso.color,
                            borderRadius: '10px',
                            fontWeight: '500'
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div style={{
                        background: curso.nivel === 'Básico' ? '#10b98120' : curso.nivel === 'Intermedio' ? '#f59e0b20' : '#ef444420',
                        color: curso.nivel === 'Básico' ? '#10b981' : curso.nivel === 'Intermedio' ? '#f59e0b' : '#ef4444',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '10px',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>
                        {curso.nivel}
                      </div>
                    </div>
                    <p style={{ 
                      color: safeTheme.colors.current.text.secondary, 
                      fontSize: '0.875rem',
                      margin: 0
                    }}>
                      {curso.descripcion}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={14} style={{ color: safeTheme.colors.current.text.secondary }} />
                      <span style={{ color: safeTheme.colors.current.text.secondary }}>
                        {curso.profesor}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={14} style={{ color: safeTheme.colors.current.text.secondary }} />
                      <span style={{ color: safeTheme.colors.current.text.secondary }}>
                        {curso.estudiantes}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Star size={14} style={{ color: curso.color }} />
                      <span style={{ color: curso.color, fontWeight: '600' }}>
                        {curso.rating}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' as const }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: curso.color }}>
                        ${curso.precio.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: safeTheme.colors.current.text.secondary }}>
                        Pago único
                      </div>
                    </div>
                    <button 
                      onClick={() => handleInscribirseCurso(curso)}
                      disabled={!tieneAccesoAServicio(curso.servicio)}
                      style={{
                        background: tieneAccesoAServicio(curso.servicio)
                          ? `linear-gradient(135deg, ${curso.color}, ${curso.color}dd)`
                          : '#9ca3af',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.75rem 1.5rem',
                        color: 'white',
                        fontWeight: '600',
                        cursor: tieneAccesoAServicio(curso.servicio) ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        whiteSpace: 'nowrap' as const,
                        opacity: tieneAccesoAServicio(curso.servicio) ? 1 : 0.6
                      }}>
                      {tieneAccesoAServicio(curso.servicio) ? (
                        <>
                          <BookOpen size={16} />
                          Inscribirse
                        </>
                      ) : (
                        <>🔒 Bloqueado</>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
            );
          })}
        </div>

        {sortedCursos.length === 0 && (
          <div style={{
            textAlign: 'center' as const,
            padding: '3rem',
            color: safeTheme.colors.current.text.secondary
          }}>
            <BookOpen size={48} style={{ marginBottom: '1rem' }} />
            <p>No se encontraron cursos que coincidan con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    );
  };

  const renderMisCursos = () => {
    const cursos = [
      { 
        id: 1, 
        nombre: 'Cálculo Diferencial', 
        progreso: 95, 
        profesor: 'Dr. García', 
        siguiente: 'Integrales por partes', 
        color: '#3b82f6', 
        tiempoEstudio: '8h/sem', 
        proximaClase: '2025-08-30',
        categoria: 'En Progreso',
        servicio: 'ICFES',
        tags: ['Favorito', 'En Curso'],
        fecha: '2025-01-15'
      },
      { 
        id: 2, 
        nombre: 'Álgebra Lineal', 
        progreso: 62, 
        profesor: 'Dra. Martínez', 
        siguiente: 'Eigenvalores y eigenvectores', 
        color: '#10b981', 
        tiempoEstudio: '6h/sem', 
        proximaClase: '2025-08-29',
        categoria: 'En Progreso',
        servicio: 'Saber Pro',
        tags: ['En Curso'],
        fecha: '2025-02-01'
      },
      { 
        id: 3, 
        nombre: 'Python Básico', 
        progreso: 100, 
        profesor: 'Ing. López', 
        siguiente: 'Curso completado', 
        color: '#8b5cf6', 
        tiempoEstudio: '5h/sem', 
        proximaClase: null,
        categoria: 'Completados',
        servicio: 'Cursos Especializados',
        tags: ['Completado', 'Certificado'],
        fecha: '2024-12-10'
      },
      { 
        id: 4, 
        nombre: 'Física General', 
        progreso: 45, 
        profesor: 'Dr. Rodríguez', 
        siguiente: 'Leyes de Newton', 
        color: '#f59e0b', 
        tiempoEstudio: '7h/sem', 
        proximaClase: '2025-09-01',
        categoria: 'En Progreso',
        servicio: 'Admisiones',
        tags: ['En Curso', 'Urgente'],
        fecha: '2025-03-01'
      },
      { 
        id: 5, 
        nombre: 'Química Orgánica', 
        progreso: 89, 
        profesor: 'Dra. Silva', 
        siguiente: 'Reacciones de sustitución', 
        color: '#ef4444', 
        tiempoEstudio: '4h/sem', 
        proximaClase: '2025-08-28',
        categoria: 'En Progreso',
        servicio: 'Corporativo',
        tags: ['En Curso', 'Favorito'],
        fecha: '2025-01-20'
      }
    ];

    // Filtrar cursos
    const filteredCursos = cursos.filter(curso => {
      const matchesSearch = curso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           curso.profesor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'todas' || selectedCategory === 'todos' || 
                             curso.categoria.toLowerCase() === selectedCategory.toLowerCase();
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => curso.tags.includes(tag));
      
      return matchesSearch && matchesCategory && matchesTags;
    });

    // Ordenar cursos
    const sortedCursos = [...filteredCursos].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.nombre;
          bValue = b.nombre;
          break;
        case 'date':
          aValue = a.fecha;
          bValue = b.fecha;
          break;
        case 'rating':
          aValue = a.progreso;
          bValue = b.progreso;
          break;
        case 'progress':
          aValue = a.progreso;
          bValue = b.progreso;
          break;
        default:
          aValue = a.nombre;
          bValue = b.nombre;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return (
      <div style={{ padding: '2rem' }}>
        <ToolbarComponent 
          title="Mis Cursos"
          showNewButton={false}
        />

        {/* Resumen de progreso */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{
            background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center' as const
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>5</div>
            <div style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>Cursos Activos</div>
          </div>
          <div style={{
            background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center' as const
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem' }}>78%</div>
            <div style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>Progreso Promedio</div>
          </div>
          <div style={{
            background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center' as const
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem' }}>12</div>
            <div style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>Certificados</div>
          </div>
        </div>

        {/* Vista de cursos */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: viewMode === 'grid' 
            ? 'repeat(auto-fit, minmax(400px, 1fr))' 
            : '1fr',
          gap: '1.5rem' 
        }}>
          {sortedCursos.map((curso) => {
            const tieneAcceso = tieneAccesoAServicio(curso.servicio);
            return (
            <div key={curso.id} style={{
              position: 'relative',
              background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              borderLeft: `4px solid ${tieneAcceso ? curso.color : '#9ca3af'}`,
              borderRadius: '12px',
              padding: viewMode === 'list' ? '1.5rem' : '2rem',
              display: viewMode === 'list' ? 'flex' : 'block',
              alignItems: viewMode === 'list' ? 'center' : 'initial',
              gap: viewMode === 'list' ? '1.5rem' : '0',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              opacity: tieneAcceso ? 1 : 0.7
            }}
            onMouseOver={(e) => {
              if (tieneAcceso) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${curso.color}20`;
              }
            }}
            onMouseOut={(e) => {
              if (tieneAcceso) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}>
              
              {/* Overlay de servicio bloqueado */}
              {!tieneAcceso && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0 12px 0 12px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  zIndex: 1,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}>
                  🔒 Sin Acceso
                </div>
              )}
              
              {viewMode === 'grid' ? (
                <>
                  {/* Vista en cuadrícula */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '1.25rem', 
                        fontWeight: 'bold', 
                        color: safeTheme.colors.current.text.primary,
                        marginBottom: '0.5rem'
                      }}>
                        {curso.nombre}
                      </h3>
                      <span style={{ 
                        padding:'0.125rem 0.5rem', 
                        background:'#6366f120', 
                        color:'#6366f1', 
                        borderRadius:4, 
                        fontSize:'0.625rem',
                        fontWeight: '700',
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.5px',
                        display: 'inline-block',
                        marginBottom: '0.5rem'
                      }}>
                        {curso.servicio}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {curso.tags.map(tag => (
                          <span key={tag} style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            background: `${curso.color}20`,
                            color: curso.color,
                            borderRadius: '12px',
                            fontWeight: '500'
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>
                        Prof. {curso.profesor}
                      </p>
                    </div>
                    <div style={{
                      background: `${curso.color}20`,
                      color: curso.color,
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}>
                      {curso.progreso}%
                    </div>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ 
                      background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', 
                      borderRadius: '10px', 
                      height: '8px', 
                      overflow: 'hidden' 
                    }}>
                      <div style={{
                        background: `linear-gradient(90deg, ${curso.color}, ${curso.color}cc)`,
                        height: '100%',
                        width: `${curso.progreso}%`,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} style={{ color: safeTheme.colors.current.text.secondary }} />
                      <span style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>
                        {curso.tiempoEstudio}
                      </span>
                    </div>
                    {curso.proximaClase && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} style={{ color: safeTheme.colors.current.text.secondary }} />
                        <span style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>
                          {curso.proximaClase}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {curso.siguiente && (
                    <div style={{ 
                      background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginBottom: '1.5rem'
                    }}>
                      <span style={{ fontSize: '0.75rem', color: safeTheme.colors.current.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Próximo tema:
                      </span>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: safeTheme.colors.current.text.primary, fontWeight: '500' }}>
                        {curso.siguiente}
                      </p>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => handleAccederCurso(curso)}
                    disabled={!tieneAccesoAServicio(curso.servicio)}
                    style={{
                      width: '100%',
                      background: tieneAccesoAServicio(curso.servicio)
                        ? `linear-gradient(135deg, ${curso.color}, ${curso.color}dd)`
                        : '#9ca3af',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      color: 'white',
                      fontWeight: '600',
                      cursor: tieneAccesoAServicio(curso.servicio) ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      opacity: tieneAccesoAServicio(curso.servicio) ? 1 : 0.6
                    }}>
                    {tieneAccesoAServicio(curso.servicio) ? (
                      <>
                        <Play size={16} />
                        {curso.progreso === 100 ? 'Revisar Curso' : 'Continuar'}
                      </>
                    ) : (
                      <>🔒 Acceso Denegado</>
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* Vista en lista */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '1.1rem', 
                        fontWeight: 'bold', 
                        color: safeTheme.colors.current.text.primary
                      }}>
                        {curso.nombre}
                      </h3>
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
                        {curso.servicio}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {curso.tags.slice(0, 2).map(tag => (
                          <span key={tag} style={{
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.7rem',
                            background: `${curso.color}20`,
                            color: curso.color,
                            borderRadius: '10px',
                            fontWeight: '500'
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p style={{ 
                      color: safeTheme.colors.current.text.secondary, 
                      fontSize: '0.875rem',
                      margin: 0
                    }}>
                      Prof. {curso.profesor} • {curso.tiempoEstudio}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', 
                        borderRadius: '10px', 
                        height: '6px', 
                        width: '80px',
                        overflow: 'hidden' 
                      }}>
                        <div style={{
                          background: `linear-gradient(90deg, ${curso.color}, ${curso.color}cc)`,
                          height: '100%',
                          width: `${curso.progreso}%`,
                        }} />
                      </div>
                      <span style={{ fontSize: '0.875rem', color: curso.color, fontWeight: '600' }}>
                        {curso.progreso}%
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleAccederCurso(curso)}
                    disabled={!tieneAccesoAServicio(curso.servicio)}
                    style={{
                      background: tieneAccesoAServicio(curso.servicio)
                        ? `linear-gradient(135deg, ${curso.color}, ${curso.color}dd)`
                        : '#9ca3af',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem 1.5rem',
                      color: 'white',
                      fontWeight: '600',
                      cursor: tieneAccesoAServicio(curso.servicio) ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      whiteSpace: 'nowrap' as const,
                      opacity: tieneAccesoAServicio(curso.servicio) ? 1 : 0.6
                    }}>
                    {tieneAccesoAServicio(curso.servicio) ? (
                      <>
                        <Play size={16} />
                        {curso.progreso === 100 ? 'Revisar' : 'Continuar'}
                      </>
                    ) : (
                      <>🔒 Bloqueado</>
                    )}
                  </button>
                </>
              )}
            </div>
            );
          })}
        </div>

        {sortedCursos.length === 0 && (
          <div style={{
            textAlign: 'center' as const,
            padding: '3rem',
            color: safeTheme.colors.current.text.secondary
          }}>
            <BookOpen size={48} style={{ marginBottom: '1rem' }} />
            <p>No se encontraron cursos que coincidan con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    );
  };

  const renderClasesVivo = () => {
    const clasesEnVivo = [
      {
        id: 1,
        titulo: 'Cálculo Diferencial - Derivadas Parciales',
        profesor: 'Dr. García Martínez',
        curso: 'Cálculo Diferencial',
        fecha: '2025-08-28',
        horaInicio: '14:00',
        horaFin: '15:30',
        duracion: 90,
        estado: 'en-vivo',
        participantes: 34,
        maxParticipantes: 50,
        descripcion: 'Clase práctica sobre derivadas parciales con ejemplos aplicados',
        categoria: 'En Vivo',
        tags: ['Interactiva', 'Q&A'],
        color: '#ef4444',
        enlaceReunion: 'https://meet.epsilon.com/calc-diff-001',
        requiereInscripcion: false,
        esGratuita: false,
        precio: 0
      },
      {
        id: 2,
        titulo: 'Workshop: Introducción a React Hooks',
        profesor: 'Ing. Ana López',
        curso: 'JavaScript Moderno',
        fecha: '2025-08-28',
        horaInicio: '16:00',
        horaFin: '17:30',
        duracion: 90,
        estado: 'programada',
        participantes: 28,
        maxParticipantes: 40,
        descripcion: 'Taller práctico sobre useState, useEffect y hooks personalizados',
        categoria: 'Programadas',
        tags: ['Taller', 'Interactiva'],
        color: '#8b5cf6',
        enlaceReunion: 'https://meet.epsilon.com/react-hooks-001',
        requiereInscripcion: true,
        esGratuita: true,
        precio: 0
      },
      {
        id: 3,
        titulo: 'Física Cuántica - Principios Fundamentales',
        profesor: 'Dra. María Rodríguez',
        curso: 'Física Avanzada',
        fecha: '2025-08-29',
        horaInicio: '10:00',
        horaFin: '11:30',
        duracion: 90,
        estado: 'programada',
        participantes: 15,
        maxParticipantes: 30,
        descripcion: 'Introducción a los conceptos fundamentales de la mecánica cuántica',
        categoria: 'Programadas',
        tags: ['Premium', 'Q&A'],
        color: '#10b981',
        enlaceReunion: 'https://meet.epsilon.com/quantum-001',
        requiereInscripcion: true,
        esGratuita: false,
        precio: 25000
      },
      {
        id: 4,
        titulo: 'Álgebra Lineal - Resolución de Ejercicios',
        profesor: 'Prof. Carlos Silva',
        curso: 'Álgebra Lineal',
        fecha: '2025-08-27',
        horaInicio: '15:00',
        horaFin: '16:00',
        duracion: 60,
        estado: 'finalizada',
        participantes: 42,
        maxParticipantes: 50,
        descripcion: 'Sesión de resolución de ejercicios de matrices y determinantes',
        categoria: 'Finalizadas',
        tags: ['Grabada', 'Q&A'],
        color: '#6b7280',
        enlaceReunion: null,
        enlaceGrabacion: 'https://videos.epsilon.com/algebra-linear-001',
        requiereInscripcion: false,
        esGratuita: true,
        precio: 0
      },
      {
        id: 5,
        titulo: 'Python para Data Science - Pandas Avanzado',
        profesor: 'Ing. Roberto Morales',
        curso: 'Python Básico',
        fecha: '2025-08-30',
        horaInicio: '19:00',
        horaFin: '20:30',
        duracion: 90,
        estado: 'programada',
        participantes: 67,
        maxParticipantes: 100,
        descripcion: 'Manipulación avanzada de DataFrames y análisis de datos',
        categoria: 'Programadas',
        tags: ['Taller', 'Premium'],
        color: '#f59e0b',
        enlaceReunion: 'https://meet.epsilon.com/python-pandas-001',
        requiereInscripcion: true,
        esGratuita: false,
        precio: 35000
      }
    ];

    // Filtrar clases
    const filteredClases = clasesEnVivo.filter(clase => {
      const matchesSearch = clase.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           clase.profesor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           clase.curso.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'todas' || 
                             clase.categoria.toLowerCase() === selectedCategory.toLowerCase();
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => clase.tags.includes(tag));
      
      return matchesSearch && matchesCategory && matchesTags;
    });

    // Ordenar clases
    const sortedClases = [...filteredClases].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.titulo;
          bValue = b.titulo;
          break;
        case 'date':
          aValue = new Date(`${a.fecha} ${a.horaInicio}`).getTime();
          bValue = new Date(`${b.fecha} ${b.horaInicio}`).getTime();
          break;
        case 'rating':
          aValue = a.participantes;
          bValue = b.participantes;
          break;
        case 'progress':
          aValue = a.participantes / a.maxParticipantes;
          bValue = b.participantes / b.maxParticipantes;
          break;
        default:
          aValue = a.titulo;
          bValue = b.titulo;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    const joinLiveClass = (clase: any) => {
      setCurrentLiveClass(clase);
      setIsJoinedToLiveClass(true);
    };

    const leaveLiveClass = () => {
      setIsJoinedToLiveClass(false);
      setCurrentLiveClass(null);
      setIsMicOn(false);
      setIsCameraOn(false);
    };

    const getEstadoColor = (estado: string) => {
      switch(estado) {
        case 'en-vivo': return '#ef4444';
        case 'programada': return '#3b82f6';
        case 'finalizada': return '#6b7280';
        default: return '#6b7280';
      }
    };

    const getEstadoTexto = (estado: string) => {
      switch(estado) {
        case 'en-vivo': return 'EN VIVO';
        case 'programada': return 'PROGRAMADA';
        case 'finalizada': return 'FINALIZADA';
        default: return estado.toUpperCase();
      }
    };

    const formatearFecha = (fecha: string, horaInicio: string) => {
      const fechaObj = new Date(`${fecha}T${horaInicio}`);
      const ahora = new Date();
      const esHoy = fechaObj.toDateString() === ahora.toDateString();
      
      if (esHoy) {
        return `Hoy ${horaInicio}`;
      } else {
        return `${fechaObj.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} ${horaInicio}`;
      }
    };

    return (
      <div style={{ padding: '2rem' }}>
        <ToolbarComponent 
          title="Clases en Vivo"
          showNewButton={false}
        />

        {/* Estadísticas de clases en vivo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{
            background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center' as const
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '0.5rem' }}>
              {sortedClases.filter(c => c.estado === 'en-vivo').length}
            </div>
            <div style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>En Vivo Ahora</div>
          </div>
          <div style={{
            background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center' as const
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem' }}>
              {sortedClases.filter(c => c.estado === 'programada').length}
            </div>
            <div style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>Próximas Clases</div>
          </div>
          <div style={{
            background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center' as const
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
              {sortedClases.filter(c => c.estado === 'finalizada').length}
            </div>
            <div style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>Grabaciones</div>
          </div>
        </div>

        {/* Vista de clases en vivo */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: viewMode === 'grid' 
            ? 'repeat(auto-fit, minmax(400px, 1fr))' 
            : '1fr',
          gap: '1.5rem' 
        }}>
          {sortedClases.map((clase) => (
            <div key={clase.id} style={{
              background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              borderLeft: `4px solid ${getEstadoColor(clase.estado)}`,
              borderRadius: '12px',
              padding: viewMode === 'list' ? '1.5rem' : '2rem',
              display: viewMode === 'list' ? 'flex' : 'block',
              alignItems: viewMode === 'list' ? 'center' : 'initial',
              gap: viewMode === 'list' ? '1.5rem' : '0',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative' as const
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 8px 25px ${getEstadoColor(clase.estado)}20`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              
              {/* Badge de estado */}
              {clase.estado === 'en-vivo' && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: '#ef4444',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  animation: 'pulse 2s infinite',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: 'white',
                    borderRadius: '50%'
                  }} />
                  EN VIVO
                </div>
              )}
              
              {viewMode === 'grid' ? (
                <>
                  {/* Vista en cuadrícula */}
                  <div style={{ marginBottom: '1rem', paddingRight: clase.estado === 'en-vivo' ? '6rem' : '0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '1.25rem', 
                        fontWeight: 'bold', 
                        color: safeTheme.colors.current.text.primary,
                        lineHeight: '1.3'
                      }}>
                        {clase.titulo}
                      </h3>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {clase.tags.map(tag => (
                        <span key={tag} style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          background: `${getEstadoColor(clase.estado)}20`,
                          color: getEstadoColor(clase.estado),
                          borderRadius: '12px',
                          fontWeight: '500'
                        }}>
                          {tag}
                        </span>
                      ))}
                      {!clase.esGratuita && (
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          background: '#f59e0b20',
                          color: '#f59e0b',
                          borderRadius: '12px',
                          fontWeight: '500'
                        }}>
                          ${clase.precio?.toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    <p style={{ 
                      color: safeTheme.colors.current.text.secondary, 
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      marginBottom: '0.5rem'
                    }}>
                      {clase.descripcion}
                    </p>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={16} style={{ color: safeTheme.colors.current.text.secondary }} />
                      <span style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>
                        {clase.profesor}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BookOpen size={16} style={{ color: safeTheme.colors.current.text.secondary }} />
                      <span style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>
                        {clase.curso}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} style={{ color: safeTheme.colors.current.text.secondary }} />
                      <span style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>
                        {formatearFecha(clase.fecha, clase.horaInicio)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} style={{ color: safeTheme.colors.current.text.secondary }} />
                      <span style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>
                        {clase.duracion} min
                      </span>
                    </div>
                  </div>
                  
                  {/* Información de participantes */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.secondary }}>
                        Participantes
                      </span>
                      <span style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.primary, fontWeight: '600' }}>
                        {clase.participantes}/{clase.maxParticipantes}
                      </span>
                    </div>
                    <div style={{ 
                      background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', 
                      borderRadius: '10px', 
                      height: '6px', 
                      overflow: 'hidden' 
                    }}>
                      <div style={{
                        background: `linear-gradient(90deg, ${getEstadoColor(clase.estado)}, ${getEstadoColor(clase.estado)}cc)`,
                        height: '100%',
                        width: `${(clase.participantes / clase.maxParticipantes) * 100}%`,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                  
                  {/* Botones de acción */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {clase.estado === 'en-vivo' ? (
                      <button 
                        onClick={() => joinLiveClass(clase)}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          color: 'white',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Video size={16} />
                        Unirse Ahora
                      </button>
                    ) : clase.estado === 'programada' ? (
                      <>
                        <button style={{
                          flex: 1,
                          background: `linear-gradient(135deg, ${getEstadoColor(clase.estado)}, ${getEstadoColor(clase.estado)}dd)`,
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          color: 'white',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}>
                          <Bell size={16} />
                          {clase.requiereInscripcion ? 'Inscribirse' : 'Recordar'}
                        </button>
                        <button style={{
                          background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                          borderRadius: '8px',
                          padding: '0.75rem',
                          color: safeTheme.colors.current.text.primary,
                          cursor: 'pointer'
                        }}>
                          <Share size={16} />
                        </button>
                      </>
                    ) : (
                      <button style={{
                        flex: 1,
                        background: `linear-gradient(135deg, ${getEstadoColor(clase.estado)}, ${getEstadoColor(clase.estado)}dd)`,
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}>
                        <Play size={16} />
                        Ver Grabación
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Vista en lista */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '1.1rem', 
                        fontWeight: 'bold', 
                        color: safeTheme.colors.current.text.primary
                      }}>
                        {clase.titulo}
                      </h3>
                      <div style={{
                        background: getEstadoColor(clase.estado),
                        color: 'white',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '10px',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>
                        {getEstadoTexto(clase.estado)}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {clase.tags.slice(0, 2).map(tag => (
                          <span key={tag} style={{
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.7rem',
                            background: `${getEstadoColor(clase.estado)}20`,
                            color: getEstadoColor(clase.estado),
                            borderRadius: '10px',
                            fontWeight: '500'
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p style={{ 
                      color: safeTheme.colors.current.text.secondary, 
                      fontSize: '0.875rem',
                      margin: 0
                    }}>
                      {clase.profesor} • {clase.curso} • {formatearFecha(clase.fecha, clase.horaInicio)}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={14} style={{ color: safeTheme.colors.current.text.secondary }} />
                      <span style={{ color: safeTheme.colors.current.text.secondary }}>
                        {clase.participantes}/{clase.maxParticipantes}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} style={{ color: safeTheme.colors.current.text.secondary }} />
                      <span style={{ color: safeTheme.colors.current.text.secondary }}>
                        {clase.duracion}min
                      </span>
                    </div>
                  </div>
                  
                  {clase.estado === 'en-vivo' ? (
                    <button 
                      onClick={() => joinLiveClass(clase)}
                      style={{
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.75rem 1.5rem',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        whiteSpace: 'nowrap' as const
                      }}
                    >
                      <Video size={16} />
                      Unirse
                    </button>
                  ) : clase.estado === 'programada' ? (
                    <button style={{
                      background: `linear-gradient(135deg, ${getEstadoColor(clase.estado)}, ${getEstadoColor(clase.estado)}dd)`,
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem 1.5rem',
                      color: 'white',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      whiteSpace: 'nowrap' as const
                    }}>
                      <Bell size={16} />
                      {clase.requiereInscripcion ? 'Inscribirse' : 'Recordar'}
                    </button>
                  ) : (
                    <button style={{
                      background: `linear-gradient(135deg, ${getEstadoColor(clase.estado)}, ${getEstadoColor(clase.estado)}dd)`,
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem 1.5rem',
                      color: 'white',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      whiteSpace: 'nowrap' as const
                    }}>
                      <Play size={16} />
                      Ver Grabación
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {sortedClases.length === 0 && (
          <div style={{
            textAlign: 'center' as const,
            padding: '3rem',
            color: safeTheme.colors.current.text.secondary
          }}>
            <Video size={48} style={{ marginBottom: '1rem' }} />
            <p>No se encontraron clases que coincidan con los filtros seleccionados.</p>
          </div>
        )}

        {/* Modal de clase en vivo */}
        {isJoinedToLiveClass && currentLiveClass && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header de la clase en vivo */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '1rem 2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem' }}>
                  {currentLiveClass.titulo}
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                  Prof. {currentLiveClass.profesor} • {currentLiveClass.participantes} participantes
                </p>
              </div>
              <button
                onClick={leaveLiveClass}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <PhoneOff size={16} />
                Salir
              </button>
            </div>

            {/* Área de video principal */}
            <div style={{
              flex: 1,
              background: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(45deg, #1e40af, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem'
              }}>
                <div style={{ textAlign: 'center' as const }}>
                  <Video size={64} style={{ marginBottom: '1rem' }} />
                  <p>Conectado a la clase en vivo</p>
                  <p style={{ fontSize: '1rem', opacity: 0.7 }}>
                    Simulación de video - {currentLiveClass.titulo}
                  </p>
                </div>
              </div>

              {/* Chat lateral (solo visible en desktop) */}
              {!isMobile && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '300px',
                  height: '100%',
                  background: 'rgba(0, 0, 0, 0.8)',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontWeight: '600'
                  }}>
                    Chat de la clase
                  </div>
                  <div style={{
                    flex: 1,
                    padding: '1rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem'
                  }}>
                    <p>¡Bienvenido a la clase en vivo!</p>
                    <p>Puedes hacer preguntas en cualquier momento.</p>
                  </div>
                  <div style={{
                    padding: '1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <input
                      placeholder="Escribe un mensaje..."
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        outline: 'none'
                      }}
                    />
                    <button style={{
                      background: '#3b82f6',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.5rem',
                      color: 'white',
                      cursor: 'pointer'
                    }}>
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Controles de la clase */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '1rem 2rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                style={{
                  background: isMicOn ? '#10b981' : '#ef4444',
                  border: 'none',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              
              <button
                onClick={() => setIsCameraOn(!isCameraOn)}
                style={{
                  background: isCameraOn ? '#10b981' : '#ef4444',
                  border: 'none',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>

              <button style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Share size={20} />
              </button>

              <button style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Settings size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode ? 
        'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' : 
        'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      transition: 'all 0.3s ease',
      display: 'flex'
    }}>
      {/* Overlay para móvil cuando sidebar está abierto */}
      {sidebarOpen && isMobile && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: '280px',
        background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRight: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        position: isMobile ? 'fixed' : 'fixed',
        top: 0,
        left: isMobile ? (sidebarOpen ? 0 : '-280px') : 0,
        height: '100vh',
        zIndex: 50,
        transition: 'left 0.3s ease',
        overflowY: 'auto'
      }}>
        {/* Header del sidebar */}
        <div style={{
          padding: '1.5rem',
          borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <img 
              src={isDarkMode ? "/assets/images/LogotipoBlanco.png" : "/assets/images/LogotipoGrisOscuro.png"}
              alt="Epsilon Academy" 
              style={{ height: '35px' }}
            />
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: safeTheme.colors.current.text.primary,
                cursor: 'pointer',
                padding: '0.25rem',
                display: isMobile ? 'block' : 'none'
              }}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Usuario y notificaciones */}
          <div style={{ marginBottom: '1rem' }}>
            {/* Usuario */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'white'
              }}>
                {(user?.email || 'EA').split(/[@\s]/).filter(Boolean).map((w:string)=>w[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: safeTheme.colors.current.text.primary }}>
                  {user?.email?.split('@')[0] || 'Estudiante'}
                </div>
                <div style={{ fontSize: '0.75rem', color: safeTheme.colors.current.text.secondary }}>
                  Alumno
                </div>
              </div>
            </div>
            
            {/* Notificaciones */}
            <button style={{
              width: '100%',
              background: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
              borderRadius: '8px',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bell size={16} style={{ color: safeTheme.colors.current.text.secondary }} />
                <span style={{ fontSize: '0.875rem', color: safeTheme.colors.current.text.primary }}>
                  Notificaciones
                </span>
              </div>
              <div style={{ 
                width: 8, 
                height: 8, 
                background: '#ef4444', 
                borderRadius: '50%' 
              }} />
            </button>
          </div>
        </div>

        {/* Navegación */}
        <nav style={{ padding: '1rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navegarA(item.id)}
                style={{
                  width: '100%',
                  background: isActive ? 
                    `linear-gradient(135deg, ${item.color}20, ${item.color}10)` : 
                    'transparent',
                  border: isActive ? `1px solid ${item.color}40` : 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  margin: '0.25rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left' as const
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={20} style={{ color: isActive ? item.color : safeTheme.colors.current.text.secondary }} />
                <span style={{ 
                  color: isActive ? item.color : safeTheme.colors.current.text.primary,
                  fontWeight: isActive ? '600' : '500'
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1rem',
          borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={toggleTheme}
              style={{
                flex: 1,
                background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: '6px',
                padding: '0.5rem',
                color: safeTheme.colors.current.text.primary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={handleSignOut}
              style={{
                flex: 1,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '6px',
                padding: '0.5rem',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main style={{
        flex: 1,
        marginLeft: !isMobile ? '280px' : '0',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header móvil */}
        <header style={{
          background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          padding: '1rem 2rem',
          display: isMobile ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: safeTheme.colors.current.text.primary,
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <Menu size={24} />
          </button>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: safeTheme.colors.current.text.primary }}>
            Epsilon Academy
          </h1>
          <div style={{ width: '40px' }} /> {/* Spacer */}
        </header>

        {/* Header principal (desktop) */}
        {!isMobile && (
          <div style={{
            position:'sticky',
            top:0,
            zIndex:20,
            background: isDarkMode ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.85)',
            backdropFilter:'blur(10px)',
            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            padding:'1rem 2rem',
            display:'flex',
            alignItems:'center',
            gap:'1.5rem'
          }}>
            {/* Buscador global */}
            <div style={{ position:'relative', flex:1 }}>
              <Search size={18} style={{ position:'absolute', top:'50%', left:'14px', transform:'translateY(-50%)', color: safeTheme.colors.current.text.secondary }} />
              <input
                value={globalSearchTerm}
                onChange={(e)=> setGlobalSearchTerm(e.target.value)}
                placeholder="Buscar cursos, simulacros o noticias..."
                style={{
                  width:'100%',
                  padding:'0.75rem 1rem 0.75rem 2.75rem',
                  border:`1px solid ${isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'}`,
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                  color: safeTheme.colors.current.text.primary,
                  borderRadius:'10px',
                  outline:'none',
                  fontSize:'0.85rem'
                }}
              />
            </div>
          </div>
        )}

        {/* Contenido dinámico */}
        {renderContent()}
      </main>
    </div>
  );
};

export default StudentDashboard;
