"use client";

import React, { useState } from 'react';
import { Download, TrendingUp, TrendingDown, Award, Clock, CheckCircle, XCircle, AlertCircle, BarChart3, Target, Brain } from 'lucide-react';

interface Pregunta {
  id: string;
  pregunta: string;
  respuestaCorrecta: string;
  respuestaUsuario: string;
  correcta: boolean;
  materia: string;
  dificultad: 'facil' | 'media' | 'dificil';
  tiempoRespuesta: number; // en segundos
}

interface InformeSimulacro {
  id: string;
  simulacroId: string;
  simulacroNombre: string;
  estudianteId: string;
  estudianteNombre: string;
  servicio: string;
  fecha: string;
  duracion: number; // en minutos
  puntajeTotal: number;
  puntajeObtenido: number;
  porcentaje: number;
  preguntasCorrectas: number;
  preguntasIncorrectas: number;
  preguntasNoRespondidas: number;
  totalPreguntas: number;
  preguntas: Pregunta[];
  analisisPorMateria: {
    materia: string;
    correctas: number;
    incorrectas: number;
    porcentaje: number;
  }[];
  analisisPorDificultad: {
    dificultad: string;
    correctas: number;
    incorrectas: number;
    porcentaje: number;
  }[];
  tiempoPromedioPorPregunta: number;
  recomendaciones: string[];
}

interface Props {
  informe: InformeSimulacro;
  isDarkMode?: boolean;
  onClose?: () => void;
  showStudentInfo?: boolean; // Para vista de profesor
}

