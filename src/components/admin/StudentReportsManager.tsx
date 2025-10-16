"use client";

import React, { useState } from 'react';
import { FileText, Search, Filter, TrendingUp, TrendingDown, Calendar, User, Award } from 'lucide-react';
import SimulacroReport from '../student/SimulacroReport';

interface InformeResumen {
  id: string;
  simulacroId: string;
  simulacroNombre: string;
  estudianteId: string;
  estudianteNombre: string;
  servicio: string;
  fecha: string;
  porcentaje: number;
  puntajeObtenido: number;
  puntajeTotal: number;
  duracion: number;
}

// Este sería el informe completo cargado cuando se selecciona
interface InformeCompleto {
  id: string;
  simulacroId: string;
  simulacroNombre: string;
  estudianteId: string;
  estudianteNombre: string;
  servicio: string;
  fecha: string;
  duracion: number;
  puntajeTotal: number;
  puntajeObtenido: number;
  porcentaje: number;
  preguntasCorrectas: number;
  preguntasIncorrectas: number;
  preguntasNoRespondidas: number;
  totalPreguntas: number;
  preguntas: any[];
  analisisPorMateria: any[];
  analisisPorDificultad: any[];
  tiempoPromedioPorPregunta: number;
  recomendaciones: string[];
}

interface Props {
  isDarkMode?: boolean;
}

