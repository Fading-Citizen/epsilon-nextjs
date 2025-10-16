"use client";

import React, { useState } from 'react';
import { Plus, X, Edit2, Trash2, Eye, EyeOff, Save, Package, Users, DollarSign, Calendar, Search, Filter } from 'lucide-react';

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  activo: boolean;
  precio?: number;
  duracion?: string;
  categoria: string;
  usuariosActivos?: number;
  fechaCreacion: string;
  features?: string[];
}

const iconosDisponibles = [
  '📚', '🎓', '📝', '🏆', '💼', '🔬', '🎯', '⚡', 
  '🚀', '💡', '🎨', '🔧', '📊', '💰', '🌟', '🔥'
];

const categoriasServicio = [
  'ICFES',
  'Saber Pro', 
  'Admisiones',
  'Corporativo',
  'Cursos Especializados'
];

const coloresPredefinidos = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
  '#6366f1', '#8b5cf6', '#ec4899', '#f97316',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#a855f7'
];

export default function ServicesManager() {
  // Estado
  const [servicios, setServicios] = useState<Servicio[]>([
    {
      id: '1',
      nombre: 'ICFES',
      descripcion: 'Preparación completa para el examen ICFES con simulacros y clases especializadas',
      icono: '📚',
      color: '#3b82f6',
      activo: true,
      precio: 120000,
      duracion: '3 meses',
      categoria: 'ICFES',
      usuariosActivos: 245,
      fechaCreacion: '2025-01-15',
      features: ['Simulacros ilimitados', 'Clases en vivo', 'Material descargable', 'Seguimiento personalizado']
    },
    {
      id: '2',
      nombre: 'Saber Pro',
      descripcion: 'Curso integral de preparación para examen Saber Pro universitario',
      icono: '🎓',
      color: '#10b981',
      activo: true,
      precio: 150000,
      duracion: '4 meses',
      categoria: 'Saber Pro',
      usuariosActivos: 189,
      fechaCreacion: '2025-01-20',
      features: ['Razonamiento cuantitativo', 'Competencias ciudadanas', 'Lectura crítica', 'Inglés']
    },
    {
      id: '3',
      nombre: 'Admisiones Universitarias',
      descripcion: 'Preparación especializada para exámenes de admisión a las mejores universidades',
      icono: '🏆',
      color: '#f59e0b',
      activo: true,
      precio: 180000,
      duracion: '5 meses',
      categoria: 'Admisiones',
      usuariosActivos: 156,
      fechaCreacion: '2025-02-01',
      features: ['Matemáticas avanzadas', 'Física', 'Química', 'Biología', 'Simulacros por universidad']
    },
    {
      id: '4',
      nombre: 'Cursos Especializados',
      descripcion: 'Cursos avanzados en áreas específicas de conocimiento',
      icono: '💼',
      color: '#8b5cf6',
      activo: true,
      precio: 95000,
      duracion: '2 meses',
      categoria: 'Cursos Especializados',
      usuariosActivos: 312,
      fechaCreacion: '2025-02-10',
      features: ['Contenido especializado', 'Certificación', 'Tutorías personalizadas']
    },
    {
      id: '5',
      nombre: 'Corporativo',
      descripcion: 'Soluciones empresariales y capacitación corporativa personalizada',
      icono: '💼',
      color: '#ef4444',
      activo: false,
      precio: 500000,
      duracion: '12 meses',
      categoria: 'Corporativo',
      usuariosActivos: 42,
      fechaCreacion: '2025-03-01',
      features: ['Planes empresariales', 'Reportes detallados', 'API de integración', 'Soporte dedicado']
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Servicio | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [filterCategoria, setFilterCategoria] = useState<string>('todos');

  // Nuevo servicio
  const [nuevoServicio, setNuevoServicio] = useState<Partial<Servicio>>({
    nombre: '',
    descripcion: '',
    icono: '📚',
    color: '#3b82f6',
    activo: true,
    precio: 0,
    duracion: '',
    categoria: 'ICFES',
    features: []
  });

  const [newFeature, setNewFeature] = useState('');

  // Filtros
  const serviciosFiltrados = servicios.filter(servicio => {
    const matchesSearch = servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         servicio.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActivo = filterActivo === 'todos' || 
                         (filterActivo === 'activos' && servicio.activo) ||
                         (filterActivo === 'inactivos' && !servicio.activo);
    const matchesCategoria = filterCategoria === 'todos' || servicio.categoria === filterCategoria;
    
    return matchesSearch && matchesActivo && matchesCategoria;
  });

  // Estadísticas
  const stats = {
    total: servicios.length,
    activos: servicios.filter(s => s.activo).length,
    inactivos: servicios.filter(s => !s.activo).length,
    totalUsuarios: servicios.reduce((sum, s) => sum + (s.usuariosActivos || 0), 0),
    ingresosMensuales: servicios.reduce((sum, s) => sum + (s.activo ? (s.precio || 0) * (s.usuariosActivos || 0) : 0), 0)
  };

  // Handlers
  const handleOpenModal = (servicio?: Servicio) => {
    if (servicio) {
      setEditingService(servicio);
      setNuevoServicio(servicio);
    } else {
      setEditingService(null);
      setNuevoServicio({
        nombre: '',
        descripcion: '',
        icono: '📚',
        color: '#3b82f6',
        activo: true,
        precio: 0,
        duracion: '',
        categoria: 'ICFES',
        features: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setNuevoServicio({
      nombre: '',
      descripcion: '',
      icono: '📚',
      color: '#3b82f6',
      activo: true,
      precio: 0,
      duracion: '',
      categoria: 'ICFES',
      features: []
    });
    setNewFeature('');
  };

  const handleSaveService = () => {
    if (!nuevoServicio.nombre || !nuevoServicio.descripcion) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (editingService) {
      // Editar servicio existente
      setServicios(prev => prev.map(s => 
        s.id === editingService.id 
          ? { ...s, ...nuevoServicio } as Servicio
          : s
      ));
    } else {
      // Crear nuevo servicio
      const newService: Servicio = {
        id: Date.now().toString(),
        nombre: nuevoServicio.nombre!,
        descripcion: nuevoServicio.descripcion!,
        icono: nuevoServicio.icono!,
        color: nuevoServicio.color!,
        activo: nuevoServicio.activo!,
        precio: nuevoServicio.precio,
        duracion: nuevoServicio.duracion,
        categoria: nuevoServicio.categoria!,
        usuariosActivos: 0,
        fechaCreacion: new Date().toISOString().split('T')[0],
        features: nuevoServicio.features
      };
      setServicios(prev => [...prev, newService]);
    }

    handleCloseModal();
  };

  const handleToggleActive = (id: string) => {
    setServicios(prev => prev.map(s => 
      s.id === id ? { ...s, activo: !s.activo } : s
    ));
  };

  const handleDeleteService = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer.')) {
      setServicios(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setNuevoServicio(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setNuevoServicio(prev => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestión de Servicios</h1>
          <p style={styles.subtitle}>Administra los servicios y productos disponibles para tus estudiantes</p>
        </div>
        <button onClick={() => handleOpenModal()} style={styles.primaryButton}>
          <Plus size={18} />
          Crear Servicio
        </button>
      </div>

      {/* Estadísticas */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderLeft: '4px solid #3b82f6'}}>
          <div style={styles.statIcon}>
            <Package size={24} color="#3b82f6" />
          </div>
          <div>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Total Servicios</div>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderLeft: '4px solid #10b981'}}>
          <div style={styles.statIcon}>
            <Eye size={24} color="#10b981" />
          </div>
          <div>
            <div style={styles.statValue}>{stats.activos}</div>
            <div style={styles.statLabel}>Servicios Activos</div>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderLeft: '4px solid #f59e0b'}}>
          <div style={styles.statIcon}>
            <Users size={24} color="#f59e0b" />
          </div>
          <div>
            <div style={styles.statValue}>{stats.totalUsuarios.toLocaleString()}</div>
            <div style={styles.statLabel}>Usuarios Activos</div>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderLeft: '4px solid #8b5cf6'}}>
          <div style={styles.statIcon}>
            <DollarSign size={24} color="#8b5cf6" />
          </div>
          <div>
            <div style={styles.statValue}>${(stats.ingresosMensuales / 1000000).toFixed(1)}M</div>
            <div style={styles.statLabel}>Ingresos Mensuales</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={styles.filtersContainer}>
        <div style={styles.searchBox}>
          <Search size={18} color="#6b7280" />
          <input
            type="text"
            placeholder="Buscar servicios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterGroup}>
          <Filter size={18} color="#6b7280" />
          <select 
            value={filterActivo} 
            onChange={(e) => setFilterActivo(e.target.value as any)}
            style={styles.select}
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>

          <select 
            value={filterCategoria} 
            onChange={(e) => setFilterCategoria(e.target.value)}
            style={styles.select}
          >
            <option value="todos">Todas las categorías</option>
            {categoriasServicio.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de servicios */}
      <div style={styles.servicesGrid}>
        {serviciosFiltrados.map(servicio => (
          <div key={servicio.id} style={{
            ...styles.serviceCard,
            opacity: servicio.activo ? 1 : 0.6
          }}>
            {/* Header de la tarjeta */}
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderLeft}>
                <div style={{
                  ...styles.iconCircle,
                  background: `${servicio.color}20`,
                  color: servicio.color
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{servicio.icono}</span>
                </div>
                <div>
                  <h3 style={styles.serviceName}>{servicio.nombre}</h3>
                  <span style={{
                    ...styles.badge,
                    background: servicio.activo ? '#10b98120' : '#ef444420',
                    color: servicio.activo ? '#10b981' : '#ef4444'
                  }}>
                    {servicio.activo ? '● Activo' : '● Inactivo'}
                  </span>
                </div>
              </div>
              
              <div style={styles.cardActions}>
                <button
                  onClick={() => handleToggleActive(servicio.id)}
                  style={styles.iconButton}
                  title={servicio.activo ? 'Desactivar' : 'Activar'}
                >
                  {servicio.activo ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => handleOpenModal(servicio)}
                  style={styles.iconButton}
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteService(servicio.id)}
                  style={{...styles.iconButton, color: '#ef4444'}}
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Descripción */}
            <p style={styles.serviceDescription}>{servicio.descripcion}</p>

            {/* Categoría */}
            <div style={styles.categoryBadge}>
              <span style={{
                padding: '0.25rem 0.75rem',
                background: `${servicio.color}15`,
                color: servicio.color,
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {servicio.categoria}
              </span>
            </div>

            {/* Features */}
            {servicio.features && servicio.features.length > 0 && (
              <div style={styles.featuresContainer}>
                {servicio.features.slice(0, 3).map((feature, idx) => (
                  <div key={idx} style={styles.featureItem}>
                    <span style={{ color: servicio.color }}>✓</span> {feature}
                  </div>
                ))}
                {servicio.features.length > 3 && (
                  <div style={styles.moreFeatures}>+{servicio.features.length - 3} más</div>
                )}
              </div>
            )}

            {/* Footer con estadísticas */}
            <div style={styles.cardFooter}>
              <div style={styles.footerStat}>
                <Users size={14} />
                <span>{servicio.usuariosActivos} usuarios</span>
              </div>
              <div style={styles.footerStat}>
                <DollarSign size={14} />
                <span>${servicio.precio?.toLocaleString()}</span>
              </div>
              <div style={styles.footerStat}>
                <Calendar size={14} />
                <span>{servicio.duracion}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {serviciosFiltrados.length === 0 && (
        <div style={styles.emptyState}>
          <Package size={48} color="#9ca3af" />
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>
            No se encontraron servicios que coincidan con los filtros
          </p>
        </div>
      )}

      {/* Modal de crear/editar servicio */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingService ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
              </h2>
              <button onClick={handleCloseModal} style={styles.closeButton}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Nombre */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre del Servicio *</label>
                <input
                  type="text"
                  value={nuevoServicio.nombre}
                  onChange={(e) => setNuevoServicio(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: ICFES Premium"
                  style={styles.input}
                />
              </div>

              {/* Descripción */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Descripción *</label>
                <textarea
                  value={nuevoServicio.descripcion}
                  onChange={(e) => setNuevoServicio(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe el servicio..."
                  rows={3}
                  style={{...styles.input, resize: 'vertical' as const}}
                />
              </div>

              {/* Categoría */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Categoría *</label>
                <select
                  value={nuevoServicio.categoria}
                  onChange={(e) => setNuevoServicio(prev => ({ ...prev, categoria: e.target.value }))}
                  style={styles.input}
                >
                  {categoriasServicio.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Icono */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Icono</label>
                <div style={styles.iconGrid}>
                  {iconosDisponibles.map(icono => (
                    <button
                      key={icono}
                      onClick={() => setNuevoServicio(prev => ({ ...prev, icono }))}
                      style={{
                        ...styles.iconOption,
                        border: nuevoServicio.icono === icono ? `2px solid ${nuevoServicio.color}` : '2px solid transparent'
                      }}
                    >
                      {icono}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Color</label>
                <div style={styles.colorGrid}>
                  {coloresPredefinidos.map(color => (
                    <button
                      key={color}
                      onClick={() => setNuevoServicio(prev => ({ ...prev, color }))}
                      style={{
                        ...styles.colorOption,
                        background: color,
                        border: nuevoServicio.color === color ? '3px solid #1f2937' : '3px solid transparent'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Precio y Duración */}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Precio (COP)</label>
                  <input
                    type="number"
                    value={nuevoServicio.precio}
                    onChange={(e) => setNuevoServicio(prev => ({ ...prev, precio: Number(e.target.value) }))}
                    placeholder="120000"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Duración</label>
                  <input
                    type="text"
                    value={nuevoServicio.duracion}
                    onChange={(e) => setNuevoServicio(prev => ({ ...prev, duracion: e.target.value }))}
                    placeholder="3 meses"
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Features */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Características Incluidas</label>
                <div style={styles.featureInputGroup}>
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    placeholder="Agregar característica..."
                    style={styles.input}
                  />
                  <button onClick={handleAddFeature} style={styles.addButton}>
                    <Plus size={16} />
                  </button>
                </div>
                
                {nuevoServicio.features && nuevoServicio.features.length > 0 && (
                  <div style={styles.featuresList}>
                    {nuevoServicio.features.map((feature, idx) => (
                      <div key={idx} style={styles.featureTag}>
                        <span>{feature}</span>
                        <button onClick={() => handleRemoveFeature(idx)} style={styles.removeFeatureButton}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Estado */}
              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={nuevoServicio.activo}
                    onChange={(e) => setNuevoServicio(prev => ({ ...prev, activo: e.target.checked }))}
                    style={styles.checkbox}
                  />
                  <span>Servicio activo (visible para estudiantes)</span>
                </label>
              </div>

              {/* Preview */}
              <div style={styles.previewSection}>
                <label style={styles.label}>Vista Previa</label>
                <div style={{
                  ...styles.previewCard,
                  borderLeft: `4px solid ${nuevoServicio.color}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '2rem' }}>{nuevoServicio.icono}</span>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1.125rem' }}>{nuevoServicio.nombre || 'Nombre del servicio'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{nuevoServicio.categoria}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    {nuevoServicio.descripcion || 'Descripción del servicio...'}
                  </p>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={handleCloseModal} style={styles.secondaryButton}>
                Cancelar
              </button>
              <button onClick={handleSaveService} style={styles.primaryButton}>
                <Save size={18} />
                {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
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
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: 0,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
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
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '0.875rem',
    color: '#111827'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  select: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    fontSize: '0.875rem',
    color: '#111827',
    cursor: 'pointer',
    outline: 'none'
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  },
  serviceCard: {
    background: '#ffffff',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  },
  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1
  },
  iconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  serviceName: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827'
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'inline-block',
    marginTop: '0.25rem'
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
    justifyContent: 'center',
    color: '#6b7280',
    transition: 'all 0.2s'
  },
  serviceDescription: {
    fontSize: '0.875rem',
    color: '#6b7280',
    lineHeight: '1.5',
    marginBottom: '1rem'
  },
  categoryBadge: {
    marginBottom: '1rem'
  },
  featuresContainer: {
    background: '#f9fafb',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem'
  },
  featureItem: {
    fontSize: '0.8rem',
    color: '#374151',
    marginBottom: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  moreFeatures: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontStyle: 'italic' as const,
    marginTop: '0.25rem'
  },
  cardFooter: {
    display: 'flex',
    gap: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb'
  },
  footerStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    color: '#6b7280'
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
    gap: '0.5rem',
    transition: 'transform 0.2s'
  },
  secondaryButton: {
    background: '#f3f4f6',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
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
    maxWidth: '700px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column' as const,
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
    fontWeight: '700',
    color: '#111827'
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    color: '#6b7280'
  },
  modalBody: {
    padding: '1.5rem',
    overflowY: 'auto' as const,
    flex: 1
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
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
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
    color: '#111827',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '0.5rem'
  },
  iconOption: {
    padding: '0.75rem',
    background: '#f9fafb',
    border: '2px solid transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.25rem',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '0.5rem'
  },
  colorOption: {
    width: '100%',
    aspectRatio: '1',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  featureInputGroup: {
    display: 'flex',
    gap: '0.5rem'
  },
  addButton: {
    background: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  featuresList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    marginTop: '0.75rem'
  },
  featureTag: {
    background: '#f3f4f6',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  removeFeatureButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.125rem',
    display: 'flex',
    alignItems: 'center',
    color: '#6b7280'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#374151',
    cursor: 'pointer'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  previewSection: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '8px'
  },
  previewCard: {
    background: '#ffffff',
    padding: '1rem',
    borderRadius: '8px',
    marginTop: '0.75rem'
  }
};
