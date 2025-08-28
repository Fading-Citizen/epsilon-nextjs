'use client'

import React, { useState } from 'react';
import { Users, Plus, Search, Grid, List, Edit, Trash2, Mail, Calendar, BookOpen, UserCheck, Shield } from 'lucide-react';
import styles from './StudentManager.module.css';

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'suspended';
  groups: string[];
  courses: string[];
  progress: number;
  lastActivity: string;
}

interface Group {
  id: string;
  name: string;
  color: string;
  studentCount: number;
}

interface StudentManagerProps {
  onBack?: () => void;
  onNavigateToGroups?: () => void;
}

const StudentManager: React.FC<StudentManagerProps> = ({ onBack, onNavigateToGroups }) => {
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'Ana García Rodríguez',
      email: 'ana.garcia@email.com',
      phone: '+1 555-0123',
      enrollmentDate: '2025-01-15',
      status: 'active',
      groups: ['premium', 'matematicas-avanzado'],
      courses: ['Cálculo Diferencial', 'Álgebra Lineal'],
      progress: 85,
      lastActivity: '2025-08-27'
    },
    {
      id: '2',
      name: 'Carlos López Mesa',
      email: 'carlos.lopez@email.com',
      phone: '+1 555-0124',
      enrollmentDate: '2025-02-01',
      status: 'active',
      groups: ['basico', 'fisica-general'],
      courses: ['Física Básica', 'Matemáticas Fundamentales'],
      progress: 62,
      lastActivity: '2025-08-26'
    },
    {
      id: '3',
      name: 'María Fernández Silva',
      email: 'maria.fernandez@email.com',
      enrollmentDate: '2025-01-20',
      status: 'inactive',
      groups: ['premium'],
      courses: ['Química Orgánica'],
      progress: 45,
      lastActivity: '2025-08-20'
    }
  ]);

  const [groups] = useState<Group[]>([
    { id: 'premium', name: 'Premium', color: '#8b5cf6', studentCount: 25 },
    { id: 'basico', name: 'Básico', color: '#10b981', studentCount: 45 },
    { id: 'matematicas-avanzado', name: 'Matemáticas Avanzado', color: '#3b82f6', studentCount: 18 },
    { id: 'fisica-general', name: 'Física General', color: '#f59e0b', studentCount: 32 }
  ]);

  const [showEditor, setShowEditor] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesGroup = groupFilter === 'all' || student.groups.includes(groupFilter);
    
    return matchesSearch && matchesStatus && matchesGroup;
  });

  const createNewStudent = () => {
    setEditingStudent(null);
    setShowEditor(true);
  };

  const editStudent = (student: Student) => {
    setEditingStudent(student);
    setShowEditor(true);
  };

  const saveStudent = (studentData: Partial<Student>) => {
    if (editingStudent) {
      // Update existing student
      setStudents(prev => 
        prev.map(s => s.id === editingStudent.id ? { ...s, ...studentData } : s)
      );
    } else {
      // Create new student
      const newStudent: Student = {
        id: Date.now().toString(),
        name: '',
        email: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'active',
        groups: [],
        courses: [],
        progress: 0,
        lastActivity: new Date().toISOString().split('T')[0],
        ...studentData
      } as Student;
      setStudents(prev => [...prev, newStudent]);
    }
    setShowEditor(false);
    setEditingStudent(null);
  };

  const deleteStudent = (studentId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este estudiante?')) {
      setStudents(prev => prev.filter(s => s.id !== studentId));
    }
  };

  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'suspended': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: Student['status']) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'suspended': return 'Suspendido';
      default: return 'Desconocido';
    }
  };

  const getGroupColor = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    return group?.color || '#6b7280';
  };

  const getGroupName = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    return group?.name || groupId;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const StudentEditor = () => {
    const [formData, setFormData] = useState<Partial<Student>>(
      editingStudent || {
        name: '',
        email: '',
        phone: '',
        status: 'active',
        groups: [],
        courses: []
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      saveStudent(formData);
    };

    const toggleGroup = (groupId: string) => {
      const currentGroups = formData.groups || [];
      const updatedGroups = currentGroups.includes(groupId)
        ? currentGroups.filter(g => g !== groupId)
        : [...currentGroups, groupId];
      
      setFormData(prev => ({ ...prev, groups: updatedGroups }));
    };

    return (
      <div className={styles.studentEditor}>
        <div className={styles.editorHeader}>
          <h3>{editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}</h3>
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
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Nombre completo *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Ana García Rodríguez"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email *</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="ana.garcia@email.com"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Teléfono</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 555-0123"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Estado</label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Student['status'] }))}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="suspended">Suspendido</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Grupos</label>
            <div className={styles.groupSelector}>
              {groups.map(group => (
                <div
                  key={group.id}
                  className={`${styles.groupOption} ${(formData.groups || []).includes(group.id) ? styles.selected : ''}`}
                  onClick={() => toggleGroup(group.id)}
                >
                  <input
                    type="checkbox"
                    checked={(formData.groups || []).includes(group.id)}
                    onChange={() => toggleGroup(group.id)}
                  />
                  <span>{group.name}</span>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className={styles.studentManager}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Gestión de Estudiantes</h2>
          <p>Administra estudiantes, grupos y matriculaciones</p>
        </div>
        <div className={styles.headerActions}>
          {onNavigateToGroups && (
            <button 
              className={`${styles.actionBtn} ${styles.secondary}`}
              onClick={onNavigateToGroups}
            >
              <Shield size={16} />
              Gestionar Grupos
            </button>
          )}
          <button 
            className={`${styles.actionBtn} ${styles.primary}`}
            onClick={createNewStudent}
          >
            <Plus size={16} />
            Nuevo Estudiante
          </button>
        </div>
      </div>

      {showEditor && <StudentEditor />}

      {/* Estadísticas rápidas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {students.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Total Estudiantes
          </div>
        </div>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
            {students.filter(s => s.status === 'active').length}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Activos
          </div>
        </div>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length || 0)}%
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Progreso Promedio
          </div>
        </div>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {groups.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Grupos Disponibles
          </div>
        </div>
      </div>

      <div className={styles.filtersBar}>
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
            placeholder="Buscar estudiantes..."
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
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="suspended">Suspendidos</option>
        </select>

        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">Todos los grupos</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>

        <div className={styles.viewToggle}>
          <button 
            className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={16} />
          </button>
          <button 
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className={styles.studentsGrid}>
          {filteredStudents.length === 0 ? (
            <div className={styles.emptyState}>
              <Users size={48} />
              <h3>No hay estudiantes disponibles</h3>
              <p>Comienza agregando tu primer estudiante</p>
            </div>
          ) : (
            filteredStudents.map(student => (
              <div key={student.id} className={styles.studentCard}>
                <div className={styles.studentHeader}>
                  <div className={styles.studentAvatar}>
                    {getInitials(student.name)}
                  </div>
                  <div className={styles.studentInfo}>
                    <h3 className={styles.studentName}>{student.name}</h3>
                    <p className={styles.studentEmail}>{student.email}</p>
                  </div>
                </div>

                <div className={styles.studentMeta}>
                  <div className={styles.metaItem}>
                    <Calendar size={12} />
                    <span>Desde {new Date(student.enrollmentDate).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <BookOpen size={12} />
                    <span>{student.courses.length} cursos</span>
                  </div>
                  <div className={styles.metaItem}>
                    <UserCheck size={12} />
                    <span style={{ color: getStatusColor(student.status) }}>
                      {getStatusLabel(student.status)}
                    </span>
                  </div>
                </div>

                <div className={styles.studentGroups}>
                  {student.groups.map(groupId => (
                    <span 
                      key={groupId}
                      className={styles.groupBadge}
                      style={{ backgroundColor: getGroupColor(groupId) }}
                    >
                      {getGroupName(groupId)}
                    </span>
                  ))}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '1rem 0',
                  padding: '0.75rem',
                  background: 'var(--bg-primary)',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Progreso
                  </span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {student.progress}%
                  </span>
                </div>

                <div className={styles.studentActions}>
                  <button 
                    className={`${styles.studentAction} ${styles.edit}`}
                    onClick={() => editStudent(student)}
                    title="Editar estudiante"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    className={`${styles.studentAction} ${styles.edit}`}
                    title="Enviar email"
                  >
                    <Mail size={14} />
                  </button>
                  <button 
                    className={`${styles.studentAction} ${styles.delete}`}
                    onClick={() => deleteStudent(student.id)}
                    title="Eliminar estudiante"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className={styles.studentsList}>
          {filteredStudents.length === 0 ? (
            <div className={styles.emptyState}>
              <Users size={48} />
              <h3>No hay estudiantes disponibles</h3>
              <p>Comienza agregando tu primer estudiante</p>
            </div>
          ) : (
            filteredStudents.map(student => (
              <div key={student.id} className={styles.studentListItem}>
                <div className={styles.studentAvatar}>
                  {getInitials(student.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className={styles.studentName}>{student.name}</h3>
                  <p className={styles.studentEmail}>{student.email}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {student.courses.length} cursos
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {student.progress}%
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ 
                    color: getStatusColor(student.status),
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {getStatusLabel(student.status)}
                  </span>
                </div>
                <div className={styles.studentActions}>
                  <button 
                    className={`${styles.studentAction} ${styles.edit}`}
                    onClick={() => editStudent(student)}
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    className={`${styles.studentAction} ${styles.delete}`}
                    onClick={() => deleteStudent(student.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StudentManager;