export default function StudentReportsManager({ isDarkMode = false }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServicio, setSelectedServicio] = useState<string>('todos');
  const [selectedStudent, setSelectedStudent] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'fecha' | 'porcentaje' | 'nombre'>('fecha');
  const [selectedReport, setSelectedReport] = useState<InformeCompleto | null>(null);

  // Datos de ejemplo (en producción vendrían de Supabase)
  const informes: InformeResumen[] = [
    {
      id: '1',
      simulacroId: 'sim1',
      simulacroNombre: 'Simulacro ICFES - Matemáticas',
      estudianteId: 'est1',
      estudianteNombre: 'Juan Pérez',
      servicio: 'ICFES',
      fecha: '2025-10-15T10:30:00',
      porcentaje: 85.5,
      puntajeObtenido: 42,
      puntajeTotal: 50,
      duracion: 90
    },
    {
      id: '2',
      simulacroId: 'sim2',
      simulacroNombre: 'Simulacro Saber Pro - Lectura Crítica',
      estudianteId: 'est2',
      estudianteNombre: 'María García',
      servicio: 'Saber Pro',
      fecha: '2025-10-14T14:00:00',
      porcentaje: 92.0,
      puntajeObtenido: 46,
      puntajeTotal: 50,
      duracion: 75
    },
    {
      id: '3',
      simulacroId: 'sim1',
      simulacroNombre: 'Simulacro ICFES - Matemáticas',
      estudianteId: 'est3',
      estudianteNombre: 'Carlos López',
      servicio: 'ICFES',
      fecha: '2025-10-13T09:15:00',
      porcentaje: 68.0,
      puntajeObtenido: 34,
      puntajeTotal: 50,
      duracion: 95
    }
  ];

  const servicios = ['todos', ...Array.from(new Set(informes.map(i => i.servicio)))];
  const estudiantes = ['todos', ...Array.from(new Set(informes.map(i => i.estudianteNombre)))];

  const informesFiltrados = informes
    .filter(informe => {
      const matchesSearch = 
        informe.estudianteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        informe.simulacroNombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesServicio = selectedServicio === 'todos' || informe.servicio === selectedServicio;
      const matchesStudent = selectedStudent === 'todos' || informe.estudianteNombre === selectedStudent;
      
      return matchesSearch && matchesServicio && matchesStudent;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'fecha':
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        case 'porcentaje':
          return b.porcentaje - a.porcentaje;
        case 'nombre':
          return a.estudianteNombre.localeCompare(b.estudianteNombre);
        default:
          return 0;
      }
    });

  // Estadísticas
  const stats = {
    totalInformes: informes.length,
    promedioGeneral: informes.reduce((sum, i) => sum + i.porcentaje, 0) / informes.length,
    mejorPuntaje: Math.max(...informes.map(i => i.porcentaje)),
    estudiantesActivos: new Set(informes.map(i => i.estudianteId)).size
  };

  const getColorByPercentage = (percentage: number) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const handleViewReport = (informeId: string) => {
    // Aquí cargarías el informe completo desde Supabase
    // Por ahora, creamos un informe de ejemplo
    const informeResumen = informes.find(i => i.id === informeId);
    if (!informeResumen) return;

    const informeCompleto: InformeCompleto = {
      ...informeResumen,
      preguntasCorrectas: Math.round(informeResumen.puntajeObtenido * 0.8),
      preguntasIncorrectas: Math.round((informeResumen.puntajeTotal - informeResumen.puntajeObtenido) * 0.8),
      preguntasNoRespondidas: 2,
      totalPreguntas: 40,
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

    setSelectedReport(informeCompleto);
  };

  if (selectedReport) {
    return (
      <div>
        <button
          onClick={() => setSelectedReport(null)}
          style={{
            background: isDarkMode ? '#374151' : '#f3f4f6',
            color: isDarkMode ? '#f3f4f6' : '#374151',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          ← Volver a la lista
        </button>
        <SimulacroReport 
          informe={selectedReport} 
          isDarkMode={isDarkMode}
          showStudentInfo={true}
        />
      </div>
    );
  }

  return (
    <div style={{
      ...styles.container,
      background: isDarkMode ? '#111827' : '#f9fafb',
      color: isDarkMode ? '#f3f4f6' : '#111827'
    }}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={{
            ...styles.title,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Informes de Simulacros
          </h1>
          <p style={{
            ...styles.subtitle,
            color: isDarkMode ? '#9ca3af' : '#6b7280'
          }}>
            Revisa el rendimiento de tus estudiantes
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div style={styles.statsGrid}>
        <div style={{
          ...styles.statCard,
          background: isDarkMode ? '#1f2937' : '#ffffff',
          borderLeft: '4px solid #3b82f6'
        }}>
          <FileText size={24} color="#3b82f6" />
          <div>
            <div style={styles.statValue}>{stats.totalInformes}</div>
            <div style={{
              ...styles.statLabel,
              color: isDarkMode ? '#9ca3af' : '#6b7280'
            }}>
              Total Informes
            </div>
          </div>
        </div>

        <div style={{
          ...styles.statCard,
          background: isDarkMode ? '#1f2937' : '#ffffff',
          borderLeft: '4px solid #10b981'
        }}>
          <Award size={24} color="#10b981" />
          <div>
            <div style={styles.statValue}>{stats.promedioGeneral.toFixed(1)}%</div>
            <div style={{
              ...styles.statLabel,
              color: isDarkMode ? '#9ca3af' : '#6b7280'
            }}>
              Promedio General
            </div>
          </div>
        </div>

        <div style={{
          ...styles.statCard,
          background: isDarkMode ? '#1f2937' : '#ffffff',
          borderLeft: '4px solid #f59e0b'
        }}>
          <TrendingUp size={24} color="#f59e0b" />
          <div>
            <div style={styles.statValue}>{stats.mejorPuntaje.toFixed(1)}%</div>
            <div style={{
              ...styles.statLabel,
              color: isDarkMode ? '#9ca3af' : '#6b7280'
            }}>
              Mejor Puntaje
            </div>
          </div>
        </div>

        <div style={{
          ...styles.statCard,
          background: isDarkMode ? '#1f2937' : '#ffffff',
          borderLeft: '4px solid #8b5cf6'
        }}>
          <User size={24} color="#8b5cf6" />
          <div>
            <div style={styles.statValue}>{stats.estudiantesActivos}</div>
            <div style={{
              ...styles.statLabel,
              color: isDarkMode ? '#9ca3af' : '#6b7280'
            }}>
              Estudiantes Activos
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={styles.filtersContainer}>
        <div style={{
          ...styles.searchBox,
          background: isDarkMode ? '#1f2937' : '#ffffff',
          border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
        }}>
          <Search size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
          <input
            type="text"
            placeholder="Buscar por estudiante o simulacro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              ...styles.searchInput,
              background: 'transparent',
              color: isDarkMode ? '#f3f4f6' : '#111827'
            }}
          />
        </div>

        <div style={styles.filtersRow}>
          <select
            value={selectedServicio}
            onChange={(e) => setSelectedServicio(e.target.value)}
            style={{
              ...styles.select,
              background: isDarkMode ? '#1f2937' : '#ffffff',
              color: isDarkMode ? '#f3f4f6' : '#111827',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
            }}
          >
            {servicios.map(servicio => (
              <option key={servicio} value={servicio}>
                {servicio === 'todos' ? 'Todos los servicios' : servicio}
              </option>
            ))}
          </select>

          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            style={{
              ...styles.select,
              background: isDarkMode ? '#1f2937' : '#ffffff',
              color: isDarkMode ? '#f3f4f6' : '#111827',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
            }}
          >
            {estudiantes.map(est => (
              <option key={est} value={est}>
                {est === 'todos' ? 'Todos los estudiantes' : est}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              ...styles.select,
              background: isDarkMode ? '#1f2937' : '#ffffff',
              color: isDarkMode ? '#f3f4f6' : '#111827',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
            }}
          >
            <option value="fecha">Más reciente</option>
            <option value="porcentaje">Mayor porcentaje</option>
            <option value="nombre">Nombre</option>
          </select>
        </div>
      </div>

      {/* Lista de informes */}
      <div style={styles.informesList}>
        {informesFiltrados.map(informe => (
          <div
            key={informe.id}
            style={{
              ...styles.informeCard,
              background: isDarkMode ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
            }}
          >
            <div style={styles.informeHeader}>
              <div style={styles.informeHeaderLeft}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '1.25rem',
                  flexShrink: 0
                }}>
                  {informe.estudianteNombre.charAt(0)}
                </div>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: isDarkMode ? '#f3f4f6' : '#111827'
                  }}>
                    {informe.estudianteNombre}
                  </h3>
                  <p style={{
                    margin: '0.25rem 0 0 0',
                    fontSize: '0.875rem',
                    color: isDarkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    {informe.simulacroNombre}
                  </p>
                </div>
              </div>

              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: getColorByPercentage(informe.porcentaje)
              }}>
                {informe.porcentaje.toFixed(1)}%
              </div>
            </div>

            <div style={styles.informeBody}>
              <div style={styles.informeMeta}>
                <span style={{
                  ...styles.badge,
                  background: `${getColorByPercentage(informe.porcentaje)}20`,
                  color: getColorByPercentage(informe.porcentaje)
                }}>
                  {informe.servicio}
                </span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.875rem',
                  color: isDarkMode ? '#9ca3af' : '#6b7280'
                }}>
                  <Calendar size={14} />
                  {new Date(informe.fecha).toLocaleDateString('es-ES')}
                </div>
              </div>

              <div style={styles.informeStats}>
                <div style={styles.miniStat}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#3b82f6' }}>
                    {informe.puntajeObtenido}/{informe.puntajeTotal}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: isDarkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    Puntaje
                  </div>
                </div>
                <div style={styles.miniStat}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f59e0b' }}>
                    {informe.duracion} min
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: isDarkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    Duración
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.informeFooter}>
              <button
                onClick={() => handleViewReport(informe.id)}
                style={{
                  ...styles.viewButton,
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                }}
              >
                <FileText size={16} />
                Ver Informe Completo
              </button>
            </div>
          </div>
        ))}
      </div>

      {informesFiltrados.length === 0 && (
        <div style={styles.emptyState}>
          <FileText size={48} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
          <p style={{
            marginTop: '1rem',
            color: isDarkMode ? '#9ca3af' : '#6b7280'
          }}>
            No se encontraron informes
          </p>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '2rem',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: 0
  },
  subtitle: {
    fontSize: '0.95rem',
    marginTop: '0.5rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  statCard: {
    padding: '1.5rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: '700'
  },
  statLabel: {
    fontSize: '0.875rem',
    marginTop: '0.25rem'
  },
  filtersContainer: {
    marginBottom: '2rem'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '0.875rem'
  },
  filtersRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const
  },
  select: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    outline: 'none'
  },
  informesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '1.5rem'
  },
  informeCard: {
    borderRadius: '12px',
    overflow: 'hidden' as const,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  informeHeader: {
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem'
  },
  informeHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: 1,
    minWidth: 0
  },
  informeBody: {
    padding: '0 1.5rem 1.5rem'
  },
  informeMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap' as const,
    gap: '0.5rem'
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  informeStats: {
    display: 'flex',
    gap: '2rem'
  },
  miniStat: {
    textAlign: 'center' as const
  },
  informeFooter: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e5e7eb'
  },
  viewButton: {
    width: '100%',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '4rem 2rem'
  }
};
