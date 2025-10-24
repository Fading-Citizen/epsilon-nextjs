"use client";

import React, { useState } from 'react';
import { Plus, X, Edit2, Trash2, Save, UserPlus, Users, Search, Filter, Mail, Shield, Power } from 'lucide-react';

interface Admin {
  id: string;
  nombre: string;
  email: string;
  especialidad: string;
  cursos: number;
  estudiantes: number;
  activo: boolean;
  fechaIngreso: string;
}

export default function UserManagement() {
  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: '1',
      nombre: 'Dr. Carlos García',
      email: 'carlos.garcia@epsilon.com',
      especialidad: 'Matemáticas',
      cursos: 5,
      estudiantes: 142,
      activo: true,
      fechaIngreso: '2024-01-15'
    },
    {
      id: '2',
      nombre: 'Dra. María López',
      email: 'maria.lopez@epsilon.com',
      especialidad: 'Física',
      cursos: 4,
      estudiantes: 98,
      activo: true,
      fechaIngreso: '2024-02-20'
    },
    {
      id: '3',
      nombre: 'Ing. Juan Martínez',
      email: 'juan.martinez@epsilon.com',
      especialidad: 'Química',
      cursos: 3,
      estudiantes: 76,
      activo: true,
      fechaIngreso: '2024-03-10'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState<'todos' | 'activos' | 'inactivos'>('todos');

  const [nuevoAdmin, setNuevoAdmin] = useState({
    nombre: '',
    email: '',
    especialidad: ''
  });

  const adminsFiltrados = admins.filter(admin => {
    const matchesSearch = admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActivo = filterActivo === 'todos' || 
                         (filterActivo === 'activos' && admin.activo) ||
                         (filterActivo === 'inactivos' && !admin.activo);
    
    return matchesSearch && matchesActivo;
  });

  const stats = {
    total: admins.length,
    activos: admins.filter(t => t.activo).length,
    totalCursos: admins.reduce((sum, t) => sum + t.cursos, 0),
    totalEstudiantes: admins.reduce((sum, t) => sum + t.estudiantes, 0)
  };

  const handleOpenModal = (admin?: Admin) => {
    if (admin) {
      setEditingAdmin(admin);
      setNuevoAdmin({
        nombre: admin.nombre,
        email: admin.email,
        especialidad: admin.especialidad
      });
    } else {
      setEditingAdmin(null);
      setNuevoAdmin({
        nombre: '',
        email: '',
        especialidad: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAdmin(null);
    setNuevoAdmin({
      nombre: '',
      email: '',
      especialidad: ''
    });
  };

  const handleSaveAdmin = () => {
    if (!nuevoAdmin.nombre || !nuevoAdmin.email) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (editingAdmin) {
      setAdmins(prev => prev.map(t => 
        t.id === editingAdmin.id 
          ? { ...t, ...nuevoAdmin }
          : t
      ));
    } else {
      const newAdmin: Admin = {
        id: Date.now().toString(),
        nombre: nuevoAdmin.nombre,
        email: nuevoAdmin.email,
        especialidad: nuevoAdmin.especialidad,
        cursos: 0,
        estudiantes: 0,
        activo: true,
        fechaIngreso: new Date().toISOString().split('T')[0]
      };
      setAdmins(prev => [...prev, newAdmin]);
    }

    handleCloseModal();
  };

  const handleToggleActive = (id: string) => {
    setAdmins(prev => prev.map(t => 
      t.id === id ? { ...t, activo: !t.activo } : t
    ));
  };

  const handleDeleteAdmin = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este administrador? Esta acción no se puede deshacer.')) {
      setAdmins(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestión de Administradores</h1>
          <p style={styles.subtitle}>Administra el equipo de administración de la plataforma</p>
        </div>
        <button onClick={() => handleOpenModal()} style={styles.primaryButton}>
          <UserPlus size={18} />
          Agregar Administrador
        </button>
      </div>

      {/* Estadísticas */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderLeft: '4px solid #3b82f6'}}>
          <Users size={24} color="#3b82f6" />
          <div>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Total Administradores</div>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderLeft: '4px solid #10b981'}}>
          <Shield size={24} color="#10b981" />
          <div>
            <div style={styles.statValue}>{stats.activos}</div>
            <div style={styles.statLabel}>Administradores Activos</div>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderLeft: '4px solid #f59e0b'}}>
          <div style={{ fontSize: '1.5rem' }}>📚</div>
          <div>
            <div style={styles.statValue}>{stats.totalCursos}</div>
            <div style={styles.statLabel}>Cursos Totales</div>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderLeft: '4px solid #8b5cf6'}}>
          <div style={{ fontSize: '1.5rem' }}>🎓</div>
          <div>
            <div style={styles.statValue}>{stats.totalEstudiantes}</div>
            <div style={styles.statLabel}>Estudiantes Totales</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={styles.filtersContainer}>
        <div style={styles.searchBox}>
          <Search size={18} color="#6b7280" />
          <input
            type="text"
            placeholder="Buscar administradores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <select 
          value={filterActivo} 
          onChange={(e) => setFilterActivo(e.target.value as 'todos' | 'activos' | 'inactivos')}
          style={styles.select}
        >
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
      </div>

      {/* Lista de administradores */}
      <div style={styles.teachersGrid}>
        {adminsFiltrados.map(admin => (
          <div key={admin.id} style={{
            ...styles.teacherCard,
            opacity: admin.activo ? 1 : 0.6
          }}>
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderLeft}>
                <div style={{
                  ...styles.avatar,
                  background: admin.activo ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : '#9ca3af'
                }}>
                  {admin.nombre.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 style={styles.teacherName}>{admin.nombre}</h3>
                  <p style={styles.teacherEmail}>
                    <Mail size={14} />
                    {admin.email}
                  </p>
                  <span style={{
                    ...styles.badge,
                    background: admin.activo ? '#10b98120' : '#ef444420',
                    color: admin.activo ? '#10b981' : '#ef4444'
                  }}>
                    {admin.activo ? '● Activo' : '● Inactivo'}
                  </span>
                </div>
              </div>
              
              <div style={styles.cardActions}>
                <button
                  onClick={() => handleToggleActive(admin.id)}
                  style={styles.iconButton}
                  title={admin.activo ? 'Desactivar' : 'Activar'}
                >
                  <Power size={16} />
                </button>
                <button
                  onClick={() => handleOpenModal(admin)}
                  style={styles.iconButton}
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteAdmin(admin.id)}
                  style={{...styles.iconButton, color: '#ef4444'}}
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div style={styles.specialtyBadge}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6366f1' }}>
                📖 {admin.especialidad}
              </span>
            </div>

            <div style={styles.cardFooter}>
              <div style={styles.footerStat}>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#3b82f6' }}>
                  {admin.cursos}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Cursos</span>
              </div>
              <div style={styles.footerStat}>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981' }}>
                  {admin.estudiantes}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Estudiantes</span>
              </div>
              <div style={styles.footerStat}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Desde {new Date(admin.fechaIngreso).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {adminsFiltrados.length === 0 && (
        <div style={styles.emptyState}>
          <Users size={48} color="#9ca3af" />
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>
            No se encontraron administradores que coincidan con los filtros
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingAdmin ? 'Editar Administrador' : 'Agregar Nuevo Administrador'}
              </h2>
              <button onClick={handleCloseModal} style={styles.closeButton}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre Completo *</label>
                <input
                  type="text"
                  value={nuevoAdmin.nombre}
                  onChange={(e) => setNuevoAdmin(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Dr. Carlos García"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  value={nuevoAdmin.email}
                  onChange={(e) => setNuevoAdmin(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@epsilon.com"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Especialidad</label>
                <input
                  type="text"
                  value={nuevoAdmin.especialidad}
                  onChange={(e) => setNuevoAdmin(prev => ({ ...prev, especialidad: e.target.value }))}
                  placeholder="Ej: Matemáticas"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={handleCloseModal} style={styles.secondaryButton}>
                Cancelar
              </button>
              <button onClick={handleSaveAdmin} style={styles.primaryButton}>
                <Save size={18} />
                {editingAdmin ? 'Guardar Cambios' : 'Crear Administrador'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto'
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
    margin: 0,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#6b7280',
    marginTop: '0.5rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  statCard: {
    background: '#ffffff',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#111827'
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '0.25rem'
  },
  filtersContainer: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const
  },
  searchBox: {
    flex: 1,
    minWidth: '250px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: '#ffffff',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '0.875rem'
  },
  select: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
  teachersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  },
  teacherCard: {
    background: '#ffffff',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e5e7eb'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  },
  cardHeaderLeft: {
    display: 'flex',
    gap: '1rem',
    flex: 1
  },
  avatar: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '1.125rem',
    flexShrink: 0
  },
  teacherName: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827'
  },
  teacherEmail: {
    margin: '0.25rem 0',
    fontSize: '0.875rem',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem'
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'inline-block',
    marginTop: '0.5rem'
  },
  cardActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  iconButton: {
    background: 'transparent',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    color: '#6b7280'
  },
  specialtyBadge: {
    background: '#f3f4f6',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb'
  },
  footerStat: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    color: '#9ca3af'
  },
  primaryButton: {
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
    gap: '0.5rem'
  },
  secondaryButton: {
    background: '#f3f4f6',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  },
  modal: {
    background: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  },
  modalHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '700'
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    color: '#6b7280'
  },
  modalBody: {
    padding: '1.5rem'
  },
  modalFooter: {
    padding: '1.5rem',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '0.875rem',
    outline: 'none'
  }
};
