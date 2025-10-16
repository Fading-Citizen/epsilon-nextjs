"use client";

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Award, 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  CheckCircle,
  XCircle,
  MinusCircle,
  Building,
  GraduationCap,
  Package,
  UsersIcon
} from 'lucide-react';

interface EvaluationStatisticsProps {
  isDarkMode?: boolean;
}

// Tipos de dimensión para los reportes
type ReportDimension = 'student' | 'group' | 'institution' | 'service' | 'course' | 'global';
type DateRange = 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface StatisticsData {
  totalEvaluaciones: number;
  totalPreguntas: number;
  totalCorrectas: number;
  totalIncorrectas: number;
  totalVacias: number;
  promedioPortcentaje: number;
  tasaAprobacion: number;
  mejorPuntaje: number;
  peorPuntaje: number;
  totalEstudiantes?: number;
}

export default function EvaluationStatistics({ isDarkMode = false }: EvaluationStatisticsProps) {
  const [selectedDimension, setSelectedDimension] = useState<ReportDimension>('global');
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('month');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(true);
  
  // Filtros específicos
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedEvaluationType, setSelectedEvaluationType] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  // Datos de ejemplo (en producción vendrían de Supabase)
  const globalStats: StatisticsData = {
    totalEvaluaciones: 245,
    totalPreguntas: 9800,
    totalCorrectas: 7350,
    totalIncorrectas: 1960,
    totalVacias: 490,
    promedioPortcentaje: 75.5,
    tasaAprobacion: 82.4,
    mejorPuntaje: 98.5,
    peorPuntaje: 42.0,
    totalEstudiantes: 142
  };

  const serviciosStats = [
    { 
      servicio: 'ICFES', 
      evaluaciones: 89,
      estudiantes: 56,
      promedio: 78.2, 
      correctas: 3200, 
      incorrectas: 845, 
      vacias: 155,
      tasaAprobacion: 85.4
    },
    { 
      servicio: 'Saber Pro', 
      evaluaciones: 67,
      estudiantes: 42,
      promedio: 72.8, 
      correctas: 2100, 
      incorrectas: 680, 
      vacias: 120,
      tasaAprobacion: 79.1
    },
    { 
      servicio: 'Admisiones', 
      evaluaciones: 45,
      estudiantes: 28,
      promedio: 76.5, 
      correctas: 1450, 
      incorrectas: 290, 
      vacias: 60,
      tasaAprobacion: 82.2
    },
    { 
      servicio: 'Corporativo', 
      evaluaciones: 28,
      estudiantes: 18,
      promedio: 74.1, 
      correctas: 400, 
      incorrectas: 95, 
      vacias: 105,
      tasaAprobacion: 75.0
    },
    { 
      servicio: 'Cursos Especializados', 
      evaluaciones: 16,
      estudiantes: 12,
      promedio: 71.9, 
      correctas: 200, 
      incorrectas: 50, 
      vacias: 50,
      tasaAprobacion: 68.8
    }
  ];

  const institucionesStats = [
    { institucion: 'Colegio San José', evaluaciones: 45, estudiantes: 28, promedio: 82.3, tasaAprobacion: 89.5 },
    { institucion: 'Instituto Nacional', evaluaciones: 38, estudiantes: 24, promedio: 78.5, tasaAprobacion: 84.2 },
    { institucion: 'Colegio La Salle', evaluaciones: 32, estudiantes: 19, promedio: 75.8, tasaAprobacion: 81.3 },
    { institucion: 'Universidad Central', evaluaciones: 28, estudiantes: 16, promedio: 73.2, tasaAprobacion: 78.6 },
    { institucion: 'Empresa Tech Corp', evaluaciones: 22, estudiantes: 14, promedio: 76.4, tasaAprobacion: 81.8 }
  ];

  const gruposStats = [
    { grupo: 'Grupo A - ICFES 2025', evaluaciones: 56, estudiantes: 18, promedio: 79.5, tasaAprobacion: 85.7 },
    { grupo: 'Grupo B - Saber Pro', evaluaciones: 48, estudiantes: 16, promedio: 74.2, tasaAprobacion: 79.2 },
    { grupo: 'Grupo C - Admisiones', evaluaciones: 38, estudiantes: 14, promedio: 77.8, tasaAprobacion: 84.2 },
    { grupo: 'Grupo D - Matemáticas', evaluaciones: 32, estudiantes: 12, promedio: 72.5, tasaAprobacion: 75.0 }
  ];

  const topEstudiantes = [
    { nombre: 'Ana María Rodríguez', evaluaciones: 12, promedio: 94.2, correctas: 423, incorrectas: 28, vacias: 9 },
    { nombre: 'Carlos Andrés López', evaluaciones: 15, promedio: 91.8, correctas: 520, incorrectas: 48, vacias: 12 },
    { nombre: 'María José García', evaluaciones: 10, promedio: 89.5, correctas: 358, incorrectas: 42, vacias: 0 },
    { nombre: 'Juan David Martínez', evaluaciones: 14, promedio: 88.3, correctas: 475, incorrectas: 65, vacias: 20 },
    { nombre: 'Laura Fernández', evaluaciones: 11, promedio: 87.1, correctas: 392, incorrectas: 58, vacias: 10 }
  ];

  const materiaStats = [
    { materia: 'Matemáticas', correctas: 2100, incorrectas: 450, vacias: 150, porcentaje: 82.4 },
    { materia: 'Español', correctas: 1850, incorrectas: 520, vacias: 130, porcentaje: 74.0 },
    { materia: 'Ciencias Naturales', correctas: 1620, incorrectas: 380, vacias: 100, porcentaje: 77.1 },
    { materia: 'Ciencias Sociales', correctas: 1480, incorrectas: 410, vacias: 80, porcentaje: 75.3 },
    { materia: 'Inglés', correctas: 300, incorrectas: 200, vacias: 30, porcentaje: 56.6 }
  ];

  // Listas para los selectores de filtros
  const grupos = ['all', 'Grupo A - ICFES 2025', 'Grupo B - Saber Pro', 'Grupo C - Admisiones', 'Grupo D - Matemáticas'];
  const servicios = ['all', 'ICFES', 'Saber Pro', 'Admisiones', 'Corporativo', 'Cursos Especializados'];
  const instituciones = ['all', 'Colegio San José', 'Instituto Nacional', 'Colegio La Salle', 'Universidad Central', 'Empresa Tech Corp'];
  const estudiantes = ['all', 'Ana María Rodríguez', 'Carlos Andrés López', 'María José García', 'Juan David Martínez', 'Laura Fernández'];
  const tiposEvaluacion = ['all', 'quiz', 'exam', 'practice', 'final'];
  const cursos = ['all', 'Cálculo Diferencial', 'Álgebra Lineal', 'Física Cuántica', 'Estadística Avanzada', 'Programación'];

  const resetFilters = () => {
    setSelectedGroup('all');
    setSelectedService('all');
    setSelectedInstitution('all');
    setSelectedStudent('all');
    setSelectedEvaluationType('all');
    setSelectedCourse('all');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedGroup !== 'all') count++;
    if (selectedService !== 'all') count++;
    if (selectedInstitution !== 'all') count++;
    if (selectedStudent !== 'all') count++;
    if (selectedEvaluationType !== 'all') count++;
    if (selectedCourse !== 'all') count++;
    return count;
  };

  const generatePDFReport = async (dimension: ReportDimension) => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;
    const lineHeight = 7;
    const marginLeft = 20;
    
    // Función para verificar salto de página
    const checkPageBreak = (requiredSpace: number = 10) => {
      if (yPos + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }
    };

    // Encabezado
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Estadísticas', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Epsilon Academy - ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 30, { align: 'center' });
    
    yPos = 50;
    doc.setTextColor(0, 0, 0);

    // Título de la sección
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text(`Estadísticas ${dimension === 'global' ? 'Globales' : 'por ' + dimension}`, marginLeft, yPos);
    yPos += lineHeight + 5;

    // Estadísticas globales
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen General', marginLeft, yPos);
    yPos += lineHeight;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const generalData = [
      `Total de Evaluaciones: ${globalStats.totalEvaluaciones}`,
      `Total de Estudiantes: ${globalStats.totalEstudiantes}`,
      `Total de Preguntas: ${globalStats.totalPreguntas.toLocaleString()}`,
      `Promedio General: ${globalStats.promedioPortcentaje}%`,
      `Tasa de Aprobación: ${globalStats.tasaAprobacion}%`
    ];

    generalData.forEach(line => {
      checkPageBreak();
      doc.text(line, marginLeft + 5, yPos);
      yPos += lineHeight;
    });

    yPos += 5;
    checkPageBreak(15);

    // Distribución de Respuestas
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Distribución de Respuestas', marginLeft, yPos);
    yPos += lineHeight;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const totalRespuestas = globalStats.totalCorrectas + globalStats.totalIncorrectas + globalStats.totalVacias;
    const pctCorrectas = ((globalStats.totalCorrectas / totalRespuestas) * 100).toFixed(1);
    const pctIncorrectas = ((globalStats.totalIncorrectas / totalRespuestas) * 100).toFixed(1);
    const pctVacias = ((globalStats.totalVacias / totalRespuestas) * 100).toFixed(1);

    const respuestasData = [
      { label: `Correctas: ${globalStats.totalCorrectas.toLocaleString()} (${pctCorrectas}%)`, color: [16, 185, 129] },
      { label: `Incorrectas: ${globalStats.totalIncorrectas.toLocaleString()} (${pctIncorrectas}%)`, color: [239, 68, 68] },
      { label: `Vacías: ${globalStats.totalVacias.toLocaleString()} (${pctVacias}%)`, color: [156, 163, 175] }
    ];

    respuestasData.forEach(({ label, color }) => {
      checkPageBreak();
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(marginLeft + 7, yPos - 1.5, 2, 'F');
      doc.text(label, marginLeft + 12, yPos);
      yPos += lineHeight;
    });

    yPos += 5;
    checkPageBreak(20);

    // Estadísticas por Servicio
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Rendimiento por Servicio', marginLeft, yPos);
    yPos += lineHeight + 3;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    serviciosStats.forEach((servicio, idx) => {
      checkPageBreak(15);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}. ${servicio.servicio}`, marginLeft + 5, yPos);
      yPos += lineHeight - 1;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`   Evaluaciones: ${servicio.evaluaciones} | Estudiantes: ${servicio.estudiantes} | Promedio: ${servicio.promedio}%`, marginLeft + 5, yPos);
      yPos += lineHeight - 1;
      
      doc.text(`   Correctas: ${servicio.correctas} | Incorrectas: ${servicio.incorrectas} | Vacías: ${servicio.vacias}`, marginLeft + 5, yPos);
      yPos += lineHeight - 1;
      
      doc.text(`   Tasa de Aprobación: ${servicio.tasaAprobacion}%`, marginLeft + 5, yPos);
      yPos += lineHeight + 2;
    });

    yPos += 3;
    checkPageBreak(20);

    // Top Instituciones
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Top 5 Instituciones', marginLeft, yPos);
    yPos += lineHeight + 3;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    institucionesStats.forEach((inst, idx) => {
      checkPageBreak(10);
      doc.text(`${idx + 1}. ${inst.institucion}`, marginLeft + 5, yPos);
      yPos += lineHeight - 1;
      doc.text(`   Promedio: ${inst.promedio}% | Tasa Aprobación: ${inst.tasaAprobacion}% | Evaluaciones: ${inst.evaluaciones}`, marginLeft + 5, yPos);
      yPos += lineHeight + 1;
    });

    yPos += 3;
    checkPageBreak(20);

    // Top Estudiantes
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Top 5 Estudiantes', marginLeft, yPos);
    yPos += lineHeight + 3;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    topEstudiantes.forEach((est, idx) => {
      checkPageBreak(10);
      doc.text(`${idx + 1}. ${est.nombre}`, marginLeft + 5, yPos);
      yPos += lineHeight - 1;
      doc.text(`   Promedio: ${est.promedio}% | Evaluaciones: ${est.evaluaciones} | Correctas: ${est.correctas}`, marginLeft + 5, yPos);
      yPos += lineHeight + 1;
    });

    yPos += 3;
    checkPageBreak(20);

    // Rendimiento por Materia
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Rendimiento por Materia', marginLeft, yPos);
    yPos += lineHeight + 3;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    materiaStats.forEach((materia, idx) => {
      checkPageBreak(10);
      doc.text(`${idx + 1}. ${materia.materia} - ${materia.porcentaje}%`, marginLeft + 5, yPos);
      yPos += lineHeight - 1;
      doc.text(`   Correctas: ${materia.correctas} | Incorrectas: ${materia.incorrectas} | Vacías: ${materia.vacias}`, marginLeft + 5, yPos);
      yPos += lineHeight + 1;
    });

    // Pie de página
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Epsilon Academy - Reporte Generado el ${new Date().toLocaleDateString('es-ES')} - Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    doc.save(`reporte-estadisticas-${dimension}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getColorByPercentage = (percentage: number) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{
      padding: '2rem',
      background: isDarkMode ? '#111827' : '#f9fafb',
      minHeight: '100vh',
      color: isDarkMode ? '#f3f4f6' : '#111827'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          margin: 0,
          fontSize: '2rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Estadísticas y Reportes
        </h1>
        <p style={{
          marginTop: '0.5rem',
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          fontSize: '0.95rem'
        }}>
          Análisis completo de evaluaciones y rendimiento académico
        </p>
      </div>

      {/* Filtros y Exportación */}
      <div style={{
        background: isDarkMode ? '#1f2937' : '#ffffff',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
      }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
            <select
              value={selectedDimension}
              onChange={(e) => setSelectedDimension(e.target.value as ReportDimension)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                background: isDarkMode ? '#111827' : '#ffffff',
                color: isDarkMode ? '#f3f4f6' : '#111827',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <option value="global">Vista Global</option>
              <option value="student">Por Estudiante</option>
              <option value="group">Por Grupo</option>
              <option value="institution">Por Institución</option>
              <option value="service">Por Servicio</option>
              <option value="course">Por Curso</option>
            </select>

            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value as DateRange)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                background: isDarkMode ? '#111827' : '#ffffff',
                color: isDarkMode ? '#f3f4f6' : '#111827',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mes</option>
              <option value="quarter">Último Trimestre</option>
              <option value="year">Último Año</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          <button
            onClick={() => generatePDFReport(selectedDimension)}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
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
            }}
          >
            <Download size={16} />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Filtros Específicos */}
      <div style={{
        background: isDarkMode ? '#1f2937' : '#ffffff',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Filter size={20} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
              Filtros Avanzados
              {getActiveFiltersCount() > 0 && (
                <span style={{
                  marginLeft: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  background: '#3b82f6',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {getActiveFiltersCount()}
                </span>
              )}
            </h3>
          </div>
          
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={resetFilters}
              style={{
                background: 'transparent',
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                cursor: 'pointer'
              }}
            >
              Limpiar Filtros
            </button>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {/* Filtro por Grupo */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: isDarkMode ? '#9ca3af' : '#6b7280'
            }}>
              Grupo
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                background: isDarkMode ? '#111827' : '#ffffff',
                color: isDarkMode ? '#f3f4f6' : '#111827',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">Todos los grupos</option>
              {grupos.filter(g => g !== 'all').map(grupo => (
                <option key={grupo} value={grupo}>{grupo}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Servicio */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: isDarkMode ? '#9ca3af' : '#6b7280'
            }}>
              Servicio
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                background: isDarkMode ? '#111827' : '#ffffff',
                color: isDarkMode ? '#f3f4f6' : '#111827',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">Todos los servicios</option>
              {servicios.filter(s => s !== 'all').map(servicio => (
                <option key={servicio} value={servicio}>{servicio}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Institución */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: isDarkMode ? '#9ca3af' : '#6b7280'
            }}>
              Institución
            </label>
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                background: isDarkMode ? '#111827' : '#ffffff',
                color: isDarkMode ? '#f3f4f6' : '#111827',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">Todas las instituciones</option>
              {instituciones.filter(i => i !== 'all').map(inst => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Estudiante */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: isDarkMode ? '#9ca3af' : '#6b7280'
            }}>
              Estudiante
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                background: isDarkMode ? '#111827' : '#ffffff',
                color: isDarkMode ? '#f3f4f6' : '#111827',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">Todos los estudiantes</option>
              {estudiantes.filter(e => e !== 'all').map(estudiante => (
                <option key={estudiante} value={estudiante}>{estudiante}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Tipo de Evaluación */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: isDarkMode ? '#9ca3af' : '#6b7280'
            }}>
              Tipo de Evaluación
            </label>
            <select
              value={selectedEvaluationType}
              onChange={(e) => setSelectedEvaluationType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                background: isDarkMode ? '#111827' : '#ffffff',
                color: isDarkMode ? '#f3f4f6' : '#111827',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">Todos los tipos</option>
              <option value="quiz">Quiz</option>
              <option value="exam">Examen</option>
              <option value="practice">Práctica</option>
              <option value="final">Final</option>
            </select>
          </div>

          {/* Filtro por Curso */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: isDarkMode ? '#9ca3af' : '#6b7280'
            }}>
              Curso
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                background: isDarkMode ? '#111827' : '#ffffff',
                color: isDarkMode ? '#f3f4f6' : '#111827',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">Todos los cursos</option>
              {cursos.filter(c => c !== 'all').map(curso => (
                <option key={curso} value={curso}>{curso}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Indicador de filtros activos */}
        {getActiveFiltersCount() > 0 && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            borderRadius: '8px',
            background: isDarkMode ? '#111827' : '#f0f9ff',
            border: `1px solid ${isDarkMode ? '#374151' : '#bfdbfe'}`,
            fontSize: '0.875rem',
            color: isDarkMode ? '#60a5fa' : '#1e40af'
          }}>
            <strong>Filtros activos:</strong>
            {selectedGroup !== 'all' && ` Grupo: ${selectedGroup}`}
            {selectedService !== 'all' && ` • Servicio: ${selectedService}`}
            {selectedInstitution !== 'all' && ` • Institución: ${selectedInstitution}`}
            {selectedStudent !== 'all' && ` • Estudiante: ${selectedStudent}`}
            {selectedEvaluationType !== 'all' && ` • Tipo: ${selectedEvaluationType}`}
            {selectedCourse !== 'all' && ` • Curso: ${selectedCourse}`}
          </div>
        )}
      </div>

      {/* Estadísticas Globales - Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: isDarkMode ? '#1f2937' : '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          borderLeft: '4px solid #3b82f6',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FileText size={24} color="#3b82f6" />
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
                {globalStats.totalEvaluaciones}
              </div>
              <div style={{ fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: '0.25rem' }}>
                Total Evaluaciones
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: isDarkMode ? '#1f2937' : '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          borderLeft: '4px solid #10b981',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle size={24} color="#10b981" />
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                {globalStats.totalCorrectas.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: '0.25rem' }}>
                Respuestas Correctas
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: isDarkMode ? '#1f2937' : '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          borderLeft: '4px solid #ef4444',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <XCircle size={24} color="#ef4444" />
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>
                {globalStats.totalIncorrectas.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: '0.25rem' }}>
                Respuestas Incorrectas
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: isDarkMode ? '#1f2937' : '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          borderLeft: '4px solid #9ca3af',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <MinusCircle size={24} color="#9ca3af" />
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#9ca3af' }}>
                {globalStats.totalVacias.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: '0.25rem' }}>
                Respuestas Vacías
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: isDarkMode ? '#1f2937' : '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          borderLeft: '4px solid #8b5cf6',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BarChart3 size={24} color="#8b5cf6" />
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6' }}>
                {globalStats.promedioPortcentaje}%
              </div>
              <div style={{ fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: '0.25rem' }}>
                Promedio General
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: isDarkMode ? '#1f2937' : '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          borderLeft: '4px solid #f59e0b',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Award size={24} color="#f59e0b" />
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
                {globalStats.tasaAprobacion}%
              </div>
              <div style={{ fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginTop: '0.25rem' }}>
                Tasa de Aprobación
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido por pestañas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Estadísticas por Servicio */}
        <div style={{
          background: isDarkMode ? '#1f2937' : '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Package size={20} color="#3b82f6" />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
              Rendimiento por Servicio
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {serviciosStats.map((servicio, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: isDarkMode ? '#111827' : '#f9fafb',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{servicio.servicio}</span>
                  <span style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: getColorByPercentage(servicio.promedio)
                  }}>
                    {servicio.promedio}%
                  </span>
                </div>
                
                <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#6b7280', marginBottom: '0.5rem' }}>
                  {servicio.evaluaciones} evaluaciones • {servicio.estudiantes} estudiantes
                </div>

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  fontSize: '0.75rem',
                  marginTop: '0.5rem'
                }}>
                  <span style={{ color: '#10b981' }}>✓ {servicio.correctas}</span>
                  <span style={{ color: '#ef4444' }}>✗ {servicio.incorrectas}</span>
                  <span style={{ color: '#9ca3af' }}>○ {servicio.vacias}</span>
                </div>

                <div style={{
                  marginTop: '0.75rem',
                  height: '6px',
                  background: isDarkMode ? '#374151' : '#e5e7eb',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${servicio.promedio}%`,
                    background: getColorByPercentage(servicio.promedio),
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Instituciones */}
        <div style={{
          background: isDarkMode ? '#1f2937' : '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Building size={20} color="#10b981" />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
              Top Instituciones
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {institucionesStats.map((inst, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: isDarkMode ? '#111827' : '#f9fafb',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : isDarkMode ? '#374151' : '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  color: idx < 3 ? '#000' : isDarkMode ? '#f3f4f6' : '#111827',
                  flexShrink: 0
                }}>
                  {idx + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                    {inst.institucion}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                    {inst.evaluaciones} evaluaciones • {inst.estudiantes} estudiantes
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: getColorByPercentage(inst.promedio)
                  }}>
                    {inst.promedio}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                    {inst.tasaAprobacion}% aprobación
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grupos y Top Estudiantes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Rendimiento por Grupo */}
        <div style={{
          background: isDarkMode ? '#1f2937' : '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <UsersIcon size={20} color="#8b5cf6" />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
              Rendimiento por Grupo
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {gruposStats.map((grupo, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: isDarkMode ? '#111827' : '#f9fafb',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{grupo.grupo}</span>
                  <span style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: getColorByPercentage(grupo.promedio)
                  }}>
                    {grupo.promedio}%
                  </span>
                </div>
                
                <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                  {grupo.evaluaciones} evaluaciones • {grupo.estudiantes} estudiantes • {grupo.tasaAprobacion}% aprobación
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Estudiantes */}
        <div style={{
          background: isDarkMode ? '#1f2937' : '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Award size={20} color="#f59e0b" />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
              Top Estudiantes
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topEstudiantes.map((est, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: isDarkMode ? '#111827' : '#f9fafb',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : isDarkMode ? '#374151' : '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  color: idx < 3 ? '#000' : isDarkMode ? '#f3f4f6' : '#111827',
                  flexShrink: 0
                }}>
                  {idx + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                    {est.nombre}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                    {est.evaluaciones} evaluaciones
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: getColorByPercentage(est.promedio)
                  }}>
                    {est.promedio}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                    ✓{est.correctas} ✗{est.incorrectas}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rendimiento por Materia */}
      <div style={{
        background: isDarkMode ? '#1f2937' : '#ffffff',
        borderRadius: '12px',
        padding: '1.5rem',
        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <GraduationCap size={20} color="#3b82f6" />
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
            Rendimiento por Materia
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {materiaStats.map((materia, idx) => (
            <div
              key={idx}
              style={{
                padding: '1rem',
                borderRadius: '8px',
                background: isDarkMode ? '#111827' : '#f9fafb',
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{materia.materia}</span>
                <span style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: getColorByPercentage(materia.porcentaje)
                }}>
                  {materia.porcentaje}%
                </span>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                fontSize: '0.875rem',
                marginBottom: '0.75rem'
              }}>
                <span style={{ color: '#10b981' }}>✓ {materia.correctas}</span>
                <span style={{ color: '#ef4444' }}>✗ {materia.incorrectas}</span>
                <span style={{ color: '#9ca3af' }}>○ {materia.vacias}</span>
              </div>

              <div style={{
                height: '8px',
                background: isDarkMode ? '#374151' : '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${materia.porcentaje}%`,
                  background: getColorByPercentage(materia.porcentaje),
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
