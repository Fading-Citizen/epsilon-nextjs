'use client'

import React, { useState } from 'react';
import { Video, Plus, Calendar, Users, Clock, Play, Edit, Trash2, Search, Filter } from 'lucide-react';
import styles from './LiveClassesManager.module.css';

interface LiveClass {
  id: string;
  title: string;
  subject: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'live' | 'ended';
  maxParticipants: number;
  currentParticipants: number;
  meetingLink?: string;
  course?: string;
}

interface LiveClassesManagerProps {
  onBack?: () => void;
}

const LiveClassesManager: React.FC<LiveClassesManagerProps> = ({ onBack }) => {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([
    {
      id: '1',
      title: 'Cálculo Diferencial - Límites',
      subject: 'Matemáticas',
      description: 'Clase sobre límites y continuidad en funciones',
      date: '2025-08-28',
      startTime: '14:00',
      endTime: '15:30',
      status: 'live',
      maxParticipants: 30,
      currentParticipants: 18,
      meetingLink: 'https://meet.epsilon.edu/calc-limits',
      course: 'Cálculo Diferencial'
    },
    {
      id: '2',
      title: 'Álgebra Lineal - Vectores',
      subject: 'Matemáticas',
      description: 'Introducción a vectores y espacios vectoriales',
      date: '2025-08-28',
      startTime: '16:00',
      endTime: '17:30',
      status: 'scheduled',
      maxParticipants: 25,
      currentParticipants: 12,
      course: 'Álgebra Lineal'
    },
    {
      id: '3',
      title: 'Física Cuántica - Introducción',
      subject: 'Física',
      description: 'Conceptos básicos de mecánica cuántica',
      date: '2025-08-29',
      startTime: '10:00',
      endTime: '11:30',
      status: 'scheduled',
      maxParticipants: 20,
      currentParticipants: 8,
      course: 'Física Cuántica'
    }
  ]);

  const [showEditor, setShowEditor] = useState(false);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const subjects = ['Matemáticas', 'Física', 'Química', 'Programación', 'Historia', 'Literatura'];

  const filteredClasses = liveClasses.filter(liveClass => {
    const matchesSearch = liveClass.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         liveClass.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || liveClass.status === statusFilter;
    const matchesSubject = subjectFilter === 'all' || liveClass.subject === subjectFilter;
    
    return matchesSearch && matchesStatus && matchesSubject;
  });

  const createNewClass = () => {
    setEditingClass(null);
    setShowEditor(true);
  };

  const editClass = (liveClass: LiveClass) => {
    setEditingClass(liveClass);
    setShowEditor(true);
  };

  const saveClass = (classData: Partial<LiveClass>) => {
    if (editingClass) {
      // Update existing class
      setLiveClasses(prev => 
        prev.map(c => c.id === editingClass.id ? { ...c, ...classData } : c)
      );
    } else {
      // Create new class
      const newClass: LiveClass = {
        id: Date.now().toString(),
        title: '',
        subject: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        status: 'scheduled',
        maxParticipants: 30,
        currentParticipants: 0,
        ...classData
      } as LiveClass;
      setLiveClasses(prev => [...prev, newClass]);
    }
    setShowEditor(false);
    setEditingClass(null);
  };

  const deleteClass = (classId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta clase en vivo?')) {
      setLiveClasses(prev => prev.filter(c => c.id !== classId));
    }
  };

  const startClass = (liveClass: LiveClass) => {
    // Update status to live
    setLiveClasses(prev => 
      prev.map(c => c.id === liveClass.id ? { ...c, status: 'live' as const } : c)
    );
    
    // Open meeting link if available
    if (liveClass.meetingLink) {
      window.open(liveClass.meetingLink, '_blank');
    }
  };

  const joinClass = (liveClass: LiveClass) => {
    if (liveClass.meetingLink) {
      window.open(liveClass.meetingLink, '_blank');
    }
  };

  const getStatusColor = (status: LiveClass['status']) => {
    switch (status) {
      case 'live': return '#ef4444';
      case 'scheduled': return '#3b82f6';
      case 'ended': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: LiveClass['status']) => {
    switch (status) {
      case 'live': return 'EN VIVO';
      case 'scheduled': return 'PROGRAMADA';
      case 'ended': return 'FINALIZADA';
      default: return 'DESCONOCIDO';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const LiveClassEditor = () => {
    const [formData, setFormData] = useState<Partial<LiveClass>>(
      editingClass || {
        title: '',
        subject: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        maxParticipants: 30,
        course: ''
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      saveClass(formData);
    };

    return (
      <div className={styles.liveClassEditor}>
        <div className={styles.editorHeader}>
          <h3>{editingClass ? 'Editar Clase en Vivo' : 'Nueva Clase en Vivo'}</h3>
          <div className={styles.editorActions}>
            <button 
              className={`${styles.actionBtn} ${styles.secondary}`}
              onClick={() => setShowEditor(false)}
            >
              Cancelar
            </button>
            <button 
              className={`${styles.actionBtn} ${styles.primary}`}
              onClick={handleSubmit}
            >
              Guardar
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Título de la clase *</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: Cálculo Diferencial - Límites"
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Materia *</label>
              <select
                value={formData.subject || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                required
              >
                <option value="">Selecciona una materia</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Curso relacionado</label>
              <input
                type="text"
                value={formData.course || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                placeholder="Nombre del curso"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Descripción</label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe el contenido de la clase..."
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Fecha *</label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Máximo de participantes</label>
              <input
                type="number"
                value={formData.maxParticipants || 30}
                onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                min="1"
                max="100"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Hora de inicio *</label>
              <input
                type="time"
                value={formData.startTime || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Hora de fin *</label>
              <input
                type="time"
                value={formData.endTime || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Enlace de la reunión</label>
            <input
              type="url"
              value={formData.meetingLink || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
              placeholder="https://meet.google.com/abc-def-ghi"
            />
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className={styles.liveClassesManager}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Clases en Vivo</h2>
          <p>Gestiona y programa tus clases en tiempo real</p>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={`${styles.actionBtn} ${styles.primary}`}
            onClick={createNewClass}
          >
            <Plus size={16} />
            Nueva Clase
          </button>
        </div>
      </div>

      {showEditor && <LiveClassEditor />}

      <div className={styles.filterBar}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'var(--text-secondary)' 
          }} />
          <input
            type="text"
            placeholder="Buscar clases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">Todos los estados</option>
          <option value="live">En vivo</option>
          <option value="scheduled">Programadas</option>
          <option value="ended">Finalizadas</option>
        </select>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">Todas las materias</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      <div className={styles.liveClassesGrid}>
        {filteredClasses.length === 0 ? (
          <div className={styles.emptyState}>
            <Video size={48} />
            <h3>No hay clases disponibles</h3>
            <p>Comienza creando tu primera clase en vivo</p>
          </div>
        ) : (
          filteredClasses.map(liveClass => (
            <div 
              key={liveClass.id} 
              className={`${styles.liveClassCard} ${liveClass.status === 'live' ? styles.live : ''}`}
            >
              {liveClass.status === 'live' && (
                <div className={styles.liveIndicator}>
                  <div className={styles.liveDot}></div>
                  EN VIVO
                </div>
              )}

              <div className={styles.classHeader}>
                <h3 className={styles.classTitle}>{liveClass.title}</h3>
                <p className={styles.classSubject}>{liveClass.subject}</p>
              </div>

              {liveClass.description && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.5rem 0' }}>
                  {liveClass.description}
                </p>
              )}

              <div className={styles.classDateTime}>
                <Calendar size={14} />
                <span>{formatDate(liveClass.date)}</span>
              </div>

              <div className={styles.classDateTime}>
                <Clock size={14} />
                <span>{formatTime(liveClass.startTime)} - {formatTime(liveClass.endTime)}</span>
              </div>

              <div className={styles.classStats}>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>{liveClass.currentParticipants}</div>
                  <div className={styles.statLabel}>Conectados</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>{liveClass.maxParticipants}</div>
                  <div className={styles.statLabel}>Máximo</div>
                </div>
                <div className={styles.statItem}>
                  <div 
                    className={styles.statNumber}
                    style={{ color: getStatusColor(liveClass.status) }}
                  >
                    {getStatusLabel(liveClass.status)}
                  </div>
                  <div className={styles.statLabel}>Estado</div>
                </div>
              </div>

              <div className={styles.classActions}>
                {liveClass.status === 'scheduled' ? (
                  <button 
                    className={`${styles.classAction} ${styles.start}`}
                    onClick={() => startClass(liveClass)}
                  >
                    <Play size={14} />
                    Iniciar
                  </button>
                ) : liveClass.status === 'live' ? (
                  <button 
                    className={`${styles.classAction} ${styles.join}`}
                    onClick={() => joinClass(liveClass)}
                  >
                    <Video size={14} />
                    Unirse
                  </button>
                ) : (
                  <button 
                    className={`${styles.classAction} ${styles.edit}`}
                    disabled
                  >
                    Finalizada
                  </button>
                )}

                <button 
                  className={`${styles.classAction} ${styles.edit}`}
                  onClick={() => editClass(liveClass)}
                >
                  <Edit size={14} />
                  Editar
                </button>

                <button 
                  className={`${styles.classAction} ${styles.edit}`}
                  onClick={() => deleteClass(liveClass.id)}
                  style={{ color: '#ef4444' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveClassesManager;