export default function SimulacroReport({ informe, isDarkMode = false, onClose, showStudentInfo = false }: Props) {
  const [activeTab, setActiveTab] = useState<'resumen' | 'detalles' | 'analisis'>('resumen');

  const handleDownloadPDF = async () => {
    // Importación dinámica de jsPDF
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    let yPos = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;

    // Función para agregar nueva página si es necesario
    const checkPageBreak = (neededSpace: number) => {
      if (yPos + neededSpace > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }
    };

    // Título
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('Informe de Simulacro', 105, yPos, { align: 'center' });
    yPos += 15;

    // Información del simulacro
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Simulacro: ${informe.simulacroNombre}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Servicio: ${informe.servicio}`, 20, yPos);
    yPos += lineHeight;
    
    if (showStudentInfo) {
      doc.text(`Estudiante: ${informe.estudianteNombre}`, 20, yPos);
      yPos += lineHeight;
    }
    
    doc.text(`Fecha: ${new Date(informe.fecha).toLocaleDateString('es-ES')}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Duración: ${informe.duracion} minutos`, 20, yPos);
    yPos += lineHeight * 2;

    // Resultados
    checkPageBreak(40);
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('Resultados', 20, yPos);
    yPos += lineHeight + 3;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Puntaje: ${informe.puntajeObtenido} / ${informe.puntajeTotal}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Porcentaje: ${informe.porcentaje.toFixed(1)}%`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Preguntas correctas: ${informe.preguntasCorrectas} / ${informe.totalPreguntas}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`Preguntas incorrectas: ${informe.preguntasIncorrectas}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`No respondidas: ${informe.preguntasNoRespondidas}`, 20, yPos);
    yPos += lineHeight * 2;

    // Análisis por materia
    checkPageBreak(20 + (informe.analisisPorMateria.length * lineHeight));
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('Análisis por Materia', 20, yPos);
    yPos += lineHeight + 3;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    informe.analisisPorMateria.forEach(materia => {
      checkPageBreak(lineHeight);
      doc.text(`${materia.materia}: ${materia.correctas}/${materia.correctas + materia.incorrectas} (${materia.porcentaje.toFixed(1)}%)`, 20, yPos);
      yPos += lineHeight;
    });
    yPos += lineHeight;

    // Recomendaciones
    checkPageBreak(20 + (informe.recomendaciones.length * lineHeight * 2));
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('Recomendaciones', 20, yPos);
    yPos += lineHeight + 3;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    informe.recomendaciones.forEach((rec, idx) => {
      checkPageBreak(lineHeight * 2);
      const lines = doc.splitTextToSize(`${idx + 1}. ${rec}`, 170);
      lines.forEach((line: string) => {
        checkPageBreak(lineHeight);
        doc.text(line, 20, yPos);
        yPos += lineHeight;
      });
    });

    // Pie de página en todas las páginas
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(`Epsilon Academy - Página ${i} de ${totalPages}`, 105, pageHeight - 10, { align: 'center' });
    }

    doc.save(`informe-simulacro-${informe.simulacroNombre.replace(/\s+/g, '-')}-${new Date(informe.fecha).toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`);
  };

  const getColorByPercentage = (percentage: number) => {
    if (percentage >= 80) return '#10b981'; // Verde
    if (percentage >= 60) return '#f59e0b'; // Naranja
    return '#ef4444'; // Rojo
  };

  const getDificultadColor = (dificultad: string) => {
    switch (dificultad) {
      case 'facil': return '#10b981';
      case 'media': return '#f59e0b';
      case 'dificil': return '#ef4444';
      default: return '#6b7280';
    }
  };

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
            Informe de Simulacro
          </h1>
          <p style={{
            ...styles.subtitle,
            color: isDarkMode ? '#9ca3af' : '#6b7280'
          }}>
            {informe.simulacroNombre} - {new Date(informe.fecha).toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
        <button
          onClick={handleDownloadPDF}
          style={{
            ...styles.downloadButton,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
          }}
        >
          <Download size={18} />
          Descargar PDF
        </button>
      </div>

      {/* Información del estudiante (solo para profesores) */}
      {showStudentInfo && (
        <div style={{
          ...styles.studentInfo,
          background: isDarkMode ? '#1f2937' : '#ffffff',
          border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
              fontSize: '1.25rem'
            }}>
              {informe.estudianteNombre.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{informe.estudianteNombre}</div>
              <div style={{ fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                Servicio: {informe.servicio}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de resultados */}
      <div style={styles.scoreGrid}>
        <div style={{
          ...styles.scoreCard,
          background: isDarkMode ? '#1f2937' : '#ffffff',
          borderLeft: `4px solid ${getColorByPercentage(informe.porcentaje)}`
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: getColorByPercentage(informe.porcentaje) }}>
            {informe.porcentaje.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: '0.5rem' }}>
            Puntaje Total
          </div>
          <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#d1d5db' : '#374151', marginTop: '0.25rem' }}>
            {informe.puntajeObtenido} / {informe.puntajeTotal} puntos
          </div>
        </div>

        <div style={{
          ...styles.scoreCard,
          background: isDarkMode ? '#1f2937' : '#ffffff',
          borderLeft: '4px solid #10b981'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={28} color="#10b981" />
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
              {informe.preguntasCorrectas}
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: '0.5rem' }}>
            Correctas
          </div>
        </div>

        <div style={{
          ...styles.scoreCard,
          background: isDarkMode ? '#1f2937' : '#ffffff',
          borderLeft: '4px solid #ef4444'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={28} color="#ef4444" />
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>
              {informe.preguntasIncorrectas}
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: '0.5rem' }}>
            Incorrectas
          </div>
        </div>

        <div style={{
          ...styles.scoreCard,
          background: isDarkMode ? '#1f2937' : '#ffffff',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={28} color="#f59e0b" />
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
              {informe.duracion}
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: '0.5rem' }}>
            Minutos
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button
          onClick={() => setActiveTab('resumen')}
          style={{
            ...styles.tab,
            borderBottom: activeTab === 'resumen' ? '2px solid #3b82f6' : 'none',
            color: activeTab === 'resumen' ? '#3b82f6' : (isDarkMode ? '#9ca3af' : '#6b7280')
          }}
        >
          <Target size={18} />
          Resumen
        </button>
        <button
          onClick={() => setActiveTab('analisis')}
          style={{
            ...styles.tab,
            borderBottom: activeTab === 'analisis' ? '2px solid #3b82f6' : 'none',
            color: activeTab === 'analisis' ? '#3b82f6' : (isDarkMode ? '#9ca3af' : '#6b7280')
          }}
        >
          <BarChart3 size={18} />
          Análisis
        </button>
        <button
          onClick={() => setActiveTab('detalles')}
          style={{
            ...styles.tab,
            borderBottom: activeTab === 'detalles' ? '2px solid #3b82f6' : 'none',
            color: activeTab === 'detalles' ? '#3b82f6' : (isDarkMode ? '#9ca3af' : '#6b7280')
          }}
        >
          <Brain size={18} />
          Detalles
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === 'resumen' && (
          <div>
            {/* Análisis por materia */}
            <div style={{
              ...styles.section,
              background: isDarkMode ? '#1f2937' : '#ffffff'
            }}>
              <h3 style={styles.sectionTitle}>
                <BarChart3 size={20} color="#3b82f6" />
                Rendimiento por Materia
              </h3>
              <div style={styles.materiasList}>
                {informe.analisisPorMateria.map(materia => (
                  <div key={materia.materia} style={styles.materiaItem}>
                    <div style={styles.materiaHeader}>
                      <span style={{ fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827' }}>
                        {materia.materia}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: getColorByPercentage(materia.porcentaje), fontWeight: '600' }}>
                        {materia.porcentaje.toFixed(1)}%
                      </span>
                    </div>
                    <div style={styles.progressBar}>
                      <div style={{
                        ...styles.progressFill,
                        width: `${materia.porcentaje}%`,
                        background: getColorByPercentage(materia.porcentaje)
                      }} />
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: isDarkMode ? '#9ca3af' : '#6b7280',
                      marginTop: '0.25rem'
                    }}>
                      {materia.correctas} correctas de {materia.correctas + materia.incorrectas}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recomendaciones */}
            <div style={{
              ...styles.section,
              background: isDarkMode ? '#1f2937' : '#ffffff'
            }}>
              <h3 style={styles.sectionTitle}>
                <Award size={20} color="#f59e0b" />
                Recomendaciones
              </h3>
              <div style={styles.recommendationsList}>
                {informe.recomendaciones.map((rec, idx) => (
                  <div key={idx} style={{
                    ...styles.recommendationItem,
                    background: isDarkMode ? '#111827' : '#f9fafb',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                  }}>
                    <AlertCircle size={16} color="#3b82f6" />
                    <span style={{ flex: 1, fontSize: '0.875rem', color: isDarkMode ? '#d1d5db' : '#374151' }}>
                      {rec}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analisis' && (
          <div>
            {/* Análisis por dificultad */}
            <div style={{
              ...styles.section,
              background: isDarkMode ? '#1f2937' : '#ffffff'
            }}>
              <h3 style={styles.sectionTitle}>
                <TrendingUp size={20} color="#10b981" />
                Análisis por Nivel de Dificultad
              </h3>
              <div style={styles.dificultadGrid}>
                {informe.analisisPorDificultad.map(dif => (
                  <div key={dif.dificultad} style={{
                    ...styles.dificultadCard,
                    background: isDarkMode ? '#111827' : '#f9fafb',
                    border: `2px solid ${getDificultadColor(dif.dificultad)}`
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: getDificultadColor(dif.dificultad),
                      textTransform: 'uppercase' as const,
                      marginBottom: '0.5rem'
                    }}>
                      {dif.dificultad}
                    </div>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: getDificultadColor(dif.dificultad),
                      marginBottom: '0.25rem'
                    }}>
                      {dif.porcentaje.toFixed(0)}%
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: isDarkMode ? '#9ca3af' : '#6b7280'
                    }}>
                      {dif.correctas}/{dif.correctas + dif.incorrectas} correctas
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estadísticas adicionales */}
            <div style={{
              ...styles.section,
              background: isDarkMode ? '#1f2937' : '#ffffff'
            }}>
              <h3 style={styles.sectionTitle}>
                <Clock size={20} color="#8b5cf6" />
                Estadísticas de Tiempo
              </h3>
              <div style={styles.statsGrid}>
                <div style={styles.statItem}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8b5cf6' }}>
                    {informe.tiempoPromedioPorPregunta.toFixed(1)}s
                  </div>
                  <div style={{ fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                    Tiempo promedio por pregunta
                  </div>
                </div>
                <div style={styles.statItem}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>
                    {(informe.preguntasCorrectas / informe.totalPreguntas * 100).toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                    Tasa de acierto
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'detalles' && (
          <div style={{
            ...styles.section,
            background: isDarkMode ? '#1f2937' : '#ffffff'
          }}>
            <h3 style={styles.sectionTitle}>
              <Brain size={20} color="#6366f1" />
              Desglose de Preguntas
            </h3>
            <div style={styles.preguntasList}>
              {informe.preguntas.map((pregunta, idx) => (
                <div key={pregunta.id} style={{
                  ...styles.preguntaItem,
                  background: isDarkMode ? '#111827' : '#f9fafb',
                  border: `2px solid ${pregunta.correcta ? '#10b981' : '#ef4444'}`
                }}>
                  <div style={styles.preguntaHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {pregunta.correcta ? (
                        <CheckCircle size={20} color="#10b981" />
                      ) : (
                        <XCircle size={20} color="#ef4444" />
                      )}
                      <span style={{ fontWeight: '600', color: isDarkMode ? '#f3f4f6' : '#111827' }}>
                        Pregunta {idx + 1}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: `${getDificultadColor(pregunta.dificultad)}20`,
                        color: getDificultadColor(pregunta.dificultad)
                      }}>
                        {pregunta.dificultad}
                      </span>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: isDarkMode ? '#374151' : '#e5e7eb',
                        color: isDarkMode ? '#d1d5db' : '#374151'
                      }}>
                        {pregunta.materia}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: isDarkMode ? '#d1d5db' : '#374151',
                    margin: '0.75rem 0'
                  }}>
                    {pregunta.pregunta}
                  </div>
                  <div style={styles.answerGrid}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginBottom: '0.25rem' }}>
                        Tu respuesta:
                      </div>
                      <div style={{
                        padding: '0.5rem',
                        borderRadius: '4px',
                        background: pregunta.correcta ? '#10b98120' : '#ef444420',
                        color: pregunta.correcta ? '#10b981' : '#ef4444',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                      }}>
                        {pregunta.respuestaUsuario || 'No respondida'}
                      </div>
                    </div>
                    {!pregunta.correcta && (
                      <div>
                        <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginBottom: '0.25rem' }}>
                          Respuesta correcta:
                        </div>
                        <div style={{
                          padding: '0.5rem',
                          borderRadius: '4px',
                          background: '#10b98120',
                          color: '#10b981',
                          fontWeight: '600',
                          fontSize: '0.875rem'
                        }}>
                          {pregunta.respuestaCorrecta}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Clock size={12} />
                    Tiempo: {pregunta.tiempoRespuesta}s
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '2rem',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
    gap: '1rem'
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
  downloadButton: {
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s'
  },
  studentInfo: {
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '2rem'
  },
  scoreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  scoreCard: {
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  tabsContainer: {
    display: 'flex',
    gap: '2rem',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '2rem'
  },
  tab: {
    background: 'transparent',
    border: 'none',
    padding: '1rem 0',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s'
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem'
  },
  section: {
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '1.5rem'
  },
  materiasList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem'
  },
  materiaItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  materiaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden' as const
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  recommendationsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem'
  },
  recommendationItem: {
    padding: '1rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem'
  },
  dificultadGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem'
  },
  dificultadCard: {
    padding: '1.5rem',
    borderRadius: '12px',
    textAlign: 'center' as const
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem'
  },
  statItem: {
    textAlign: 'center' as const
  },
  preguntasList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  preguntaItem: {
    padding: '1.5rem',
    borderRadius: '12px'
  },
  preguntaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    flexWrap: 'wrap' as const,
    gap: '0.5rem'
  },
  answerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  }
};
