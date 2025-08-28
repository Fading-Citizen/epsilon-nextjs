'use client'

import React, { useState } from 'react';
import { Users, Plus, Search, Edit, Trash2, Settings, BookOpen, UserCheck, Shield } from 'lucide-react';
import styles from './GroupManager.module.css';

interface Group {
  id: string;
  name: string;
  description: string;
  color: string;
  studentCount: number;
  courseCount: number;
  permissions: string[];
  createdAt: string;
  isActive: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'interaction' | 'assessment' | 'admin';
}

interface GroupManagerProps {
  onBack?: () => void;
  onNavigateToStudents?: () => void;
}

const GroupManager: React.FC<GroupManagerProps> = ({ onBack, onNavigateToStudents }) => {
  const [groups, setGroups] = useState<Group[]>([
    {
      id: '1',
      name: 'Premium',
      description: 'Estudiantes con acceso completo a todos los cursos y funcionalidades premium',
      color: '#8b5cf6',
      studentCount: 25,
      courseCount: 12,
      permissions: ['full_access', 'live_classes', 'priority_support', 'advanced_content'],
      createdAt: '2025-01-15',
      isActive: true
    },
    {
      id: '2',
      name: 'Básico',
      description: 'Acceso estándar a cursos fundamentales y contenido básico',
      color: '#10b981',
      studentCount: 45,
      courseCount: 6,
      permissions: ['basic_content', 'forums', 'assignments'],
      createdAt: '2025-01-20',
      isActive: true
    },
    {
      id: '3',
      name: 'Matemáticas Avanzado',
      description: 'Grupo especializado para estudiantes de matemáticas de nivel avanzado',
      color: '#3b82f6',
      studentCount: 18,
      courseCount: 8,
      permissions: ['advanced_content', 'live_classes', 'peer_collaboration'],
      createdAt: '2025-02-01',
      isActive: true
    },
    {
      id: '4',
      name: 'Física General',
      description: 'Estudiantes de cursos de física general y experimental',
      color: '#f59e0b',
      studentCount: 32,
      courseCount: 5,
      permissions: ['basic_content', 'lab_access', 'forums'],
      createdAt: '2025-02-05',
      isActive: true
    }
  ]);

  const [permissions] = useState<Permission[]>([
    { id: 'full_access', name: 'Acceso Completo', description: 'Acceso a todo el contenido y funcionalidades', category: 'admin' },
    { id: 'basic_content', name: 'Contenido Básico', description: 'Acceso a lecciones y materiales básicos', category: 'content' },
    { id: 'advanced_content', name: 'Contenido Avanzado', description: 'Acceso a materiales y cursos avanzados', category: 'content' },
    { id: 'live_classes', name: 'Clases en Vivo', description: 'Participación en sesiones en vivo', category: 'interaction' },
    { id: 'forums', name: 'Foros', description: 'Participación en discusiones y foros', category: 'interaction' },
    { id: 'assignments', name: 'Tareas', description: 'Acceso a tareas y ejercicios', category: 'assessment' },
    { id: 'priority_support', name: 'Soporte Prioritario', description: 'Atención prioritaria del equipo de soporte', category: 'admin' },
    { id: 'lab_access', name: 'Acceso a Laboratorios', description: 'Uso de laboratorios virtuales y simuladores', category: 'content' },
    { id: 'peer_collaboration', name: 'Colaboración Entre Pares', description: 'Herramientas de trabajo colaborativo', category: 'interaction' }
  ]);

  const [showEditor, setShowEditor] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const colorOptions = [
    '#8b5cf6', '#10b981', '#3b82f6', '#f59e0b',
    '#ef4444', '#ec4899', '#14b8a6', '#f97316',
    '#84cc16', '#6366f1', '#8b5a2b', '#6b7280'
  ];

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && group.isActive) ||
                         (statusFilter === 'inactive' && !group.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const createNewGroup = () => {
    setEditingGroup(null);
    setShowEditor(true);
  };

  const editGroup = (group: Group) => {
    setEditingGroup(group);
    setShowEditor(true);
  };

  const saveGroup = (groupData: Partial<Group>) => {
    if (editingGroup) {
      // Update existing group
      setGroups(prev => 
        prev.map(g => g.id === editingGroup.id ? { ...g, ...groupData } : g)
      );
    } else {
      // Create new group
      const newGroup: Group = {
        id: Date.now().toString(),
        name: '',
        description: '',
        color: colorOptions[0],
        studentCount: 0,
        courseCount: 0,
        permissions: [],
        createdAt: new Date().toISOString().split('T')[0],
        isActive: true,
        ...groupData
      } as Group;
      setGroups(prev => [...prev, newGroup]);
    }
    setShowEditor(false);
    setEditingGroup(null);
  };

  const deleteGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group && group.studentCount > 0) {
      alert(`No se puede eliminar el grupo "${group.name}" porque tiene ${group.studentCount} estudiantes asignados.`);
      return;
    }
    
    if (confirm('¿Estás seguro de que quieres eliminar este grupo?')) {
      setGroups(prev => prev.filter(g => g.id !== groupId));
    }
  };

  const getPermissionName = (permissionId: string) => {
    const permission = permissions.find(p => p.id === permissionId);
    return permission?.name || permissionId;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const GroupEditor = () => {
    const [formData, setFormData] = useState<Partial<Group>>(
      editingGroup || {
        name: '',
        description: '',
        color: colorOptions[0],
        permissions: [],
        isActive: true
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name?.trim()) {
        alert('El nombre del grupo es requerido');
        return;
      }
      saveGroup(formData);
    };

    const togglePermission = (permissionId: string) => {
      const currentPermissions = formData.permissions || [];
      const updatedPermissions = currentPermissions.includes(permissionId)
        ? currentPermissions.filter(p => p !== permissionId)
        : [...currentPermissions, permissionId];
      
      setFormData(prev => ({ ...prev, permissions: updatedPermissions }));
    };

    const permissionsByCategory = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);

    const categoryLabels = {
      content: 'Contenido',
      interaction: 'Interacción',
      assessment: 'Evaluación',
      admin: 'Administración'
    };

    return (
      <div className={styles.groupEditor}>
        <div className={styles.editorHeader}>
          <h3>{editingGroup ? 'Editar Grupo' : 'Nuevo Grupo'}</h3>
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
              <label>Nombre del grupo *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Premium, Básico, Matemáticas Avanzado"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Estado</label>
              <select
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Descripción</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe el propósito y características de este grupo..."
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Color del grupo</label>
            <div className={styles.colorPicker}>
              {colorOptions.map(color => (
                <div
                  key={color}
                  className={`${styles.colorOption} ${formData.color === color ? styles.selected : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>

          <div className={styles.permissionsSection}>
            <label>Permisos del grupo</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1rem 0' }}>
              Selecciona los permisos que tendrán los estudiantes de este grupo
            </p>
            
            {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
              <div key={category} style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ 
                  color: 'var(--text-primary)', 
                  fontSize: '1rem', 
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Shield size={16} />
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h4>
                <div className={styles.permissionsGrid}>
                  {categoryPermissions.map(permission => (
                    <div key={permission.id} className={styles.permissionItem}>
                      <input
                        type="checkbox"
                        checked={(formData.permissions || []).includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                      />
                      <div className={styles.permissionLabel}>
                        <strong>{permission.name}</strong>
                        <span>{permission.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className={styles.groupManager}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Gestión de Grupos</h2>
          <p>Organiza estudiantes en grupos con permisos específicos</p>
        </div>
        <div className={styles.headerActions}>
          {onNavigateToStudents && (
            <button 
              className={`${styles.actionBtn} ${styles.secondary}`}
              onClick={onNavigateToStudents}
            >
              <Users size={16} />
              Gestionar Estudiantes
            </button>
          )}
          <button 
            className={`${styles.actionBtn} ${styles.primary}`}
            onClick={createNewGroup}
          >
            <Plus size={16} />
            Nuevo Grupo
          </button>
        </div>
      </div>

      {showEditor && <GroupEditor />}

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
            {groups.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Total Grupos
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
            {groups.filter(g => g.isActive).length}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Grupos Activos
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
            {groups.reduce((acc, g) => acc + g.studentCount, 0)}
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
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {Math.round(groups.reduce((acc, g) => acc + g.permissions.length, 0) / groups.length || 0)}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Permisos Promedio
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
            placeholder="Buscar grupos..."
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
        </select>
      </div>

      <div className={styles.groupsGrid}>
        {filteredGroups.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={48} />
            <h3>No hay grupos disponibles</h3>
            <p>Comienza creando tu primer grupo de estudiantes</p>
          </div>
        ) : (
          filteredGroups.map(group => (
            <div key={group.id} className={styles.groupCard}>
              <div className={styles.groupHeader}>
                <div 
                  className={styles.groupColor}
                  style={{ backgroundColor: group.color }}
                >
                  {getInitials(group.name)}
                </div>
                <div className={styles.groupInfo}>
                  <h3>{group.name}</h3>
                  <p>{group.description}</p>
                </div>
              </div>

              <div className={styles.groupStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{group.studentCount}</span>
                  <span className={styles.statLabel}>Estudiantes</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{group.courseCount}</span>
                  <span className={styles.statLabel}>Cursos</span>
                </div>
              </div>

              <div className={styles.groupPermissions}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  marginBottom: '0.5rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem'
                }}>
                  <Settings size={14} />
                  Permisos ({group.permissions.length})
                </div>
                <div className={styles.permissionsList}>
                  {group.permissions.slice(0, 3).map(permissionId => (
                    <span key={permissionId} className={styles.permissionBadge}>
                      {getPermissionName(permissionId)}
                    </span>
                  ))}
                  {group.permissions.length > 3 && (
                    <span className={styles.permissionBadge}>
                      +{group.permissions.length - 3} más
                    </span>
                  )}
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '1rem 0',
                padding: '0.5rem',
                background: group.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}>
                <UserCheck size={14} />
                <span style={{ color: group.isActive ? '#10b981' : '#6b7280' }}>
                  {group.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className={styles.groupActions}>
                <button 
                  className={`${styles.groupAction} ${styles.edit}`}
                  onClick={() => editGroup(group)}
                  title="Editar grupo"
                >
                  <Edit size={14} />
                </button>
                <button 
                  className={`${styles.groupAction} ${styles.delete}`}
                  onClick={() => deleteGroup(group.id)}
                  title="Eliminar grupo"
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

export default GroupManager;